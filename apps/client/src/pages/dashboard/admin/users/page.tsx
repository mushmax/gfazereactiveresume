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
  const [users] = useState([
    {
      id: "1",
      name: t`Max Admin`,
      email: "max@gigadrive.com",
      username: "maxadmin",
      role: "SUPER_ADMIN",
      createdAt: t`2025-01-04`,
      emailVerified: true,
    },
    {
      id: "2",
      name: t`John Doe`,
      email: "john@example.com",
      username: "johndoe",
      role: "USER",
      createdAt: t`2025-01-03`,
      emailVerified: true,
    },
  ]);

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
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t`Email`}
                </Label>
                <Input id="email" type="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  {t`Username`}
                </Label>
                <Input id="username" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t`Password`}
                </Label>
                <Input id="password" type="password" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  {t`Role`}
                </Label>
                <Select>
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
                onClick={() => {
                  setIsCreateDialogOpen(false);
                }}
              >
                {t`Cancel`}
              </Button>
              <Button
                onClick={() => {
                  setIsCreateDialogOpen(false);
                }}
              >{t`Create User`}</Button>
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 border-b">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">{user.createdAt}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
