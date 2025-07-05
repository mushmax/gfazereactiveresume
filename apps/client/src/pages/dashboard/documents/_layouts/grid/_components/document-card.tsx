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
import { cn } from "@reactive-resume/utils";
import dayjs from "dayjs";

import { useDeleteDocument } from "@/client/services/document";
import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./base-card";

type DocumentCardProps = {
  document: DocumentDto;
};

export const DocumentCard = ({ document }: DocumentCardProps) => {
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
        <BaseCard className="group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />

          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full bg-background/80 p-1 hover:bg-background">
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
          </div>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
              "bg-gradient-to-t from-background/90 to-transparent",
            )}
          >
            <h4 className="truncate font-medium">{document.title}</h4>
            <p className="text-xs opacity-75">
              {t`Updated ${dayjs(document.updatedAt).fromNow()}`}
            </p>
          </div>
        </BaseCard>
      </ContextMenuTrigger>
      <ContextMenuContent>{contextMenuItems}</ContextMenuContent>
    </ContextMenu>
  );
};
