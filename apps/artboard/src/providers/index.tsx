import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router";

import { helmetContext } from "../constants/helmet";
import { useArtboardStore } from "../store/artboard";

export const Providers = () => {
  const resume = useArtboardStore((state) => state.resume);
  const setResume = useArtboardStore((state) => state.setResume);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "SET_RESUME") setResume(event.data.payload);
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, []);

  useEffect(() => {
    const loadResumeData = () => {
      const resumeData = window.localStorage.getItem("resume");

      if (resumeData) {
        try {
          const parsedData = JSON.parse(resumeData);

          if (parsedData?.metadata?.layout && Array.isArray(parsedData.metadata.layout)) {
            let transformedData = parsedData;

            if (parsedData.sections?.basics && !parsedData.basics) {
              transformedData = {
                basics: parsedData.sections.basics,
                sections: parsedData.sections,
                metadata: parsedData.metadata,
              };
            } else if (!parsedData.basics) {
              return;
            }

            if (!transformedData.sections) {
              return;
            }

            const defaultSections = [
              "profiles",
              "summary",
              "experience",
              "education",
              "skills",
              "languages",
              "awards",
              "certifications",
              "interests",
              "projects",
              "publications",
              "volunteer",
              "references",
            ];

            for (const sectionKey of defaultSections) {
              if (!transformedData.sections[sectionKey]) {
                transformedData.sections[sectionKey] = {
                  id: sectionKey,
                  name: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
                  visible: true,
                  columns: 1,
                  separateLinks: false,
                  items: [],
                };
              }
            }

            if (!transformedData.sections.custom) {
              transformedData.sections.custom = {};
            }

            for (const sectionKey of Object.keys(transformedData.sections)) {
              const section = transformedData.sections[sectionKey];
              if (section && typeof section === "object" && !Array.isArray(section)) {
                if (section.visible === undefined) {
                  section.visible = true;
                }
                if (section.items && Array.isArray(section.items)) {
                  for (const item of section.items) {
                    if (item && typeof item === "object" && item.visible === undefined) {
                      item.visible = true;
                    }
                  }
                }
              } else if (sectionKey === "custom" && section && typeof section === "object") {
                for (const customKey of Object.keys(section)) {
                  const customSection = section[customKey];
                  if (customSection && typeof customSection === "object") {
                    if (customSection.visible === undefined) {
                      customSection.visible = true;
                    }
                    if (customSection.items && Array.isArray(customSection.items)) {
                      for (const item of customSection.items) {
                        if (item && typeof item === "object" && item.visible === undefined) {
                          item.visible = true;
                        }
                      }
                    }
                  }
                }
              }
            }

            setResume(transformedData);
          }
        } catch {
          return;
        }
      }
    };

    loadResumeData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "resume") {
        loadResumeData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomStorageChange = () => {
      loadResumeData();
    };

    window.addEventListener("resume-data-updated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("resume-data-updated", handleCustomStorageChange);
    };
  }, [setResume]);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resume) return null;

  return (
    <HelmetProvider context={helmetContext}>
      <Outlet />
    </HelmetProvider>
  );
};
