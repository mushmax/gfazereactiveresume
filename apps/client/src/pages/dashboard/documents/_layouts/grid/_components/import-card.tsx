import { t } from "@lingui/macro";
import { Upload } from "@phosphor-icons/react";
import { cn } from "@reactive-resume/utils";

import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./base-card";

type ImportDocumentCardProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const ImportDocumentCard = ({ type }: ImportDocumentCardProps) => {
  const { open } = useDialog("import-document");

  const getTypeLabel = () => {
    switch (type) {
      case "RESUME": {
        return t`Import resume`;
      }
      case "COVER_LETTER": {
        return t`Import cover letter`;
      }
      case "RESIGNATION_LETTER": {
        return t`Import resignation letter`;
      }
      case "WEBSITE": {
        return t`Import website`;
      }
      default: {
        return t`Import document`;
      }
    }
  };

  return (
    <BaseCard
      onClick={() => {
        open("create");
      }}
    >
      <Upload size={64} weight="thin" />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
          "bg-gradient-to-t from-background/80 to-transparent",
        )}
      >
        <h4 className="font-medium">{getTypeLabel()}</h4>

        <p className="text-xs opacity-75">{t`Upload PDF, DOC, or DOCX`}</p>
      </div>
    </BaseCard>
  );
};
