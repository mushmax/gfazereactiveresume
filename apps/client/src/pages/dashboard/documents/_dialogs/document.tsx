import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { CaretDown, Flask, MagicWand, Plus } from "@phosphor-icons/react";
import type { DocumentDto } from "@reactive-resume/dto";
import { createDocumentSchema } from "@reactive-resume/dto";
import { idSchema } from "@reactive-resume/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
} from "@reactive-resume/ui";
import { cn, generateRandomName } from "@reactive-resume/utils";
import React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  useCreateDocument,
  useDeleteDocument,
  useUpdateDocument,
} from "@/client/services/document";
import { useDialog } from "@/client/stores/dialog";

const formSchema = createDocumentSchema.extend({
  id: idSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const DocumentDialog = () => {
  const { isOpen, mode, payload, close } = useDialog<DocumentDto>("document");

  const isCreate = mode === "create";
  const isUpdate = mode === "update";
  const isDelete = mode === "delete";
  const isDuplicate = mode === "duplicate";

  const { createDocument, loading: createLoading } = useCreateDocument();
  const { updateDocument, loading: updateLoading } = useUpdateDocument();
  const { deleteDocument, loading: deleteLoading } = useDeleteDocument();

  const loading = createLoading || updateLoading || deleteLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "RESUME",
    },
  });

  useEffect(() => {
    if (isOpen) onReset();
  }, [isOpen, payload]);

  const onSubmit = async (values: FormValues) => {
    if (isCreate) {
      await createDocument({
        title: values.title,
        filename: `${values.title}.pdf`,
        type: values.type,
        fileUrl: "https://example.com/placeholder.pdf",
      });
    }

    if (isUpdate) {
      if (!payload.item?.id) return;

      await updateDocument({
        id: payload.item.id,
        data: {
          title: values.title,
          type: values.type,
        },
      });
    }

    if (isDuplicate) {
      if (!payload.item?.id) return;

      await createDocument({
        title: values.title,
        filename: `${values.title}.pdf`,
        type: values.type,
        fileUrl: "https://example.com/placeholder.pdf",
      });
    }

    if (isDelete) {
      if (!payload.item?.id) return;

      await deleteDocument(payload.item.id);
    }

    close();
  };

  const onReset = () => {
    if (isCreate) form.reset({ title: "", type: "RESUME" });
    if (isUpdate)
      form.reset({
        id: payload.item?.id,
        title: payload.item?.title,
        type: payload.item?.type,
      });
    if (isDuplicate)
      form.reset({
        title: `${payload.item?.title} (Copy)`,
        type: payload.item?.type,
      });
    if (isDelete)
      form.reset({
        id: payload.item?.id,
        title: payload.item?.title,
        type: payload.item?.type,
      });
  };

  const onGenerateRandomName = () => {
    const name = generateRandomName();
    form.setValue("title", name);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "RESUME": {
        return t`Resume`;
      }
      case "COVER_LETTER": {
        return t`Cover Letter`;
      }
      case "RESIGNATION_LETTER": {
        return t`Resignation Letter`;
      }
      case "WEBSITE": {
        return t`Website`;
      }
      default: {
        return t`Document`;
      }
    }
  };

  const getCreateSampleOptions = () => {
    const documentType = form.watch("type");
    switch (documentType) {
      case "RESUME": {
        return [
          {
            label: t`Create Sample Resume`,
            action: () => {
            },
          },
          {
            label: t`Create Resume with AI`,
            action: () => {
            },
          },
        ];
      }
      case "COVER_LETTER": {
        return [
          {
            label: t`Create Sample Cover Letter`,
            action: () => {
            },
          },
          {
            label: t`Create Cover Letter with AI`,
            action: () => {
            },
          },
        ];
      }
      case "RESIGNATION_LETTER": {
        return [
          {
            label: t`Create Sample Resignation Letter`,
            action: () => {
            },
          },
        ];
      }
      case "WEBSITE": {
        return [
          {
            label: t`Create Sample Website`,
            action: () => {
            },
          },
        ];
      }
      default: {
        return [];
      }
    }
  };

  if (isDelete) {
    return (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <Form {...form}>
            <form>
              <AlertDialogHeader>
                <AlertDialogTitle>{t`Are you sure you want to delete this document?`}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t`This action cannot be undone. This will permanently delete your document and cannot be recovered.`}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                <AlertDialogAction variant="error" onClick={form.handleSubmit(onSubmit)}>
                  {t`Delete`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <Plus />
                  <h2>
                    {isCreate && t`Create a new document`}
                    {isUpdate && t`Update an existing document`}
                    {isDuplicate && t`Duplicate an existing document`}
                  </h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {isCreate &&
                  t`Start creating your document by giving it a name and selecting its type.`}
                {isUpdate && t`Changed your mind about the name or type? Update it here.`}
                {isDuplicate && t`Give your document copy a new name.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Title`}</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-between gap-x-2">
                      <Input {...field} className="flex-1" />

                      {(isCreate || isDuplicate) && (
                        <Tooltip content={t`Generate a random title for your document`}>
                          <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onClick={onGenerateRandomName}
                          >
                            <MagicWand />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t`Tip: You can name the document referring to its purpose or content.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Document Type`}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select document type`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESUME">{getDocumentTypeLabel("RESUME")}</SelectItem>
                        <SelectItem value="COVER_LETTER">
                          {getDocumentTypeLabel("COVER_LETTER")}
                        </SelectItem>
                        <SelectItem value="RESIGNATION_LETTER">
                          {getDocumentTypeLabel("RESIGNATION_LETTER")}
                        </SelectItem>
                        <SelectItem value="WEBSITE">{getDocumentTypeLabel("WEBSITE")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <div className="flex items-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(isCreate && "rounded-r-none")}
                >
                  {isCreate && t`Create`}
                  {isUpdate && t`Save Changes`}
                  {isDuplicate && t`Duplicate`}
                </Button>

                {isCreate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon" className="rounded-l-none border-l">
                        <CaretDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="center">
                      {getCreateSampleOptions().map((option, index) => (
                        <DropdownMenuItem key={index} onClick={option.action}>
                          <Flask className="mr-2" />
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
