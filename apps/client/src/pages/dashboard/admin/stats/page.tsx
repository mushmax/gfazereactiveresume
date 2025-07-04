import { t } from "@lingui/macro";
import { FileText, TrendUp, UserCheck, Users } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui";
import React from "react";

export const AdminStatsPage = () => {
  const stats = {
    totalUsers: 156,
    totalAdmins: 3,
    totalSuperAdmins: 1,
    recentUsers: 12,
    totalResumes: 423,
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t`System Statistics`}</h1>
        <p className="text-muted-foreground">{t`Overview of system usage and user activity`}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t`Total Users`}
          value={stats.totalUsers}
          description={t`All registered users`}
          icon={Users}
        />
        <StatCard
          title={t`Total Resumes`}
          value={stats.totalResumes}
          description={t`Created resumes`}
          icon={FileText}
        />
        <StatCard
          title={t`Administrators`}
          value={stats.totalAdmins + stats.totalSuperAdmins}
          description={t`Admin and Super Admin users`}
          icon={UserCheck}
        />
        <StatCard
          title={t`Recent Users`}
          value={stats.recentUsers}
          description={t`New users in last 30 days`}
          icon={TrendUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t`User Roles Distribution`}</CardTitle>
            <CardDescription>{t`Breakdown of users by role type`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Regular Users`}</span>
                <span className="text-muted-foreground text-sm">
                  {stats.totalUsers - stats.totalAdmins - stats.totalSuperAdmins}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Administrators`}</span>
                <span className="text-muted-foreground text-sm">{stats.totalAdmins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Super Administrators`}</span>
                <span className="text-muted-foreground text-sm">{stats.totalSuperAdmins}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t`System Health`}</CardTitle>
            <CardDescription>{t`Current system status and metrics`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Database Status`}</span>
                <span className="text-sm text-green-600">{t`Healthy`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Active Sessions`}</span>
                <span className="text-muted-foreground text-sm">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t`Storage Usage`}</span>
                <span className="text-muted-foreground text-sm">{t`2.4 GB`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
