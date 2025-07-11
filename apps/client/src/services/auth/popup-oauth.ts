import { t } from "@lingui/macro";
import type { UserDto } from "@reactive-resume/dto";

export type PopupAuthResult = {
  success: boolean;
  user?: UserDto;
  error?: string;
};

export type PopupAuthOptions = {
  width?: number;
  height?: number;
  timeout?: number;
};

const DEFAULT_OPTIONS: Required<PopupAuthOptions> = {
  width: 500,
  height: 600,
  timeout: 300_000, // 5 minutes
};

const ALLOWED_ORIGINS = new Set([window.location.origin, "https://gfazeresume.faze.pro"]);

const openPopup = (url: string, options: Required<PopupAuthOptions>): Window | null => {
  const { width, height } = options;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    url,
    "oauth-popup",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,location=no`,
  );

  if (popup) {
    popup.focus();
  }

  return popup;
};

const isValidOrigin = (origin: string): boolean => {
  return ALLOWED_ORIGINS.has(origin);
};

const waitForAuthResult = (popup: Window, timeout: number): Promise<PopupAuthResult> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(t`Authentication timeout`));
    }, timeout);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        resolve({
          success: false,
          error: t`Authentication was cancelled by the user`,
        });
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      if (!isValidOrigin(event.origin)) {
        return;
      }

      if (event.data?.type === "OAUTH_SUCCESS") {
        cleanup();
        const authData = event.data.data;

        if (authData?.status === "authenticated" && authData?.user) {
          resolve({
            success: true,
            user: authData.user,
          });
        } else if (authData?.status === "2fa_required") {
          resolve({
            success: false,
            error: t`Two-factor authentication is required. Please complete authentication in the main window.`,
          });
        } else {
          resolve({
            success: false,
            error: t`Authentication failed - invalid response`,
          });
        }
      } else if (event.data?.type === "OAUTH_ERROR") {
        cleanup();
        resolve({
          success: false,
          error: event.data.error ?? t`Authentication failed`,
        });
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      clearInterval(checkClosed);
      window.removeEventListener("message", handleMessage);

      if (!popup.closed) {
        popup.close();
      }
    };

    window.addEventListener("message", handleMessage);
  });
};

const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export const PopupAuthService = {
  async authenticateWithGoogle(options: PopupAuthOptions = {}): Promise<PopupAuthResult> {
    const config = { ...DEFAULT_OPTIONS, ...options };

    try {
      const popup = openPopup("/api/auth/google/popup", config);
      if (!popup) {
        return {
          success: false,
          error: t`Popup blocked. Please allow popups for this site and try again.`,
        };
      }

      const result = await waitForAuthResult(popup, config.timeout);
      return result;
    } catch (error_) {
      return {
        success: false,
        error: error_ instanceof Error ? error_.message : t`Authentication failed`,
      };
    }
  },

  shouldUsePopupMode(): boolean {
    return isInIframe() || window.location.hostname === "gfazeresume.faze.pro";
  },
};
