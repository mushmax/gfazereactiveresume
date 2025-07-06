import { axios } from "@/client/libs/axios";

export type CreateUserRequest = {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  locale?: string;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  username?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  recentUsers: number;
  totalResumes: number;
};

export type UsersResponse = {
  users: AdminUser[];
  total: number;
};

export const adminService = {
  async getUsers(page = 1, limit = 10): Promise<UsersResponse> {
    const response = await axios.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<AdminUser> {
    const response = await axios.post("/admin/users", data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<AdminUser> {
    const response = await axios.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async updateUserRole(id: string, role: "USER" | "ADMIN" | "SUPER_ADMIN"): Promise<AdminUser> {
    const response = await axios.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`/admin/users/${id}`);
  },

  async updateUserPassword(id: string, newPassword: string) {
    const response = await axios.patch(`/admin/users/${id}/password`, { newPassword });
    return response.data;
  },

  async updateUserStatus(id: string, enabled: boolean): Promise<AdminUser> {
    const response = await axios.patch(`/admin/users/${id}/status`, { enabled });
    return response.data;
  },

  async getStats(): Promise<AdminStats> {
    const response = await axios.get("/admin/stats");
    return response.data;
  },
};
