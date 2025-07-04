import { t } from "@lingui/macro";
import { ChartBar, Shield, Users } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { Link } from "react-router";

import { useUser } from "@/client/services/user";

export const AdminSettings = () => {
  const { user } = useUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{t`Administration`}</h3>
        <p className="leading-relaxed opacity-75">
          {t`Administrative tools and system management options for authorized users.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{t`User Management`}</h4>
              <p className="text-muted-foreground text-sm">
                {t`Create, edit, and manage user accounts and permissions`}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard/admin/users">{t`Manage Users`}</Link>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-info/10">
              <ChartBar className="size-5 text-info" />
            </div>
            <div>
              <h4 className="font-medium">{t`System Statistics`}</h4>
              <p className="text-muted-foreground text-sm">
                {t`View system usage, user activity, and performance metrics`}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard/admin/stats">{t`View Statistics`}</Link>
          </Button>
        </div>
      </div>

      {user.role === "SUPER_ADMIN" && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10">
              <Shield className="size-4 text-warning" />
            </div>
            <div>
              <h4 className="font-medium text-warning">{t`Super Administrator`}</h4>
              <p className="text-sm text-warning/80">
                {t`You have full system access and administrative privileges.`}
              </p>
            </div>
          </div>
          <p className="text-xs text-warning/70">
            {t`As a Super Administrator, you can manage all users, view system statistics, and access advanced administrative features.`}
          </p>
        </div>
      )}
    </div>
  );
};
