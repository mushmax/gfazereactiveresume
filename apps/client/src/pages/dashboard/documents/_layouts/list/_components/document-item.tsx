import { t } from "@lingui/macro";
import { DotsThreeVertical, Download, Eye, Trash } from "@phosphor-icons/react";
import type { DocumentDto } from "@reactive-resume/dto";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import dayjs from "dayjs";

import { useDeleteDocument } from "@/client/services/document";
import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

type DocumentListItemProps = {
  document: DocumentDto;
};

export const DocumentListItem = ({ document }: DocumentListItemProps) => {
  const { open } = useDialog<DocumentDto>("document");
  const { deleteDocument } = useDeleteDocument();

  const handleView = () => {
    if (document.fileUrl) {
      window.open(document.fileUrl, "_blank");
    }
  };

  const handleDownload = () => {
    if (document.fileUrl) {
      const link = window.document.createElement("a");
      link.href = document.fileUrl;
      link.download = document.title;
      link.click();
    }
  };

  const handleEdit = () => {
    open("update", { id: "document", item: document });
  };

  const handleDelete = async () => {
    open("delete", { id: "document", item: document });
  };

  const contextMenuItems = (
    <>
      <ContextMenuItem onClick={handleView}>
        <Eye size={16} className="mr-2" />
        {t`View Document`}
      </ContextMenuItem>
      <ContextMenuItem onClick={handleDownload}>
        <Download size={16} className="mr-2" />
        {t`Download`}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleEdit}>{t`Edit`}</ContextMenuItem>
      <ContextMenuItem className="text-error" onClick={handleDelete}>
        <Trash size={16} className="mr-2" />
        {t`Delete`}
      </ContextMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseListItem
          title={document.title}
          description={t`Updated ${dayjs(document.updatedAt).fromNow()}`}
          end={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full bg-background/80 p-1 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100">
                  <DotsThreeVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye size={16} className="mr-2" />
                  {t`View Document`}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download size={16} className="mr-2" />
                  {t`Download`}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>{t`Edit`}</DropdownMenuItem>
                <DropdownMenuItem className="text-error" onClick={handleDelete}>
                  <Trash size={16} className="mr-2" />
                  {t`Delete`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          className="group"
        />
      </ContextMenuTrigger>
      <ContextMenuContent>{contextMenuItems}</ContextMenuContent>
    </ContextMenu>
  );
};
