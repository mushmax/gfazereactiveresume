import { t } from "@lingui/macro";
import { Plus, Trash, UserGear } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { useState } from "react";

import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUpdateUserRole,
} from "@/client/services/admin/hooks";

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN": {
      return "error";
    }
    case "ADMIN": {
      return "warning";
    }
    default: {
      return "secondary";
    }
  }
};

export const AdminUsersPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    username: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
  });

  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { createUserFn, loading: createLoading } = useCreateUser();
  const { updateUserFn, loading: updateLoading } = useUpdateUser();
  const { updateUserRoleFn, loading: updateRoleLoading } = useUpdateUserRole();
  const { deleteUserFn, loading: deleteLoading } = useDeleteUser();

  const handleCreateUser = async () => {
    try {
      await createUserFn(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "USER",
      });
    } catch {
    }
  };

  const handleEditUser = (user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  }) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role as "USER" | "ADMIN" | "SUPER_ADMIN",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUserFn({
        id: selectedUser.id,
        data: {
          name: editFormData.name,
          email: editFormData.email,
          username: editFormData.username,
        },
      });

      if (editFormData.role !== selectedUser.role) {
        await updateUserRoleFn({
          id: selectedUser.id,
          role: editFormData.role,
        });
      }

      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch {
    }
  };

  const handleDeleteUser = (user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  }) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserFn(selectedUser.id);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch {
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t`User Management`}</h1>
          <p className="text-muted-foreground">{t`Manage users, roles, and permissions`}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              {t`Create User`}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t`Create New User`}</DialogTitle>
              <DialogDescription>
                {t`Add a new user to the system with specified role and permissions.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t`Name`}
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t`Email`}
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  {t`Username`}
                </Label>
                <Input
                  id="username"
                  className="col-span-3"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t`Password`}
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  {t`Role`}
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "USER" | "ADMIN" | "SUPER_ADMIN") => {
                    setFormData({ ...formData, role: value });
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t`Select role`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">{t`User`}</SelectItem>
                    <SelectItem value="ADMIN">{t`Admin`}</SelectItem>
                    <SelectItem value="SUPER_ADMIN">{t`Super Admin`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                disabled={createLoading}
                onClick={() => {
                  setIsCreateDialogOpen(false);
                }}
              >
                {t`Cancel`}
              </Button>
              <Button disabled={createLoading} onClick={handleCreateUser}>
                {createLoading ? t`Creating...` : t`Create User`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t`Users`}</CardTitle>
          <CardDescription>
            {t`A list of all users in the system with their roles and status.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">{t`Name`}</th>
                  <th className="p-4 text-left font-medium">{t`Email`}</th>
                  <th className="p-4 text-left font-medium">{t`Username`}</th>
                  <th className="p-4 text-left font-medium">{t`Role`}</th>
                  <th className="p-4 text-left font-medium">{t`Created`}</th>
                  <th className="p-4 text-left font-medium">{t`Status`}</th>
                  <th className="p-4 text-right font-medium">{t`Actions`}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (usersLoading) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          {t`Loading users...`}
                        </td>
                      </tr>
                    );
                  }

                  if (usersError) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-red-600">
                          {t`Error loading users. Please try again.`}
                        </td>
                      </tr>
                    );
                  }

                  if (users.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          {t`No users found.`}
                        </td>
                      </tr>
                    );
                  }

                  return users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 border-b">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <Badge variant={user.emailVerified ? "success" : "secondary"}>
                          {user.emailVerified ? t`Verified` : t`Pending`}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleEditUser(user);
                            }}
                          >
                            <UserGear className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleDeleteUser(user);
                            }}
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t`Edit User`}</DialogTitle>
            <DialogDescription>
              {t`Update user information and role permissions.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t`Name`}
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={editFormData.name}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                {t`Email`}
              </Label>
              <Input
                id="edit-email"
                type="email"
                className="col-span-3"
                value={editFormData.email}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, email: e.target.value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                {t`Username`}
              </Label>
              <Input
                id="edit-username"
                className="col-span-3"
                value={editFormData.username}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, username: e.target.value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                {t`Role`}
              </Label>
              <Select
                value={editFormData.role}
                onValueChange={(value: "USER" | "ADMIN" | "SUPER_ADMIN") => {
                  setEditFormData({ ...editFormData, role: value });
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t`Select role`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{t`User`}</SelectItem>
                  <SelectItem value="ADMIN">{t`Admin`}</SelectItem>
                  <SelectItem value="SUPER_ADMIN">{t`Super Admin`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              disabled={updateLoading || updateRoleLoading}
              onClick={() => {
                setIsEditDialogOpen(false);
              }}
            >
              {t`Cancel`}
            </Button>
            <Button disabled={updateLoading || updateRoleLoading} onClick={handleUpdateUser}>
              {updateLoading || updateRoleLoading ? t`Updating...` : t`Update User`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t`Delete User`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user and all their data.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t`Cancel`}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteUser}
            >
              {deleteLoading ? t`Deleting...` : t`Delete User`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
