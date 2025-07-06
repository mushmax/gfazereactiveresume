import { useMutation, useQuery } from "@tanstack/react-query";

import { ADMIN_STATS_KEY, ADMIN_USERS_KEY } from "@/client/constants/query-keys";
import { queryClient } from "@/client/libs/query-client";

import { adminService } from "./index";

export const useAdminUsers = (page = 1, limit = 10) => {
  const {
    error,
    isPending: loading,
    data,
  } = useQuery({
    queryKey: [...ADMIN_USERS_KEY, { page, limit }],
    queryFn: () => adminService.getUsers(page, limit),
  });

  return {
    users: data?.users ?? [],
    total: data?.total ?? 0,
    loading,
    error,
  };
};

export const useCreateUser = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: createUserFn,
  } = useMutation({
    mutationFn: (data: Parameters<typeof adminService.createUser>[0]) =>
      adminService.createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { createUserFn, loading, error };
};

export const useUpdateUser = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserFn,
  } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminService.updateUser>[1];
    }) => adminService.updateUser(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { updateUserFn, loading, error };
};

export const useUpdateUserRole = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserRoleFn,
  } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { updateUserRoleFn, loading, error };
};

export const useDeleteUser = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteUserFn,
  } = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { deleteUserFn, loading, error };
};

export const useUpdateUserPassword = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserPasswordFn,
  } = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminService.updateUserPassword(id, newPassword),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { updateUserPasswordFn, loading, error };
};

export const useUpdateUserStatus = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserStatusFn,
  } = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      adminService.updateUserStatus(id, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });

  return { updateUserStatusFn, loading, error };
};

export const useAdminStats = () => {
  const {
    error,
    isPending: loading,
    data: stats,
  } = useQuery({
    queryKey: ADMIN_STATS_KEY,
    queryFn: () => adminService.getStats(),
  });

  return { stats, loading, error };
};
