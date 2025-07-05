import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { KeyboardShortcut } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";

import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./base-card";

type CreateDocumentCardProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const CreateDocumentCard = ({ type }: CreateDocumentCardProps) => {
  const { open } = useDialog("document");

  const getTypeLabel = () => {
    switch (type) {
      case "RESUME": {
        return t`Create a new resume`;
      }
      case "COVER_LETTER": {
        return t`Create a new cover letter`;
      }
      case "RESIGNATION_LETTER": {
        return t`Create a new resignation letter`;
      }
      case "WEBSITE": {
        return t`Create a new website`;
      }
      default: {
        return t`Create a new document`;
      }
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case "RESUME": {
        return t`Start building from scratch`;
      }
      case "COVER_LETTER": {
        return t`Write a compelling cover letter`;
      }
      case "RESIGNATION_LETTER": {
        return t`Draft a professional resignation`;
      }
      case "WEBSITE": {
        return t`Build your personal website`;
      }
      default: {
        return t`Start creating your document`;
      }
    }
  };

  return (
    <BaseCard
      onClick={() => {
        open("create");
      }}
    >
      <Plus size={64} weight="thin" />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
          "bg-gradient-to-t from-background/80 to-transparent",
        )}
      >
        <h4 className="font-medium">
          {getTypeLabel()}
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <KeyboardShortcut className="ml-2">^N</KeyboardShortcut>
        </h4>

        <p className="text-xs opacity-75">{getTypeDescription()}</p>
      </div>
    </BaseCard>
  );
};
