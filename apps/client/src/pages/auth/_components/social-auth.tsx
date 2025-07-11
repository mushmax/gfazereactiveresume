import { t } from "@lingui/macro";
import { Fingerprint, GithubLogo, GoogleLogo, Warning, X } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle, Button, Skeleton } from "@reactive-resume/ui";
import { useState } from "react";

import { PopupAuthService } from "@/client/services/auth/popup-oauth";
import { useAuthProviders } from "@/client/services/auth/providers";
import { useAuthStore } from "@/client/stores/auth";

export const SocialAuth = () => {
  const { providers } = useAuthProviders();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shouldUsePopup = PopupAuthService.shouldUsePopupMode();

  const handleGoogleAuth = async () => {
    if (!shouldUsePopup) {
      window.location.href = "/api/auth/google";
      return;
    }

    setIsLoading("google");
    setError(null);

    try {
      const result = await PopupAuthService.authenticateWithGoogle();

      if (result.success && result.user) {
        setUser(result.user);
        window.location.href = "/dashboard";
      } else {
        setError(result.error ?? t`Authentication failed`);
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t`Authentication failed`);
    } finally {
      setIsLoading(null);
    }
  };

  if (!providers || providers.length === 0) return null;

  const renderPopupError = () => {
    if (!error) return null;

    const isPopupBlocked = error.includes("blocked") || error.includes("Popup blocked");
    const isTimeout = error.includes("timeout") || error.includes("Authentication timeout");
    const isCancelled = error.includes("cancelled") || error.includes("canceled");

    return (
      <Alert variant="error" className="mb-4">
        <Warning className="size-4" />
        <AlertTitle>
          {isPopupBlocked && t`Popup Blocked`}
          {isTimeout && t`Authentication Timeout`}
          {isCancelled && t`Authentication Cancelled`}
          {!isPopupBlocked && !isTimeout && !isCancelled && t`Authentication Failed`}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {isPopupBlocked && (
            <div className="space-y-2">
              <p>{t`Your browser blocked the authentication popup. Please allow popups for this site and try again.`}</p>
              <p className="text-xs">{t`Look for a popup blocker icon in your browser's address bar.`}</p>
            </div>
          )}
          {isTimeout && <p>{t`The authentication process took too long. Please try again.`}</p>}
          {isCancelled && (
            <p>{t`You cancelled the authentication process. Click the button below to try again.`}</p>
          )}
          {!isPopupBlocked && !isTimeout && !isCancelled && <p>{error}</p>}
        </AlertDescription>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-auto p-1"
          onClick={() => {
            setError(null);
          }}
        >
          <X className="size-3" />
        </Button>
      </Alert>
    );
  };

  const renderLoadingState = () => {
    if (isLoading !== "google") return null;

    return (
      <div className="bg-card mb-4 rounded-lg border p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-muted-foreground text-sm">
            {shouldUsePopup ? t`Opening authentication popup...` : t`Redirecting to Google...`}
          </p>
          {shouldUsePopup && (
            <p className="text-muted-foreground mt-1 text-xs">
              {t`If the popup doesn't appear, check if it was blocked by your browser.`}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPopupError()}
      {renderLoadingState()}

      <div className="grid grid-cols-2 gap-4">
        {providers.includes("github") && (
          <Button
            asChild
            size="lg"
            className="w-full !border-2 !border-[#24292e] !bg-[#24292e] !font-semibold !text-white !shadow-md !transition-all !duration-200 hover:!border-[#1a1e22] hover:!bg-[#1a1e22] hover:!shadow-lg"
          >
            <a href="/api/auth/github">
              <GithubLogo className="mr-3 size-5" />
              {t`Continue with GitHub`}
            </a>
          </Button>
        )}

        {providers.includes("google") && (
          <Button
            size="lg"
            className="w-full !border-2 !border-gray-300 !bg-white !font-semibold !text-gray-700 !shadow-md !transition-all !duration-200 hover:!border-gray-400 hover:!bg-gray-50 hover:!shadow-lg"
            disabled={isLoading === "google"}
            onClick={handleGoogleAuth}
          >
            <GoogleLogo className="mr-3 size-5" />
            {isLoading === "google" ? t`Authenticating...` : t`Continue with Google`}
          </Button>
        )}

        {providers.includes("openid") && (
          <Button
            asChild
            size="lg"
            className="w-full !bg-[#dc2626] !text-white hover:!bg-[#dc2626]/80"
          >
            <a href="/api/auth/openid">
              <Fingerprint className="mr-3 size-4" />
              {import.meta.env.VITE_OPENID_NAME}
            </a>
          </Button>
        )}
      </div>

      {shouldUsePopup && !isLoading && (
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xs text-blue-700">
            {t`Using popup authentication for iframe compatibility`}
          </p>
        </div>
      )}
    </div>
  );
};
