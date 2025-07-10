export type IframeSizingOptions = {
  responsive?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  containerSelector?: string;
};

export type IframeDimensions = {
  width: number;
  height: number;
};

export const calculateResponsiveIframeDimensions = (
  containerElement: HTMLElement,
  options: IframeSizingOptions = {},
): IframeDimensions => {
  const {
    responsive = true,
    minWidth = 320,
    minHeight = 400,
    maxWidth = 1200,
    maxHeight = 1600,
    aspectRatio,
  } = options;

  if (!responsive) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const containerRect = containerElement.getBoundingClientRect();
  let width = Math.min(containerRect.width, maxWidth);
  let height = Math.min(containerRect.height, maxHeight);

  width = Math.max(width, minWidth);
  height = Math.max(height, minHeight);

  if (aspectRatio) {
    const calculatedHeight = width / aspectRatio;
    if (calculatedHeight <= maxHeight && calculatedHeight >= minHeight) {
      height = calculatedHeight;
    } else {
      width = height * aspectRatio;
      width = Math.max(Math.min(width, maxWidth), minWidth);
    }
  }

  return { width, height };
};

export const applyIframeSizing = (
  iframe: HTMLIFrameElement,
  dimensions: IframeDimensions,
): void => {
  iframe.style.width = `${dimensions.width}px`;
  iframe.style.height = `${dimensions.height}px`;
};

export const setupResponsiveIframe = (
  iframe: HTMLIFrameElement,
  options: IframeSizingOptions = {},
): (() => void) => {
  const { containerSelector } = options;

  const containerElement = containerSelector
    ? (document.querySelector(containerSelector) as HTMLElement | null)
    : iframe.parentElement;

  if (!containerElement) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  const updateSize = () => {
    const dimensions = calculateResponsiveIframeDimensions(containerElement, options);
    applyIframeSizing(iframe, dimensions);
  };

  updateSize();

  const resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(containerElement);

  window.addEventListener("resize", updateSize);

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", updateSize);
  };
};

export const getEmbeddingConfiguration = (
  embeddingType: "external" | "internal" | "preview",
): IframeSizingOptions => {
  switch (embeddingType) {
    case "external": {
      return {
        responsive: true,
        minWidth: 280,
        minHeight: 350,
        maxWidth: 800,
        maxHeight: 1000,
        aspectRatio: 0.75, // A4-like ratio
      };
    }
    case "internal": {
      return {
        responsive: true,
        minWidth: 400,
        minHeight: 500,
        maxWidth: 1200,
        maxHeight: 1600,
      };
    }
    case "preview": {
      return {
        responsive: false,
        minWidth: 210, // A4 width in mm converted to approximate px
        minHeight: 297, // A4 height in mm converted to approximate px
        maxWidth: 794, // A4 width at 96 DPI
        maxHeight: 1123, // A4 height at 96 DPI
      };
    }
    default: {
      return {
        responsive: true,
        minWidth: 320,
        minHeight: 400,
        maxWidth: 1200,
        maxHeight: 1600,
      };
    }
  }
};
