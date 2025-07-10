import { t } from "@lingui/macro";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Button, Card, CardContent } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";

export type ShareableUrlBoxProps = {
  url: string;
  description?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
};

export const ShareableUrlBox = ({
  url,
  description,
  variant = "default",
  className,
}: ShareableUrlBoxProps) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (variant === "inline") {
    return (
      <button
        className={cn(
          "flex items-center gap-x-1.5 text-xs text-primary transition-colors hover:text-primary/80",
          className,
        )}
        onClick={handleClick}
      >
        <ArrowSquareOut size={12} className="shrink-0" />
        <span>{t`Live Resume Page`}</span>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-secondary/50",
        variant === "compact" && "py-2",
        className,
      )}
      onClick={handleClick}
    >
      <CardContent
        className={cn(
          "flex items-center justify-between gap-x-3",
          variant === "compact" ? "p-3" : "p-4",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-x-2">
            <ArrowSquareOut size={16} className="shrink-0 text-primary" />
            <span className="text-sm font-medium text-primary">{t`Live Resume Page`}</span>
          </div>
          <p className="truncate text-xs text-gray-500">{url}</p>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
          <p className="mt-2 text-xs text-gray-600">
            {t`You can print your resume into PDF from the Live Resume Page. Then use the converter application on GigaFaze to convert the PDF into Word if you need to.`}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <ArrowSquareOut size={14} />
        </Button>
      </CardContent>
    </Card>
  );
};
