import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { KeyboardShortcut } from "@reactive-resume/ui";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

type CreateDocumentListItemProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const CreateDocumentListItem = ({ type }: CreateDocumentListItemProps) => {
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

  return (
    <BaseListItem
      start={<Plus />}
      title={
        <>
          {getTypeLabel()}
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <KeyboardShortcut className="ml-2">^N</KeyboardShortcut>
        </>
      }
      description={t`Start building from scratch`}
      onClick={() => {
        open("create");
      }}
    />
  );
};
