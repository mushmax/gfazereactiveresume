import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ResumeDto } from "@reactive-resume/dto";
import type { ResumeData } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
import retry from "async-retry";
import { HeadingLevel, Paragraph, TextRun } from "docx";
import { PDFDocument } from "pdf-lib";
import { connect } from "puppeteer";

import { Config } from "../config/schema";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  private readonly browserURL: string;

  private readonly ignoreHTTPSErrors: boolean;

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly storageService: StorageService,
    private readonly httpService: HttpService,
  ) {
    const chromeUrl = this.configService.getOrThrow<string>("CHROME_URL");
    const chromeToken = this.configService.getOrThrow<string>("CHROME_TOKEN");

    this.browserURL = `${chromeUrl}?token=${chromeToken}`;
    this.ignoreHTTPSErrors = this.configService.getOrThrow<boolean>("CHROME_IGNORE_HTTPS_ERRORS");
  }

  private async getBrowser() {
    try {
      return await connect({
        browserWSEndpoint: this.browserURL,
        acceptInsecureCerts: this.ignoreHTTPSErrors,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        ErrorMessage.InvalidBrowserConnection,
        (error as Error).message,
      );
    }
  }

  async getVersion() {
    const browser = await this.getBrowser();
    const version = await browser.version();
    await browser.disconnect();
    return version;
  }

  async printResume(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry<string | undefined>(() => this.generateResume(resume), {
      retries: 3,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(`Retrying to print resume #${resume.id}, attempt #${attempt}`);
      },
    });

    const duration = Number(performance.now() - start).toFixed(0);
    const numberPages = resume.data.metadata.layout.length;

    this.logger.debug(`Chrome took ${duration}ms to print ${numberPages} page(s)`);

    return url;
  }

  async printPreview(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry(() => this.generatePreview(resume), {
      retries: 3,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(
          `Retrying to generate preview of resume #${resume.id}, attempt #${attempt}`,
        );
      },
    });

    const duration = Number(performance.now() - start).toFixed(0);

    this.logger.debug(`Chrome took ${duration}ms to generate preview`);

    return url;
  }

  async generateResume(resume: ResumeDto) {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
      const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

      let url = publicUrl;

      const isDockerEnvironment = process.env.DOCKER_ENVIRONMENT === "true";

      if (
        [publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url)) &&
        isDockerEnvironment
      ) {
        // Switch client URL from `http[s]://localhost[:port]` to `http[s]://host.docker.internal[:port]` in Docker environment
        // This is required because the browser is running in a container and the client is running on the host machine.
        url = url.replace(
          /localhost(:\d+)?/,
          (_match, port) => `host.docker.internal${port ?? ""}`,
        );

        await page.setRequestInterception(true);

        // Intercept requests of `localhost` to `host.docker.internal` in development
        page.on("request", (request) => {
          if (request.url().startsWith(storageUrl)) {
            const modifiedUrl = request
              .url()
              .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

            void request.continue({ url: modifiedUrl });
          } else {
            void request.continue();
          }
        });
      }

      if (!resume.data?.metadata?.layout) {
        this.logger.error("Invalid resume data structure for PDF generation", {
          resumeId: resume.id,
          hasData: !!resume.data,
        });
        throw new InternalServerErrorException("Invalid resume data structure for PDF generation");
      }

      if (!resume.data.metadata.template) {
        this.logger.warn("Resume data missing template, setting default template", {
          resumeId: resume.id,
        });
        resume.data.metadata.template = "azurill";
      }

      // Set the data of the resume to be printed in the browser's session storage
      const numberPages = resume.data.metadata.layout.length;

      await page.evaluateOnNewDocument((data) => {
        window.localStorage.setItem("resume", JSON.stringify(data));

        window.addEventListener("DOMContentLoaded", () => {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "resume",
              newValue: JSON.stringify(data),
              storageArea: window.localStorage,
            }),
          );

          window.dispatchEvent(new CustomEvent("resume-data-updated"));
        });
      }, resume.data);

      await page.goto(`${url}/artboard/preview`, { waitUntil: "networkidle0" });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        await page.waitForFunction(
          () => {
            const resumeData = window.localStorage.getItem("resume");
            if (!resumeData) {
              return false;
            }
            try {
              const parsed = JSON.parse(resumeData);
              return parsed?.metadata?.layout;
            } catch {
              return false;
            }
          },
          { timeout: 15_000 },
        );
      } catch (error) {
        this.logger.error("Timeout waiting for resume data in artboard", { error: error.message });
        throw new InternalServerErrorException("Artboard failed to load resume data");
      }

      await page.waitForSelector('[data-page="1"]', { timeout: 20_000 });

      const pagesBuffer: Buffer[] = [];

      const processPage = async (index: number) => {
        const pageElement = await page.$(`[data-page="${index}"]`);
        // eslint-disable-next-line unicorn/no-await-expression-member
        const width = (await (await pageElement?.getProperty("scrollWidth"))?.jsonValue()) ?? 0;
        // eslint-disable-next-line unicorn/no-await-expression-member
        const height = (await (await pageElement?.getProperty("scrollHeight"))?.jsonValue()) ?? 0;

        const temporaryHtml = await page.evaluate((element: HTMLDivElement) => {
          const clonedElement = element.cloneNode(true) as HTMLDivElement;
          const temporaryHtml_ = document.body.innerHTML;
          document.body.innerHTML = clonedElement.outerHTML;
          return temporaryHtml_;
        }, pageElement);

        // Apply custom CSS, if enabled
        const css = resume.data.metadata.css;

        if (css.visible) {
          await page.evaluate((cssValue: string) => {
            const styleTag = document.createElement("style");
            styleTag.textContent = cssValue;
            document.head.append(styleTag);
          }, css.value);
        }

        const uint8array = await page.pdf({ width, height, printBackground: true });
        const buffer = Buffer.from(uint8array);
        pagesBuffer.push(buffer);

        await page.evaluate((temporaryHtml_: string) => {
          document.body.innerHTML = temporaryHtml_;
        }, temporaryHtml);
      };

      // Loop through all the pages and print them, by first displaying them, printing the PDF and then hiding them back
      for (let index = 1; index <= numberPages; index++) {
        await processPage(index);
      }

      // Using 'pdf-lib', merge all the pages from their buffers into a single PDF
      const pdf = await PDFDocument.create();

      for (const element of pagesBuffer) {
        const page = await PDFDocument.load(element);
        const [copiedPage] = await pdf.copyPages(page, [0]);
        pdf.addPage(copiedPage);
      }

      // Save the PDF to storage and return the URL to download the resume
      // Store the URL in cache for future requests, under the previously generated hash digest
      const buffer = Buffer.from(await pdf.save());

      // This step will also save the resume URL in cache
      const resumeUrl = await this.storageService.uploadObject(
        resume.userId,
        "resumes",
        buffer,
        resume.title,
      );

      // Close all the pages and disconnect from the browser
      await page.close();
      await browser.disconnect();

      return resumeUrl;
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException(
        ErrorMessage.ResumePrinterError,
        (error as Error).message,
      );
    }
  }

  async generatePreview(resume: ResumeDto) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
    const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

    let url = publicUrl;

    const isDockerEnvironment = process.env.DOCKER_ENVIRONMENT === "true";

    if (
      [publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url)) &&
      isDockerEnvironment
    ) {
      // Switch client URL from `http[s]://localhost[:port]` to `http[s]://host.docker.internal[:port]` in Docker environment
      // This is required because the browser is running in a container and the client is running on the host machine.
      url = url.replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

      await page.setRequestInterception(true);

      // Intercept requests of `localhost` to `host.docker.internal` in Docker environment
      page.on("request", (request) => {
        if (request.url().startsWith(storageUrl)) {
          const modifiedUrl = request
            .url()
            .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

          void request.continue({ url: modifiedUrl });
        } else {
          void request.continue();
        }
      });
    }

    if (!resume.data?.metadata?.layout) {
      this.logger.error("Invalid resume data structure for preview generation", {
        resumeId: resume.id,
      });
      throw new InternalServerErrorException(
        "Invalid resume data structure for preview generation",
      );
    }

    // Set the data of the resume to be printed in the browser's session storage
    await page.evaluateOnNewDocument((data) => {
      window.localStorage.setItem("resume", JSON.stringify(data));
    }, resume.data);

    await page.setViewport({ width: 794, height: 1123 });

    await page.goto(`${url}/artboard/preview`, { waitUntil: "networkidle0" });

    await page.waitForFunction(
      () => {
        const resumeData = window.localStorage.getItem("resume");
        return resumeData && JSON.parse(resumeData).metadata;
      },
      { timeout: 10_000 },
    );

    // Save the JPEG to storage and return the URL
    // Store the URL in cache for future requests, under the previously generated hash digest
    const uint8array = await page.screenshot({ quality: 80, type: "jpeg" });
    const buffer = Buffer.from(uint8array);

    // Generate a hash digest of the resume data, this hash will be used to check if the resume has been updated
    const previewUrl = await this.storageService.uploadObject(
      resume.userId,
      "previews",
      buffer,
      resume.id,
    );

    // Close all the pages and disconnect from the browser
    await page.close();
    await browser.disconnect();

    return previewUrl;
  }

  async generateDocx(resume: ResumeDto) {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

      if (!resume.data?.metadata?.layout) {
        this.logger.error("Invalid resume data structure for DOCX generation", {
          resumeId: resume.id,
        });
        throw new InternalServerErrorException("Invalid resume data structure for DOCX generation");
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: resume.data.basics.name || "Resume",
                heading: HeadingLevel.TITLE,
                alignment: "center",
              }),
              new Paragraph({
                text: resume.data.basics.headline || "",
                heading: HeadingLevel.HEADING_2,
                alignment: "center",
              }),

              new Paragraph({
                children: [
                  new TextRun({ text: "Email: " }),
                  new TextRun({ text: resume.data.basics.email || "", bold: true }),
                  new TextRun({ text: " | Phone: " }),
                  new TextRun({ text: resume.data.basics.phone || "", bold: true }),
                  new TextRun({ text: " | Location: " }),
                  new TextRun({ text: resume.data.basics.location || "", bold: true }),
                ],
                alignment: "center",
              }),

              ...this.generateAllDocxSections(resume.data),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      const docxUrl = await this.storageService.uploadObject(
        resume.userId,
        "documents",
        Buffer.from(buffer),
        `${resume.title}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      this.logger.log(`Successfully generated DOCX for resume ${resume.id}`);
      return docxUrl;
    } catch (error) {
      this.logger.error(`Failed to generate DOCX for resume ${resume.id}`, {
        error: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(`DOCX generation failed: ${error.message}`);
    }
  }

  private generateAllDocxSections(data: ResumeData) {
    const sections: Paragraph[] = [];

    if (data.sections.summary.content) {
      sections.push(
        new Paragraph({
          text: "Summary",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: data.sections.summary.content,
        }),
        new Paragraph({ text: "" }), // spacing
      );
    }

    if (data.sections.experience.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Experience",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const exp of data.sections.experience.items) {
        if (!exp.visible) continue;
        const experienceParagraphs = [
          new Paragraph({
            children: [
              new TextRun({ text: exp.position || "", bold: true, size: 24 }),
              new TextRun({ text: ` at ${exp.company || ""}`, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: exp.date || "", italics: true }),
              new TextRun({ text: exp.location ? ` | ${exp.location}` : "" }),
            ],
          }),
        ];
        if (exp.summary) {
          experienceParagraphs.push(
            new Paragraph({
              text: exp.summary,
            }),
          );
        }
        experienceParagraphs.push(new Paragraph({ text: "" })); // spacing
        sections.push(...experienceParagraphs);
      }
    }

    if (data.sections.education.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const edu of data.sections.education.items) {
        if (!edu.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.area || "", bold: true, size: 24 }),
              new TextRun({ text: ` at ${edu.institution || ""}`, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: edu.date || "", italics: true }),
              new TextRun({ text: edu.score ? ` | ${edu.score}` : "" }),
            ],
          }),
        );
        if (edu.summary) {
          sections.push(
            new Paragraph({
              text: edu.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.skills.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      const skillNames = data.sections.skills.items
        .filter((skill: { visible: boolean }) => skill.visible)
        .map((skill: { name: string }) => skill.name)
        .join(", ");
      sections.push(
        new Paragraph({
          text: skillNames,
        }),
        new Paragraph({ text: "" }), // spacing
      );
    }

    if (data.sections.languages.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Languages",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const lang of data.sections.languages.items) {
        if (!lang.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: lang.name || "", bold: true }),
              new TextRun({ text: lang.level ? ` - ${lang.level}` : "" }),
            ],
          }),
        );
      }
      sections.push(new Paragraph({ text: "" })); // spacing
    }

    if (data.sections.projects.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Projects",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const project of data.sections.projects.items) {
        if (!project.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: project.name || "", bold: true, size: 24 }),
              new TextRun({ text: project.url.href ? ` (${project.url.href})` : "" }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: project.date || "", italics: true })],
          }),
        );
        if (project.summary) {
          sections.push(
            new Paragraph({
              text: project.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.awards.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Awards",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const award of data.sections.awards.items) {
        if (!award.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: award.title || "", bold: true }),
              new TextRun({ text: award.awarder ? ` - ${award.awarder}` : "" }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: award.date || "", italics: true })],
          }),
        );
        if (award.summary) {
          sections.push(
            new Paragraph({
              text: award.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.certifications.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Certifications",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const cert of data.sections.certifications.items) {
        if (!cert.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name || "", bold: true }),
              new TextRun({ text: cert.issuer ? ` - ${cert.issuer}` : "" }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: cert.date || "", italics: true })],
          }),
        );
        if (cert.summary) {
          sections.push(
            new Paragraph({
              text: cert.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.publications.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Publications",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const pub of data.sections.publications.items) {
        if (!pub.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: pub.name || "", bold: true }),
              new TextRun({ text: pub.publisher ? ` - ${pub.publisher}` : "" }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: pub.date || "", italics: true })],
          }),
        );
        if (pub.summary) {
          sections.push(
            new Paragraph({
              text: pub.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.volunteer.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Volunteer Experience",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const vol of data.sections.volunteer.items) {
        if (!vol.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: vol.position || "", bold: true }),
              new TextRun({ text: vol.organization ? ` at ${vol.organization}` : "" }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: vol.date || "", italics: true })],
          }),
        );
        if (vol.summary) {
          sections.push(
            new Paragraph({
              text: vol.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    if (data.sections.interests.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "Interests",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      const interests = data.sections.interests.items
        .filter((interest: { visible: boolean }) => interest.visible)
        .map((interest: { name: string }) => interest.name)
        .join(", ");
      sections.push(
        new Paragraph({
          text: interests,
        }),
        new Paragraph({ text: "" }), // spacing
      );
    }

    if (data.sections.references.items.length > 0) {
      sections.push(
        new Paragraph({
          text: "References",
          heading: HeadingLevel.HEADING_1,
        }),
      );

      for (const ref of data.sections.references.items) {
        if (!ref.visible) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: ref.name || "", bold: true }),
              new TextRun({ text: ref.description ? ` - ${ref.description}` : "" }),
            ],
          }),
        );
        if (ref.url.href) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: ref.url.href })],
            }),
          );
        }
        if (ref.summary) {
          sections.push(
            new Paragraph({
              text: ref.summary,
            }),
          );
        }
        sections.push(new Paragraph({ text: "" })); // spacing
      }
    }

    for (const [sectionKey, customSection] of Object.entries(data.sections.custom)) {
      const section = customSection as {
        name?: string;
        items?: {
          visible: boolean;
          name?: string;
          description?: string;
          date?: string;
          summary?: string;
        }[];
      };
      if (section.items && section.items.length > 0) {
        sections.push(
          new Paragraph({
            text: section.name ?? sectionKey,
            heading: HeadingLevel.HEADING_1,
          }),
        );

        for (const item of section.items) {
          if (!item.visible) continue;
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: item.name ?? "", bold: true }),
                new TextRun({ text: item.description ? ` - ${item.description}` : "" }),
              ],
            }),
          );
          if (item.date) {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: item.date, italics: true })],
              }),
            );
          }
          if (item.summary) {
            sections.push(
              new Paragraph({
                text: item.summary,
              }),
            );
          }
          sections.push(new Paragraph({ text: "" })); // spacing
        }
      }
    }

    return sections;
  }
}
