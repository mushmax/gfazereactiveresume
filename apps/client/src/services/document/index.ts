import type { CreateDocumentDto, DocumentDto, UpdateDocumentDto } from "@reactive-resume/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { DOCUMENTS_KEY } from "../../constants/query-keys";
import { axios } from "../../libs/axios";

export const fetchDocuments = async (type?: string) => {
  const params = type ? { type } : {};
  const response = await axios.get<DocumentDto[], AxiosResponse<DocumentDto[]>>("/document", {
    params,
  });
  return response.data;
};

export const fetchDocument = async (id: string) => {
  const response = await axios.get<DocumentDto, AxiosResponse<DocumentDto>>(`/document/${id}`);
  return response.data;
};

export const createDocument = async (data: CreateDocumentDto) => {
  const response = await axios.post<DocumentDto, AxiosResponse<DocumentDto>, CreateDocumentDto>(
    "/document",
    data,
  );
  return response.data;
};

export const updateDocument = async (id: string, data: UpdateDocumentDto) => {
  const response = await axios.patch<DocumentDto, AxiosResponse<DocumentDto>, UpdateDocumentDto>(
    `/document/${id}`,
    data,
  );
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await axios.delete(`/document/${id}`);
  return response.data;
};

export const fetchDocumentStats = async () => {
  const response = await axios.get("/document/stats");
  return response.data;
};

export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.put<string, AxiosResponse<string>, FormData>("/storage/document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const useDocuments = (type?: string) => {
  const {
    error,
    isPending: loading,
    data: documents,
  } = useQuery({
    queryKey: [...DOCUMENTS_KEY, type],
    queryFn: () => fetchDocuments(type),
  });

  return { documents, loading, error };
};

export const useDocument = (id: string) => {
  const {
    error,
    isPending: loading,
    data: document,
  } = useQuery({
    queryKey: [...DOCUMENTS_KEY, id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  });

  return { document, loading, error };
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createDocumentFn,
  } = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  return { createDocument: createDocumentFn, loading, error };
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: updateDocumentFn,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) => updateDocument(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  return { updateDocument: updateDocumentFn, loading, error };
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: deleteDocumentFn,
  } = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  return { deleteDocument: deleteDocumentFn, loading, error };
};

export const useUploadDocument = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: uploadDocumentFn,
  } = useMutation({
    mutationFn: uploadDocument,
  });

  return { uploadDocument: uploadDocumentFn, loading, error };
};

export const useDocumentStats = () => {
  const {
    error,
    isPending: loading,
    data: stats,
  } = useQuery({
    queryKey: [...DOCUMENTS_KEY, "stats"],
    queryFn: fetchDocumentStats,
  });

  return { stats, loading, error };
};
