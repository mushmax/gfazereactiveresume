import type { SectionKey } from "@reactive-resume/schema";
import type { Template } from "@reactive-resume/utils";
import { pageSizeMap } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { MM_TO_PX, Page } from "../components/page";
import { useArtboardStore } from "../store/artboard";
import { getTemplate } from "../templates";

export const BuilderLayout = () => {
  const [wheelPanning, setWheelPanning] = useState(true);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const format = useArtboardStore((state) => state.resume.metadata.page.format);
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const isAllowedOrigin =
        event.origin === window.location.origin ||
        (window.location.hostname === "localhost" && event.origin.includes("localhost")) ||
        event.origin.startsWith("http://localhost") ||
        event.origin.startsWith("https://localhost");

      if (!isAllowedOrigin) return;

      if (event.data.type === "ZOOM_IN") transformRef.current?.zoomIn(0.2);
      if (event.data.type === "ZOOM_OUT") transformRef.current?.zoomOut(0.2);
      if (event.data.type === "CENTER_VIEW") transformRef.current?.centerView();
      if (event.data.type === "RESET_VIEW") {
        transformRef.current?.resetTransform(0);
        setTimeout(() => transformRef.current?.centerView(0.8, 0), 10);
      }
      if (event.data.type === "TOGGLE_PAN_MODE") {
        setWheelPanning(event.data.panMode);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [transformRef]);

  if (!Array.isArray(layout) || layout.length === 0 || !Template) {
    return <div>Loading...</div>;
  }

  return (
    <TransformWrapper
      ref={transformRef}
      centerOnInit
      maxScale={2}
      minScale={0.4}
      initialScale={0.8}
      limitToBounds={false}
      wheel={{ wheelDisabled: wheelPanning }}
      panning={{ wheelPanning: wheelPanning }}
    >
      <TransformComponent
        wrapperClass="!w-screen !h-screen"
        contentClass="grid items-start justify-center space-x-12 pointer-events-none"
        contentStyle={{
          width: `${transformedLayout.length * (pageSizeMap[format].width * MM_TO_PX + 42)}px`,
          gridTemplateColumns: `repeat(${transformedLayout.length}, 1fr)`,
        }}
      >
        <AnimatePresence>
          {transformedLayout.map((columns, pageIndex) => {
            const safeColumns =
              Array.isArray(columns) && columns.length >= 2
                ? columns.map((col) => (Array.isArray(col) ? col : []))
                : [[], []];

            return (
              <motion.div
                key={pageIndex}
                layout
                initial={{ opacity: 0, x: -200, y: 0 }}
                animate={{ opacity: 1, x: 0, transition: { delay: pageIndex * 0.3 } }}
                exit={{ opacity: 0, x: -200 }}
              >
                <Page mode="builder" pageNumber={pageIndex + 1}>
                  <Template isFirstPage={pageIndex === 0} columns={safeColumns as SectionKey[][]} />
                </Page>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </TransformComponent>
    </TransformWrapper>
  );
};
