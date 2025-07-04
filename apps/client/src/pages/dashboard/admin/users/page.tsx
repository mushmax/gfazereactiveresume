import { t } from "@lingui/macro";
import { Plus, Trash, UserGear } from "@phosphor-icons/react";
import {
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

import { useAdminUsers, useCreateUser } from "@/client/services/admin/hooks";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
  });

  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { createUserFn, loading: createLoading } = useCreateUser();

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
                          <Button variant="outline" size="sm">
                            <UserGear className="size-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
    </div>
  );
};
