import { t } from "@lingui/macro";
import type { UserDto } from "@reactive-resume/dto";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: UserDto | null;
  isInIframe: boolean;
};

type AuthActions = {
  setUser: (user: UserDto | null) => void;
  setUserWithIframeNotification: (user: UserDto | null) => void;
  notifyParentWindow: (
    status: "authenticated" | "unauthenticated" | "error",
    data?: unknown,
  ) => void;
  handleIframeAuthSuccess: (user: UserDto) => void;
  handleIframeAuthError: (error: string) => void;
  initializeIframeDetection: () => void;
};

const ALLOWED_PARENT_ORIGINS = [
  "https://gigafaze.com",
  "https://www.gigafaze.com",
  window.location.origin,
];

const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const isValidParentOrigin = (origin: string): boolean => {
  return ALLOWED_PARENT_ORIGINS.includes(origin);
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isInIframe: isInIframe(),

      setUser: (user) => {
        set({ user });
      },

      setUserWithIframeNotification: (user) => {
        set({ user });
        const { notifyParentWindow } = get();

        if (user) {
          notifyParentWindow("authenticated", { user });
        } else {
          notifyParentWindow("unauthenticated");
        }
      },

      notifyParentWindow: (status, data) => {
        const { isInIframe } = get();

        if (!isInIframe) {
          return;
        }

        try {
          const message = {
            type: "AUTH_STATUS_CHANGE",
            status,
            data,
            timestamp: Date.now(),
            source: "gfaze-resume",
          };

          for (const origin of ALLOWED_PARENT_ORIGINS) {
            if (origin !== window.location.origin) {
              window.parent.postMessage(message, origin);
            }
          }

          window.parent.postMessage(message, "*");
        } catch {
          // Ignore postMessage errors in cross-origin contexts
        }
      },

      handleIframeAuthSuccess: (user) => {
        const { setUserWithIframeNotification } = get();
        setUserWithIframeNotification(user);

        if (typeof document !== "undefined") {
          const domain = window.location.hostname;
          if (domain.includes("faze.pro")) {
            const cookieValue = t`auth-domain=${domain}; path=/; domain=.faze.pro; secure; samesite=none`;
            // eslint-disable-next-line unicorn/no-document-cookie
            document.cookie = cookieValue;
          }
        }
      },

      handleIframeAuthError: (error) => {
        const { notifyParentWindow } = get();
        notifyParentWindow("error", { error });
      },

      initializeIframeDetection: () => {
        const detectedIsInIframe = isInIframe();
        set({ isInIframe: detectedIsInIframe });

        if (detectedIsInIframe) {
          const handleParentMessage = (event: MessageEvent) => {
            if (!isValidParentOrigin(event.origin)) {
              return;
            }

            if (event.data?.type === "REQUEST_AUTH_STATUS") {
              const { user, notifyParentWindow } = get();
              notifyParentWindow(user ? "authenticated" : "unauthenticated", { user });
            }
          };

          window.addEventListener("message", handleParentMessage);
        }
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }), // Only persist user, not iframe state
    },
  ),
);
