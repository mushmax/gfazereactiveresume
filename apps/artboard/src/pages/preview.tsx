import type { SectionKey } from "@reactive-resume/schema";
import type { Template } from "@reactive-resume/utils";
import { useMemo } from "react";

import { Page } from "../components/page";
import { useArtboardStore } from "../store/artboard";
import { getTemplate } from "../templates";

export const PreviewLayout = () => {
  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const template = useArtboardStore((state) => state.resume.metadata.template as Template);

  const Template = useMemo(() => getTemplate(template), [template]);

  const transformedLayout = useMemo(() => {
    return layout.map((page) => {
      if (!Array.isArray(page)) return [];

      return page.map((column) => {
        if (!Array.isArray(column)) return [];

        return column
          .filter((section: string | Record<string, unknown>) => {
            if (typeof section === "string") return true;
            return (
              typeof section === "object" &&
              "visible" in section &&
              (section as { visible: boolean }).visible
            );
          })
          .map((section: string | Record<string, unknown>) => {
            if (typeof section === "string") return section;
            return typeof section === "object" && "id" in section
              ? (section as { id: string }).id
              : null;
          })
          .filter((item): item is string => typeof item === "string");
      });
    });
  }, [layout]);

  return (
    <>
      {transformedLayout.map((columns, pageIndex) => (
        <Page key={pageIndex} mode="preview" pageNumber={pageIndex + 1}>
          <Template isFirstPage={pageIndex === 0} columns={columns as SectionKey[][]} />
        </Page>
      ))}
    </>
  );
};
