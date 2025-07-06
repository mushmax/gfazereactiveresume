import { createId } from "@paralleldrive/cuid2";
import {
  defaultEducation,
  defaultExperience,
  defaultResumeData,
  defaultSkill,
  type Education,
  type Experience,
  type ResumeData,
  type Skill,
} from "@reactive-resume/schema";
import type { Schema } from "zod";
import { z } from "zod";

import type { Parser } from "../interfaces/parser";

const docxSchema = z.object({
  text: z.string(),
  metadata: z.object({}).optional(),
});

export type DocxData = z.infer<typeof docxSchema>;

export class DocxParser implements Parser<File, DocxData> {
  schema: Schema;

  constructor() {
    this.schema = docxSchema;
  }

  readFile(file: File): Promise<File> {
    return Promise.resolve(file);
  }

  validate(_data: File): Promise<DocxData> {
    try {
      return Promise.resolve(
        this.schema.parse({
          text: "DOCX parsing not yet implemented - please use JSON import for now",
          metadata: {},
        }),
      );
    } catch (error) {
      throw new Error(
        `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  convert(data: DocxData) {
    const result = JSON.parse(JSON.stringify(defaultResumeData)) as ResumeData;
    const text = data.text;

    this.parseBasicInfo(text, result);
    this.parseExperience(text, result);
    this.parseEducation(text, result);
    this.parseSkills(text, result);

    return result;
  }

  private parseBasicInfo(text: string, result: ResumeData) {
    const emailMatch = /[\w.-]+@[\w.-]+\.\w+/.exec(text);
    const phoneMatch = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.exec(text);

    if (emailMatch) result.basics.email = emailMatch[0];
    if (phoneMatch) result.basics.phone = phoneMatch[0];

    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length > 0) {
      result.basics.name = lines[0].trim();
    }
  }

  private parseExperience(text: string, result: ResumeData) {
    const experienceSection = this.extractSection(text, [
      "experience",
      "work",
      "employment",
      "professional",
    ]);
    if (experienceSection) {
      const jobEntries = this.parseJobEntries(experienceSection);
      result.sections.experience.items = jobEntries;
    }
  }

  private parseEducation(text: string, result: ResumeData) {
    const educationSection = this.extractSection(text, [
      "education",
      "academic",
      "university",
      "college",
      "school",
    ]);
    if (educationSection) {
      const educationEntries = this.parseEducationEntries(educationSection);
      result.sections.education.items = educationEntries;
    }
  }

  private parseSkills(text: string, result: ResumeData) {
    const skillsSection = this.extractSection(text, [
      "skills",
      "technologies",
      "competencies",
      "technical",
    ]);
    if (skillsSection) {
      const skills = this.parseSkillsEntries(skillsSection);
      result.sections.skills.items = skills;
    }
  }

  private extractSection(text: string, keywords: string[]): string | null {
    const lines = text.split("\n");
    let sectionStart = -1;
    let sectionEnd = -1;

    for (const [i, line_] of lines.entries()) {
      const line = line_.toLowerCase();
      if (keywords.some((keyword) => line.includes(keyword))) {
        sectionStart = i;
        break;
      }
    }

    if (sectionStart === -1) return null;

    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (this.isSectionHeader(line)) {
        sectionEnd = i;
        break;
      }
    }

    if (sectionEnd === -1) sectionEnd = lines.length;
    return lines.slice(sectionStart, sectionEnd).join("\n");
  }

  private isSectionHeader(line: string): boolean {
    const sectionKeywords = [
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
      "languages",
    ];
    return sectionKeywords.some((keyword) => line.includes(keyword));
  }

  private parseJobEntries(experienceText: string): Experience[] {
    const entries: Experience[] = [];
    const lines = experienceText.split("\n").filter((line) => line.trim());

    let currentEntry: Experience | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const dateMatch = /(\d{4})\s*[–-]\s*(\d{4}|present|current)/i.exec(trimmedLine);
      if (dateMatch) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        currentEntry = {
          ...defaultExperience,
          id: createId(),
          company: "",
          position: "",
          location: "",
          date: `${dateMatch[1]} - ${dateMatch[2].toLowerCase() === "present" || dateMatch[2].toLowerCase() === "current" ? "Present" : dateMatch[2]}`,
          summary: "",
        };
      } else if (currentEntry && !currentEntry.position && trimmedLine.length > 0) {
        currentEntry.position = trimmedLine;
      } else if (currentEntry && !currentEntry.company && trimmedLine.length > 0) {
        currentEntry.company = trimmedLine;
      } else if (currentEntry && trimmedLine.length > 0) {
        currentEntry.summary =
          String(currentEntry.summary || "") + (currentEntry.summary ? " " : "") + trimmedLine;
      }
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }

    return entries;
  }

  private parseEducationEntries(educationText: string): Education[] {
    const entries: Education[] = [];
    const lines = educationText.split("\n").filter((line) => line.trim());

    let currentEntry: Education | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const dateMatch = /(\d{4})\s*[–-]\s*(\d{4}|present|current)/i.exec(trimmedLine);
      if (dateMatch) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        currentEntry = {
          ...defaultEducation,
          id: createId(),
          institution: "",
          studyType: "",
          area: "",
          score: "",
          date: `${dateMatch[1]} - ${dateMatch[2].toLowerCase() === "present" || dateMatch[2].toLowerCase() === "current" ? "Present" : dateMatch[2]}`,
          summary: "",
        };
      } else if (currentEntry && !currentEntry.area && trimmedLine.length > 0) {
        currentEntry.area = trimmedLine;
      } else if (currentEntry && !currentEntry.institution && trimmedLine.length > 0) {
        currentEntry.institution = trimmedLine;
      } else if (currentEntry && trimmedLine.length > 0) {
        currentEntry.summary =
          String(currentEntry.summary || "") + (currentEntry.summary ? " " : "") + trimmedLine;
      }
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }

    return entries;
  }

  private parseSkillsEntries(skillsText: string): Skill[] {
    const entries: Skill[] = [];
    const lines = skillsText.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.toLowerCase().includes("skill")) continue;

      const skills = trimmedLine
        .split(/[,;|]/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      for (const skill of skills) {
        entries.push({
          ...defaultSkill,
          id: createId(),
          name: skill,
          description: "",
          level: 0,
          keywords: [],
        });
      }
    }

    return entries;
  }
}
