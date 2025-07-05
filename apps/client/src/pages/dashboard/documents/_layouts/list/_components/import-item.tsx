import { t } from "@lingui/macro";
import { Upload } from "@phosphor-icons/react";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

type ImportDocumentListItemProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const ImportDocumentListItem = ({ type }: ImportDocumentListItemProps) => {
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
    <BaseListItem
      start={<Upload />}
      title={getTypeLabel()}
      description={t`Upload PDF, DOC, or DOCX`}
      onClick={() => {
        open("create");
      }}
    />
  );
};
