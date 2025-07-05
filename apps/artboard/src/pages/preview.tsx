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
    if (!layout || !Array.isArray(layout)) return [];
    
    return layout.map((page) => {
      if (!Array.isArray(page)) return [];
      
      return page.map((column) => {
        if (!Array.isArray(column)) return [];
        
        return column
          .filter((section: any) => {
            if (typeof section === 'string') return true;
            if (typeof section === 'object' && section !== null && 'id' in section && 'visible' in section) {
              return section.visible === true;
            }
            return false;
          })
          .map((section: any) => {
            if (typeof section === 'string') return section;
            if (typeof section === 'object' && section !== null && 'id' in section) {
              return section.id;
            }
            return null;
          })
          .filter((item) => item !== null && item !== undefined);
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
