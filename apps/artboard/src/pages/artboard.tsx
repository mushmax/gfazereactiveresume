import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";
import webfontloader from "webfontloader";

import { useArtboardStore } from "../store/artboard";

export const ArtboardPage = () => {
  const name = useArtboardStore((state) => state.resume.basics.name || "Resume");
  const metadata = useArtboardStore((state) => state.resume.metadata);

  const fontString = useMemo(() => {
    const family = metadata.typography.font.family;
    const variants = metadata.typography.font.variants.join(",");
    const subset = metadata.typography.font.subset;

    return `${family}:${variants}:${subset}`;
  }, [metadata.typography.font]);

  useEffect(() => {
    webfontloader.load({
      google: { families: [fontString] },
      active: () => {
        const width = window.document.body.offsetWidth;
        const height = window.document.body.offsetHeight;
        const message = { type: "PAGE_LOADED", payload: { width, height } };
        window.postMessage(message, "*");

        window.parent.postMessage({ type: "IFRAME_READY" }, "*");
      },
    });
  }, [fontString]);

  // Font Size & Line Height
  useEffect(() => {
    const fontSize = metadata.typography.font.size || 14;
    const lineHeight = metadata.typography.lineHeight || 1.5;
    const margin = metadata.page.margin || 18;
    const textColor = metadata.theme.text || "#000000";
    const primaryColor = metadata.theme.primary || "#dc2626";
    const backgroundColor = metadata.theme.background || "#ffffff";

    document.documentElement.style.setProperty("font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("line-height", `${lineHeight}`);

    document.documentElement.style.setProperty("--margin", `${margin}px`);
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--line-height", `${lineHeight}`);

    document.documentElement.style.setProperty("--color-foreground", textColor);
    document.documentElement.style.setProperty("--color-primary", primaryColor);
    document.documentElement.style.setProperty("--color-background", backgroundColor);
  }, [metadata]);

  // Typography Options
  useEffect(() => {
    // eslint-disable-next-line unicorn/prefer-spread
    const elements = Array.from(document.querySelectorAll(`[data-page]`));

    for (const el of elements) {
      el.classList.toggle("hide-icons", metadata.typography.hideIcons || false);
      el.classList.toggle("underline-links", metadata.typography.underlineLinks || false);
    }
  }, [metadata]);

  return (
    <>
      <Helmet>
        <title>{name} | GFAZE Resume</title>
        {metadata.css.visible && (
          <style id="custom-css" lang="css">
            {metadata.css.value}
          </style>
        )}
      </Helmet>

      <Outlet />
    </>
  );
};
