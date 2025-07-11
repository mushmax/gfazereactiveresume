import type { SectionKey } from "@reactive-resume/schema";
import type { Template } from "@reactive-resume/utils";
import { useMemo } from "react";

import { Page } from "../components/page";
import { useArtboardStore } from "../store/artboard";
import { getTemplate } from "../templates";

export const PreviewLayout = () => {
  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const template = useArtboardStore((state) => state.resume.metadata.template as Template);

  const Template = useMemo(() => {
    try {
      return getTemplate(template);
    } catch {
      return null;
    }
  }, [template]);

  const transformedLayout = useMemo(() => {
    try {
      if (!Array.isArray(layout)) {
        return [[[], []]]; // Return a single page with two empty columns as fallback
      }

      return layout.map((page) => {
        if (!Array.isArray(page)) {
          return [[], []]; // Default to two empty columns
        }

        const normalizedPage = [...page];
        while (normalizedPage.length < 2) {
          normalizedPage.push([]);
        }

        return normalizedPage.map((column) => {
          if (!Array.isArray(column)) {
            return [];
          }

          return column
            .filter((section: string | Record<string, unknown>) => {
              if (!section) return false;
              if (typeof section === "string") return true;
              return (
                typeof section === "object" && (section as { visible?: boolean }).visible !== false
              );
            })
            .map((section: string | Record<string, unknown>) => {
              if (typeof section === "string") return section;
              return typeof section === "object" && (section as { id?: string }).id
                ? (section as { id: string }).id
                : null;
            })
            .filter((item): item is string => typeof item === "string");
        });
      });
    } catch {
      return [[[], []]]; // Return a single page with two empty columns as fallback
    }
  }, [layout]);

  if (!Array.isArray(layout) || layout.length === 0 || !Template) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {transformedLayout.map((columns, pageIndex) => {
        const safeColumns =
          Array.isArray(columns) && columns.length >= 2
            ? columns.map((col) => (Array.isArray(col) ? col : []))
            : [[], []];

        return (
          <Page key={pageIndex} mode="preview" pageNumber={pageIndex + 1}>
            <Template isFirstPage={pageIndex === 0} columns={safeColumns as SectionKey[][]} />
          </Page>
        );
      })}
    </>
  );
};
