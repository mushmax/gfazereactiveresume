import { t } from "@lingui/macro";
import type { UrlDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/client/hooks/use-toast";
import { axios } from "@/client/libs/axios";

export const exportDocx = async (data: { id: string }) => {
  const response = await axios.get<UrlDto>(`/resume/export/${data.id}/docx`);

  return response.data;
};

export const useExportDocx = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: exportDocxFn,
  } = useMutation({
    mutationFn: exportDocx,
    onError: (error) => {
      const message = error.message;

      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: message,
      });
    },
  });

  return { exportDocx: exportDocxFn, loading, error };
};
