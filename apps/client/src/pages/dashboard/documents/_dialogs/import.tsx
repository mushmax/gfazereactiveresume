import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { Check, DownloadSimple } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { useCreateDocument, useUploadDocument } from "@/client/services/document";
import { useDialog } from "@/client/stores/dialog";

enum ImportType {
  "pdf" = "pdf",
  "doc" = "doc",
  "docx" = "docx",
}

const formSchema = z.object({
  file: z.instanceof(File),
  type: z.nativeEnum(ImportType),
  title: z.string().min(1),
  documentType: z.enum(["RESUME", "COVER_LETTER", "RESIGNATION_LETTER", "WEBSITE"]),
});

type FormValues = z.infer<typeof formSchema>;

type ValidationResult =
  | {
      isValid: false;
      errors: string;
    }
  | {
      isValid: true;
      file: File;
    };

export const ImportDocumentDialog = () => {
  const { toast } = useToast();
  const { isOpen, mode: _mode, payload, close } = useDialog("import-document");
  const { uploadDocument, loading: uploadLoading } = useUploadDocument();
  const { createDocument, loading: createLoading } = useCreateDocument();

  const loading = uploadLoading || createLoading;

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      type: ImportType.pdf,
      title: "",
      documentType: "RESUME",
    },
    resolver: zodResolver(formSchema),
  });
  const filetype = form.watch("type");

  useEffect(() => {
    if (isOpen) onReset();
  }, [isOpen]);

  useEffect(() => {
    form.reset({
      file: undefined,
      type: filetype,
      title: "",
      documentType: "RESUME",
    });
    setValidationResult(null);
  }, [filetype, payload]);

  const accept = useMemo(() => {
    switch (filetype) {
      case ImportType.pdf: {
        return ".pdf";
      }
      case ImportType.doc: {
        return ".doc";
      }
      case ImportType.docx: {
        return ".docx";
      }
      default: {
        return "";
      }
    }
  }, [filetype]);

  const onValidate = () => {
    try {
      const { file, type } = formSchema.parse(form.getValues());

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      const allowedTypes = {
        pdf: ["application/pdf"],
        doc: ["application/msword"],
        docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      };

      if (!allowedTypes[type].includes(file.type)) {
        throw new Error(`Invalid file type. Expected ${type.toUpperCase()} file.`);
      }

      setValidationResult({ isValid: true, file });
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationResult({
          isValid: false,
          errors: error.toString(),
        });
      } else {
        setValidationResult({
          isValid: false,
          errors: error instanceof Error ? error.message : t`Unknown error occurred`,
        });
      }

      toast({
        variant: "error",
        title: t`An error occurred while validating the file.`,
      });
    }
  };

  const onImport = async () => {
    const values = formSchema.parse(form.getValues());

    if (!validationResult?.isValid) return;

    try {
      const uploadResponse = await uploadDocument(validationResult.file);
      const fileUrl = uploadResponse.data;

      await createDocument({
        title: values.title,
        filename: validationResult.file.name,
        type: values.documentType,
        fileUrl: fileUrl,
        fileSize: validationResult.file.size,
        mimeType: validationResult.file.type,
      });

      toast({
        variant: "success",
        title: t`Document imported successfully.`,
      });

      close();
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const onReset = () => {
    form.reset({
      title: "",
      type: ImportType.pdf,
      documentType: "RESUME",
    });
    setValidationResult(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <DownloadSimple />
                  <h2>{t`Import an existing document`}</h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {t`Upload a PDF, DOC, or DOCX file to import it into your documents collection.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Document Title`}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t`Enter document title`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="documentType"
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

            <FormField
              name="type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`File Type`}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Please select a file type`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                        <SelectItem value="doc">Word Document (.doc)</SelectItem>
                        <SelectItem value="docx">Word Document (.docx)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="file"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`File`}</FormLabel>
                  <FormControl>
                    <Input
                      key={`${accept}-${filetype}`}
                      type="file"
                      accept={accept}
                      onChange={(event) => {
                        if (!event.target.files?.length) return;
                        field.onChange(event.target.files[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {accept && (
                    <FormDescription>
                      {t({
                        message: `Accepts only ${accept} files`,
                        comment:
                          "Helper text to let the user know what filetypes are accepted. {accept} can be .pdf, .doc, or .docx.",
                      })}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {validationResult?.isValid === false && (
              <div className="space-y-2">
                <Label className="text-error">{t`Errors`}</Label>
                <ScrollArea orientation="vertical" className="h-[120px]">
                  <div className="whitespace-pre-wrap rounded bg-secondary-accent p-4 font-mono text-xs leading-relaxed">
                    {validationResult.errors}
                  </div>
                </ScrollArea>
              </div>
            )}

            <DialogFooter>
              <AnimatePresence presenceAffectsLayout>
                {!validationResult && (
                  <Button type="button" onClick={onValidate}>
                    {t`Validate`}
                  </Button>
                )}

                {validationResult !== null && !validationResult.isValid && (
                  <Button type="button" variant="secondary" onClick={onReset}>
                    {t`Discard`}
                  </Button>
                )}

                {validationResult !== null && validationResult.isValid && (
                  <>
                    <Button type="button" disabled={loading} onClick={onImport}>
                      {t`Import`}
                    </Button>

                    <Button disabled type="button" variant="success">
                      <Check size={16} weight="bold" className="mr-2" />
                      {t`Validated`}
                    </Button>
                  </>
                )}
              </AnimatePresence>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
