import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router";

import { BackupOtpPage } from "../pages/auth/backup-otp/page";
import { ForgotPasswordPage } from "../pages/auth/forgot-password/page";
import { AuthLayout } from "../pages/auth/layout";
import { LoginPage } from "../pages/auth/login/page";
import { RegisterPage } from "../pages/auth/register/page";
import { ResetPasswordPage } from "../pages/auth/reset-password/page";
import { VerifyEmailPage } from "../pages/auth/verify-email/page";
import { VerifyOtpPage } from "../pages/auth/verify-otp/page";
import { BuilderLayout } from "../pages/builder/layout";
import { builderLoader, BuilderPage } from "../pages/builder/page";
import { AdminStatsPage } from "../pages/dashboard/admin/stats/page";
import { AdminUsersPage } from "../pages/dashboard/admin/users/page";
import { DocumentsPage } from "../pages/dashboard/documents/page";
import { DashboardLayout } from "../pages/dashboard/layout";
import { ResumesPage } from "../pages/dashboard/resumes/page";
import { SettingsPage } from "../pages/dashboard/settings/page";
import { HomeLayout } from "../pages/home/layout";
import { HomePage } from "../pages/home/page";
import { ErrorPage } from "../pages/public/error";
import { publicLoader, PublicResumePage } from "../pages/public/page";
import { Providers } from "../providers";
import { AdminGuard } from "./guards/admin";
import { AuthGuard } from "./guards/auth";
import { GuestGuard } from "./guards/guest";
import { authLoader } from "./loaders/auth";

export const routes = createRoutesFromElements(
  <Route element={<Providers />}>
    <Route errorElement={<ErrorPage />}>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="auth">
        <Route element={<AuthLayout />}>
          <Route element={<GuestGuard />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Password Recovery */}
          <Route element={<GuestGuard />}>
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Two-Factor Authentication */}
          <Route element={<GuestGuard />}>
            <Route path="verify-otp" element={<VerifyOtpPage />} />
            <Route path="backup-otp" element={<BackupOtpPage />} />
          </Route>

          {/* Email Verification */}
          <Route element={<AuthGuard />}>
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* OAuth Callback */}
          <Route path="callback" loader={authLoader} element={<div />} />
        </Route>

        <Route index element={<Navigate replace to="/auth/login" />} />
      </Route>

      <Route path="dashboard">
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="resumes" element={<ResumesPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="admin" element={<AdminGuard />}>
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="stats" element={<AdminStatsPage />} />
            </Route>

            <Route index element={<Navigate replace to="/dashboard/resumes" />} />
          </Route>
        </Route>
      </Route>

      <Route path="builder">
        <Route element={<AuthGuard />}>
          <Route element={<BuilderLayout />}>
            <Route path=":id" loader={builderLoader} element={<BuilderPage />} />

            <Route index element={<Navigate replace to="/dashboard/resumes" />} />
          </Route>
        </Route>
      </Route>

      {/* Public Routes */}
      <Route path=":username">
        <Route path=":slug" loader={publicLoader} element={<PublicResumePage />} />
      </Route>
    </Route>
  </Route>,
);

export const router = createBrowserRouter(routes);
