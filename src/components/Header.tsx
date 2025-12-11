/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthProvider";
import { formatBalance } from "@/utils/format";
import { Bell, Menu, X, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa6";
import AuthModal from "./AuthModal";
import Button from "./Button";
import NotificationsPanel from "./NotificationsPanel";
import WithdrawalModal from "./WithdrawalModal";
import EditProfileModal from "./modals/EditProfileModal";
import type { UserNotification } from "@/generated/prisma";
import PrivateKey from "./wallets/private-key";
import MyWallets from "./wallets/my-wallets";
import ExportPrivateKey from "./wallets/export-private-key";
import SignUpAuthModal from "./used-components/auth/signup/auth-modal";
import SignUpModal from "./used-components/auth/signup/signu-modal";
import SignUpXModal from "./used-components/auth/signup/signupx-modal";
import WelcomeBluffModal from "./used-components/common/modal/welcome-bluff";
import ConnectedbluffModal from "./used-components/common/modal/bluff-connected";
import LoginModal from "./used-components/auth/login/login-modal";
import ConnectWalletModal from "./used-components/auth/login/connect-walllet-modal";
import AccountRecoveryModal from "./used-components/auth/recovery/account-recovery";
import RecoveryCodeModal from "./used-components/auth/recovery/recovery-code";
import SetPasswordModal from "./used-components/auth/recovery/set-password";
import PasswordResetSucessModal from "./used-components/auth/recovery/pwdreset_success";
import RecoveryEmailCodeModal from "./used-components/auth/verify-email/recovery-code";
import PasswordResetEmailSentModal from "./used-components/auth/recovery/reset-email-sent";
import EmptyFunds from "./wallets/empty-funds";
import useHeaderModal from "@/hooks/use-header-modal";
import { useAuth } from "@/hooks/useAuth";
import { ConnectButton } from "./ConnectButton";
import { DEPOSIT_DISABLED, ENABLE_OPTIONS, ENABLE_GAMES } from "@/constants";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<"loggedOut" | "loggedIn" | null>(
    null
  );
  const [showMenu, setShowMenu] = useState(false);
  const [recoveryUserEmail, setRecoveryUserEmail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [hasInitialAuthCheckCompleted, setHasInitialAuthCheckCompleted] =
    useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAuthIndicators, setHasAuthIndicators] = useState(false);

  const { authModal, setAuthModal, open, setOpen } = useHeaderModal();

  // Show signup modal for first-time visitors
  useEffect(() => {
    // Only check on initial mount when authModal is "none"
    if (authModal === "none") {
      const hasSeenSignup = localStorage.getItem("hasSeenSignup");
      if (!hasSeenSignup) {
        setAuthModal("main_signup");
        localStorage.setItem("hasSeenSignup", "true");
      }
    }
  }, [authModal, setAuthModal]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInOAuthFlow, setIsInOAuthFlow] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  // const [accessOpen, setAccessOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    user,
    isLoading,
    signOut,
    dbUser,
    isOAuthInProgress,
    setOAuthInProgress,
    sessionStatus,
  } = useAuthContext();

  const {
    userBalance,
  } = useAuth();

  // Check if we're in an OAuth callback state
  const isOAuthCallback = useMemo(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // Check for OAuth callback parameters
      const hasCode = urlParams.has("code");
      const hasError = urlParams.has("error");
      const hasState = urlParams.has("state");

      // Check for NextAuth specific parameters
      const hasNextAuthError = urlParams.has("error");
      const hasNextAuthCallback = urlParams.has("callbackUrl");

      // Also check if we're on the callback URL path
      const isCallbackPath =
        window.location.pathname.includes("/api/auth/callback") ||
        window.location.pathname.includes("/auth/callback") ||
        window.location.pathname.includes("/api/auth/[...nextauth]");

      // Check if we're on the root path with OAuth parameters (common NextAuth pattern)
      const isRootWithOAuthParams =
        window.location.pathname === "/" && (hasCode || hasError || hasState);

      // Don't treat error pages as OAuth callbacks
      const isErrorPage =
        window.location.pathname === "/auth/error" ||
        window.location.pathname.includes("/error");

      // Check for specific OAuth configuration errors that should not trigger shimmer
      // const isOAuthConfigError =
      //   hasError && urlParams.get("error") === "Configuration";

      // Check for OAuth state validation errors
      const isOAuthStateError =
        hasError &&
        (urlParams.get("error") === "InvalidCheck" ||
          urlParams.get("error") === "Configuration");

      // Consider it an OAuth callback if we have OAuth parameters and it's not a config error
      const result =
        (hasCode ||
          hasError ||
          hasState ||
          isCallbackPath ||
          isRootWithOAuthParams ||
          hasNextAuthError ||
          hasNextAuthCallback) &&
        !isErrorPage &&
        !isOAuthStateError;

      // If there's a configuration or state error, clear OAuth states
      if (isOAuthStateError && typeof window !== "undefined") {
        // console.log(
        //   "OAuth state/configuration error detected, clearing OAuth states"
        // );
        localStorage.removeItem("oauth_in_progress");
      }

      return result;
    }
    return false;
  }, []);

  // Check for server-side OAuth progress state
  const serverOAuthInProgress = useMemo(() => {
    // Check if the session has OAuth progress state
    if (user && user?.oauthInProgress) {
      // console.log("Server-side OAuth progress detected");
      return true;
    }
    return false;
  }, [user]);

  const [notificationButtonPosition, setNotificationButtonPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: "Homepage", href: "/" },
    { label: "Markets", href: "/markets" },
    ...(ENABLE_GAMES ? [{ label: "Games", href: "/games" }] : []),
    // { label: "Options", href: "/options" },
  ];

  const handleLogout = async () => {
    // Clear predicted auth state from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("predicted_auth_state");
    }

    // Immediately set authentication state to logged out
    // Then perform the actual logout
    setIsLoggingOut(true);
    await signOut();
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotifications(false);
  };

  const profileMenuItems = [
    { label: "Profile", href: "/profile" },
    { label: "My Positions", href: "/profile?tab=positions" },
    // { label: "Creator Hub", href: "/creator" },
    { label: "My Wallets", action: () => setOpen("my_wallet") },
    { label: "Logout", action: handleLogout },
  ];

  const mobileMenu = isMounted && isAuthenticated
    ? [...menuItems, ...profileMenuItems]
    : [...menuItems,       { label: "Login", action: () => {
        setAuthModal("login");
      }}, { label: "Sign Up", action: () => {
        setAuthModal("main_signup");
      }}];

  // Track when initial auth check completes
  useEffect(() => {
    if (
      !isLoading &&
      sessionStatus !== "loading" &&
      !hasInitialAuthCheckCompleted
    ) {
      // console.log("Header: Setting hasInitialAuthCheckCompleted to true");
      setHasInitialAuthCheckCompleted(true);
    }
  }, [isLoading, sessionStatus, hasInitialAuthCheckCompleted]);

  // Track OAuth flow state
  useEffect(() => {
    // If we detect OAuth callback parameters, we're in an OAuth flow
    if (isOAuthCallback) {
      setIsInOAuthFlow(true);
    }

    // If session becomes authenticated and we were in OAuth flow, keep showing shimmer briefly
    if (isInOAuthFlow && isAuthenticated && sessionStatus === "authenticated") {
      // Keep showing shimmer for a short time after authentication completes
      const timer = setTimeout(() => {
        setIsInOAuthFlow(false);
      }, 2000); // Show shimmer for 2 seconds after authentication

      return () => clearTimeout(timer);
    }

    // If session status changes to loading and we're not authenticated, we might be in OAuth flow
    if (sessionStatus === "loading" && !isAuthenticated) {
      setIsInOAuthFlow(true);
    }

    // Clear OAuth flow state if session is unauthenticated and no OAuth callback
    if (
      isInOAuthFlow &&
      sessionStatus === "unauthenticated" &&
      !isOAuthCallback
    ) {
      // console.log(
      //   "Clearing isInOAuthFlow - session is unauthenticated and no OAuth callback"
      // );
      setIsInOAuthFlow(false);
    }

    // Clear OAuth flow state if user is definitely logged out and initial auth check completed
    if (
      isInOAuthFlow &&
      sessionStatus === "unauthenticated" &&
      !isAuthenticated &&
      !isOAuthCallback &&
      hasInitialAuthCheckCompleted &&
      !isLoggingOut
    ) {
      // console.log(
      //   "Clearing isInOAuthFlow - user is definitely logged out and not in OAuth flow"
      // );
      setIsInOAuthFlow(false);
    }
  }, [
    isOAuthCallback,
    isInOAuthFlow,
    isAuthenticated,
    sessionStatus,
    hasInitialAuthCheckCompleted,
    isLoggingOut,
  ]);

  // Clear OAuth callback state once authentication is complete
  useEffect(() => {
    if (isOAuthCallback && isAuthenticated && !isLoading) {
      // Remove OAuth callback parameters from URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("error");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [isOAuthCallback, isAuthenticated, isLoading]);

  // Clear OAuth progress state once authentication is complete
  useEffect(() => {
    if (isOAuthInProgress && isAuthenticated && !isLoading) {
      setOAuthInProgress(false);
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("oauth_in_progress");
      }
    }
  }, [isOAuthInProgress, isAuthenticated, isLoading, setOAuthInProgress]);

  // Clear server-side OAuth progress state once authentication is complete
  useEffect(() => {
    if (serverOAuthInProgress && isAuthenticated && !isLoading) {
      // console.log("Clearing server-side OAuth progress state");
      // The server-side state will be cleared on the next session update
      // We can't directly modify it from the client, but it should be cleared
      // when the session is refreshed
    }
  }, [serverOAuthInProgress, isAuthenticated, isLoading]);

  // Clear logout state when session becomes unauthenticated (but not during logout)
  useEffect(() => {
    if (sessionStatus === "unauthenticated" && !isLoggingOut) {
      // Only clear if we're not currently in a logout process
      setIsLoggingOut(false);
    }
  }, [sessionStatus, isLoggingOut]);

  // Clear login in progress state when session becomes authenticated
  useEffect(() => {
    if (sessionStatus === "authenticated" && isAuthenticated) {
      setIsLoginInProgress(false);
    }
  }, [sessionStatus, isAuthenticated]);

  // Clear logout state when session becomes authenticated (successful login)
  useEffect(() => {
    if (sessionStatus === "authenticated" && isAuthenticated && isLoggingOut) {
      // console.log(
      //   "Header: Clearing isLoggingOut because session is now authenticated"
      // );
      setIsLoggingOut(false);
    }
  }, [sessionStatus, isAuthenticated, isLoggingOut]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModal("none");
    setIsLoginInProgress(false);
  };

  const handleAuthSuccess = () => {
    // TODO: ensure user has a wallet address set
    setIsAuthModalOpen(false);
    setAuthModal("none");
    setIsLoginInProgress(false);
  };

  const handleOpenWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleCloseWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setAuthModal("none");
  };

  const toggleNotifications = async () => {
    if (notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      setNotificationButtonPosition({
        top: rect.top,
        right: window.innerWidth - rect.right,
      });
    }
    
    if (!showNotifications && dbUser?.notifications?.some(n => !n.viewed)) {
      try {
        await fetch("/api/notifications/mark-viewed", {
          method: "POST",
        });
        window.location.reload();
      } catch (error) {
        console.error("Error marking notifications as viewed:", error);
      }
    }
    
    setShowNotifications(!showNotifications);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };


  const handleCloseEditProfileModal = () => {
    setOpen(null);
  };

  const notificationCount =
    dbUser?.notifications?.filter((notification: UserNotification) =>
      !notification.viewed
    ).length || 0;

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    // console.log("Header: Setting isMounted to true");
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setAuthState(
        localStorage?.getItem("authState") as "loggedIn" | "loggedOut" | null
      );
    }
  }, []);

  // Update authState based on actual authentication status
  useEffect(() => {
    if (isMounted) {
      if (sessionStatus === "authenticated" && isAuthenticated) {
        // console.log("Header: Updating authState to loggedIn");
        setAuthState("loggedIn");
        if (typeof window !== "undefined") {
          localStorage.setItem("authState", "loggedIn");
        }
      } else if (sessionStatus === "unauthenticated" && !isAuthenticated) {
        // console.log("Header: Updating authState to loggedOut");
        setAuthState("loggedOut");
        if (typeof window !== "undefined") {
          localStorage.setItem("authState", "loggedOut");
        }
      }
    }
  }, [sessionStatus, isAuthenticated, isMounted]);

  // Check for auth indicators after mounting
  useEffect(() => {
    // console.log(
    //   "Header: Auth indicators useEffect triggered, isMounted:",
    //   isMounted
    // );
    if (isMounted && typeof window !== "undefined") {
      // console.log("Header: Checking auth indicators after mount");
      try {
        // Check for stored auth state
        const storedAuthState = localStorage.getItem("predicted_auth_state");
        // console.log("Header: Stored auth state:", storedAuthState);
        if (storedAuthState === "authenticated") {
          // console.log(
          //   "Header: Auth indicator found - stored auth state is authenticated"
          // );
          setHasAuthIndicators(true);
          return;
        }

        // Check for NextAuth session cookies
        const hasNextAuthCookie =
          document.cookie.includes("next-auth.session-token") ||
          document.cookie.includes("__Secure-next-auth.session-token");

        // Check for any auth-related cookies
        const hasAuthCookies =
          document.cookie.includes("auth") ||
          document.cookie.includes("session") ||
          document.cookie.includes("token");

        const hasIndicators = hasNextAuthCookie || hasAuthCookies;
        setHasAuthIndicators(hasIndicators);
        // console.log("Header: Set hasAuthIndicators to:", hasIndicators);
      } catch {
        // console.log("Header: Error in auth indicators check");
        setHasAuthIndicators(false);
      }
    } else {
      // console.log(
      //   "Header: Auth indicators useEffect - not mounted or window not defined"
      // );
    }
  }, [isMounted]);

  // Open login modal automatically if URL contains ?login=true
  useEffect(() => {
    const shouldOpenLogin = searchParams.get("login") === "true";
    if (shouldOpenLogin) {
      // Remove the login parameter to avoid reopening on future navigations
      const params = new URLSearchParams(searchParams.toString());
      params.delete("login");
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, {
        scroll: false,
      });

      // Open login modal
      setAuthModal("login");
    }
  }, [searchParams, pathname, router, setAuthModal]);

  // Open signup modal automatically if URL contains ?signup=true
  useEffect(() => {
    const shouldOpenSignup = searchParams.get("signup") === "true";
    if (shouldOpenSignup && !isAuthenticated) {
      // Remove the signup parameter to avoid reopening on future navigations
      const params = new URLSearchParams(searchParams.toString());
      params.delete("signup");
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, {
        scroll: false,
      });

      // Open signup modal
      setAuthModal("main_signup");
    }
  }, [searchParams, pathname, router, setAuthModal, isAuthenticated]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[70] px-4 py-2 bg-black backdrop-blur-lg border-b border-white/10 h-[80px]">
        <div className="container mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Bluff"
                width={97.7}
                height={50}
                className="h-12 !cursor-pointer"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`nav-link ${
                  pathname === "/"
                    ? "text-white-500 font-bold"
                    : "text-white/80"
                }`}
              >
                Home
              </Link>
              <Link
                href="/markets"
                className={`nav-link ${
                  pathname.startsWith("/market")
                    ? "text-white-500 font-bold"
                    : "text-white/80"
                }`}
              >
                Markets
              </Link>
              {ENABLE_GAMES && <Link
                href="/games"
                className={`nav-link ${
                  pathname.startsWith("/games") || pathname.startsWith("/blackjack")
                    ? "text-white-500 font-bold"
                    : "text-white/80"
                }`}
              >
                Games
              </Link>}
              {ENABLE_OPTIONS && <Link
                href="/options"
                className={`nav-link ${
                  pathname.startsWith("/options")
                    ? "text-white-500 font-bold"
                    : "text-white/80"
                }`}
              >
                Options
              </Link>}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {(() => {
              // During SSR, render a consistent state to prevent hydration mismatches
              if (!isMounted) {
                return (
                  <div className="flex items-center gap-4">
                    {/* Loading Balance */}
                    <div className="bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between border border-white/20 h-10 sm:min-h-0 min-w-[110px]">
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                          Balance
                        </span>
                        <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                          <span className="inline-block w-12 h-[1em] bg-gray-700 rounded animate-pulse align-middle"></span>
                        </span>
                      </div>
                      <div className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2">
                        <FaPlus className="text-black text-xs sm:text-xs" />
                      </div>
                    </div>

                    {/* Loading Notifications */}
                    <div className="relative">
                      <button className="p-3 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                        <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                      </button>
                    </div>

                    <div className="hidden sm:text-gray-400 font-normal">|</div>

                    {/* Loading Profile Image */}
                    <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer profile-shimmer" />
                    </div>
                  </div>
                );
              }

              // Show nothing until we have confidence about the auth state
              // This prevents any shimmer flash or incorrect UI states

              // Simple debug logging to understand state
              // console.log("Header: Basic state:", {
              //   isOAuthCallback,
              //   sessionStatus,
              //   isAuthenticated,
              //   isLoggingOut,
              //   hasInitialAuthCheckCompleted,
              //   authState,
              //   hasAuthIndicators,
              //   isMounted,
              // });

              // PRIORITY 0: If login is in progress, show shimmer immediately
              // This provides immediate visual feedback when user clicks login
              if (isLoginInProgress) {
                // console.log(
                //   "Header: Showing shimmer because login is in progress"
                // );
                return (
                  <div className="flex items-center gap-4">
                    {/* Loading Balance */}
                    <div className="bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between border border-white/20 h-10 sm:min-h-0 min-w-[110px]">
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                          Balance
                        </span>
                        <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                          <span className="inline-block w-12 h-[1em] bg-gray-700 rounded animate-pulse align-middle"></span>
                        </span>
                      </div>
                      <div className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2">
                        <FaPlus className="text-black text-xs sm:text-xs" />
                      </div>
                    </div>

                    {/* Loading Notifications */}
                    <div className="relative">
                      <button className="p-3 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                        <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                      </button>
                    </div>

                    <div className="hidden sm:text-gray-400 font-normal">|</div>

                    {/* Loading Profile Image */}
                    <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer profile-shimmer" />
                    </div>
                  </div>
                );
              }

              // PRIORITY 0.5: If OAuth callback is detected, show shimmer
              // This prevents the flash of login/signup buttons when OAuth callback returns
              if (isMounted && isOAuthCallback) {
                // console.log(
                //   "Header: Showing shimmer because OAuth callback detected"
                // );
                return (
                  <div className="flex items-center gap-4">
                    {/* Loading Balance */}
                    <div className="bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between border border-white/20 h-10 sm:min-h-0 min-w-[110px]">
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                          Balance
                        </span>
                        <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                          <span className="inline-block w-12 h-[1em] bg-gray-700 rounded animate-pulse align-middle"></span>
                        </span>
                      </div>
                      <div className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2">
                        <FaPlus className="text-black text-xs sm:text-xs" />
                      </div>
                    </div>

                    {/* Loading Notifications */}
                    <div className="relative">
                      <button className="p-3 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                        <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                      </button>
                    </div>

                    <div className="hidden sm:text-gray-400 font-normal">|</div>

                    {/* Loading Profile Image */}
                    <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer profile-shimmer" />
                    </div>
                  </div>
                );
              }

              // PRIORITY 1: If session status is unauthenticated and not logging out, show login/signup buttons
              if (
                (sessionStatus === "unauthenticated" && !isLoggingOut) ||
                (sessionStatus === "loading" &&
                  authState === "loggedOut" &&
                  !isOAuthInProgress &&
                  isMounted) ||
                (sessionStatus === "loading" &&
                  !isAuthenticated &&
                  !hasAuthIndicators &&
                  hasInitialAuthCheckCompleted &&
                  isMounted)
              ) {
                // console.log(
                //   "Header: Showing login/signup buttons because session is unauthenticated"
                // );
                return (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAuthModal("login");
                      }}
                      className="text-xs px-4 py-0.5 border border-gray-500 [@media(max-width:425px)]:px-6 [@media(max-width:425px)]:py-2 [@media(max-width:425px)]:text-sm"
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setAuthModal("main_signup");
                      }}
                      className="text-xs px-4 py-0.5 [@media(max-width:425px)]:px-6 [@media(max-width:425px)]:py-2 [@media(max-width:425px)]:text-sm"
                    >
                      Sign Up
                    </Button>
                  </div>
                );
              }

              // PRIORITY 1.5: If logging out, immediately show login/signup buttons
              // This provides immediate feedback when user clicks logout
              if (isLoggingOut) {
                // console.log(
                //   "Header: Showing login/signup buttons because logging out"
                // );
                return (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAuthModal("login");
                      }}
                      className="text-xs px-4 border border-gray-500"
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setAuthModal("main_signup");
                      }}
                      className="text-xs px-4"
                    >
                      Sign Up2
                    </Button>
                  </div>
                );
              }

              // PRIORITY 2: If session status is authenticated and not logging out, show authenticated UI
              // But only if dbUser is loaded to prevent default avatar flash
              if (
                sessionStatus === "authenticated" &&
                isAuthenticated &&
                !isLoggingOut &&
                dbUser &&
                userBalance !== undefined
              ) {
                // console.log(
                //   "Header: Showing authenticated UI because session is authenticated and dbUser is loaded"
                // );
                return (
                  <div className="flex items-center gap-4">
                    <div
                      className={`bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between 
        border border-white/20 transition-colors 
        duration-200 h-10 sm:min-h-0 min-w-[110px] ${
          DEPOSIT_DISABLED ? "" : "hover:bg-white/20 cursor-pointer"
        }`}
                      onClick={DEPOSIT_DISABLED ? undefined : handleOpenWithdrawModal}
                    >
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                          Balance
                        </span>
                        <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                          {formatBalance(userBalance)}
                        </span>
                      </div>
                      <div
                        className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2 
      hover:bg-gray-200 transition-colors"
                      >
                        <FaPlus className="text-black text-xs sm:text-xs" />
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        ref={notificationButtonRef}
                        className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer relative"
                        onClick={toggleNotifications}
                      >
                        <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                        {notificationCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                            {notificationCount}
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="hidden sm:text-gray-400 font-normal">|</div>

                    <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                      <div
                        ref={profileButtonRef}
                        className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer"
                        onClick={() => router.push("/profile")}
                      >
                        <Image
                          src={dbUser?.avatar || "/images/dummy.png"}
                          alt="Profile picture"
                          width={40}
                          height={40}
                          className="object-cover w-full h-full !cursor-pointer"
                          id="profile-menu-button"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // PRIORITY 3: If session is loading OR authenticated but dbUser not loaded, show shimmer
              // This gives a consistent shimmer experience until auth state is determined and user data is loaded
              if (
                (sessionStatus === "loading" &&
                  isAuthenticated &&
                  hasAuthIndicators &&
                  isMounted) ||
                (sessionStatus === "authenticated" &&
                  isAuthenticated &&
                  !dbUser) ||
                (sessionStatus === "loading" &&
                  isAuthenticated &&
                  authState === "loggedIn" &&
                  hasAuthIndicators &&
                  isMounted)
              ) {
                // console.log(
                //   "Header: Showing shimmer because session is loading and authenticated or dbUser not loaded yet",
                //   {
                //     sessionStatus,
                //     isAuthenticated,
                //     dbUser: !!dbUser,
                //     authState,
                //   }
                // );
                return (
                  <div className="flex items-center gap-4">
                    {/* Loading Balance */}
                    <div className="bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between border border-white/20 h-10 sm:min-h-0 min-w-[110px]">
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                          Balance
                        </span>
                        <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                          <span className="inline-block w-12 h-[1em] bg-gray-700 rounded animate-pulse align-middle"></span>
                        </span>
                      </div>
                      <div className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2">
                        <FaPlus className="text-black text-xs sm:text-xs" />
                      </div>
                    </div>

                    {/* Loading Notifications */}
                    <div className="relative">
                      <button className="p-3 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                        <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                      </button>
                    </div>

                    <div className="hidden sm:text-gray-400 font-normal">|</div>

                    {/* Loading Profile Image */}
                    <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer profile-shimmer" />
                    </div>
                  </div>
                );
              }

              // PRIORITY 4: If logging out, show nothing
              if (isLoggingOut) {
                // console.log("Header: Showing nothing because logging out");
                return null;
              }

              // Fallback: show login/signup buttons if we're not sure but session is not loading
              if (
                sessionStatus !== "loading" &&
                !isAuthenticated &&
                !isLoggingOut
              ) {
                // console.log(
                //   "Header: Showing login/signup buttons as fallback - session not loading and not authenticated"
                // );
                return (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAuthModal("login");
                      }}
                      className="text-xs px-4 py-0.5 border border-gray-500"
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setAuthModal("main_signup");
                      }}
                      className="text-xs px-4 py-0.5"
                    >
                      Sign Up3
                    </Button>
                  </div>
                );
              }

              // Final fallback: show skeleton if we're not sure to prevent height shift
              // console.log("Header: Showing skeleton as final fallback", {
              //   sessionStatus,
              //   isAuthenticated,
              //   dbUser: !!dbUser,
              //   isLoggingOut,
              //   authState,
              //   isMounted,
              // });
              return (
                <div className="flex items-center gap-4">
                  {/* Loading Balance */}
                  <div className="bg-transparent px-3 py-1 sm:px-4 sm:py-0.5 rounded-full flex items-center justify-between border border-white/20 h-10 sm:min-h-0 min-w-[110px]">
                    <div className="flex flex-col">
                      <span className="hidden sm:block text-gray-400 text-[12px] font-geist">
                        Balance
                      </span>
                      <span className="font-semibold text-[13px] sm:text-[12px] font-geist leading-4 tabular-nums">
                        <span className="inline-block w-12 h-[1em] bg-gray-700 rounded animate-pulse align-middle"></span>
                      </span>
                    </div>
                    <div className="bg-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center ml-2">
                      <FaPlus className="text-black text-xs sm:text-xs" />
                    </div>
                  </div>

                  {/* Loading Notifications */}
                  <div className="relative">
                    <button className="p-3 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                      <Bell className="text-white w-3.5 h-3.5 !cursor-pointer" />
                    </button>
                  </div>

                  <div className="hidden sm:text-gray-400 font-normal">|</div>

                  {/* Loading Profile Image */}
                  <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden cursor-pointer profile-shimmer" />
                  </div>
                </div>
              );
            })()}

            <div className="relative" ref={menuRef}>
              <button
                className="p-0.5 transition-colors cursor-pointer"
                aria-label="Toggle menu"
                tabIndex={0}
                onClick={toggleMenu}
              >
                {showMenu ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-14 w-[250px] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-50"
                  ref={menuRef}
                >
                  {isMounted && isAuthenticated && dbUser && (
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden">
                          {dbUser?.avatar && dbUser.avatar.startsWith("http") ? (
                            <Image
                              src={dbUser.avatar}
                              alt="Profile picture"
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/dummy.png";
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = "1";
                              }}
                              style={{ opacity: 0, transition: "opacity 0.2s" }}
                            />
                          ) : (
                            <Image
                              src={dbUser?.avatar || "/images/dummy.png"}
                              alt="Profile picture"
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              priority
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/dummy.png";
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = "1";
                              }}
                              style={{ opacity: 0, transition: "opacity 0.2s" }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {dbUser?.username || "User"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {dbUser?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-2 pb-1">
                    {mobileMenu.map((item: any) => {
                      if (item.href) {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowMenu(false)}
                            className={`pointer block w-full px-5 mb-1 py-3 bg-[#1A1A2A] rounded-xl text-white hover:bg-[#23233A] transition-colors ${
                              typeof window !== "undefined" && window.location.pathname === item.href
                                ? "font-bold"
                                : ""
                            }`}
                          >
                            {item.label}
                          </Link>
                        );
                      } else {
                        return (
                          <div
                            className="block w-full px-5 mb-1 py-3 bg-[#1A1A2A] rounded-xl text-white hover:bg-[#23233A] pointer transition-colors"
                            onClick={() => {
                              item.action();
                              setShowMenu(false);
                            }}
                            key={item.label}
                          >
                            {item.label}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen || authModal === "login_x"}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
      {authModal === "login" && (
        <LoginModal
          isOpen={authModal === "login"}
          onClose={() => {
            setAuthModal("none");
            setIsLoginInProgress(false);
          }}
          setAuthModal={setAuthModal}
          onLoginStart={() => setIsLoginInProgress(true)}
          onLoginEnd={() => setIsLoginInProgress(false)}
        />
      )}
      {authModal === "connect_wallet" && (
        <ConnectWalletModal
          isOpen={authModal === "connect_wallet"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "connected_wallet" && (
        <ConnectedbluffModal
          isOpen={authModal === "connected_wallet"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "signup_email_verify" && (
        <RecoveryEmailCodeModal
          isOpen={authModal === "signup_email_verify"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
          recoveryUserEmail={recoveryUserEmail!}
        />
      )}
      {authModal === "main_signup" && (
        <SignUpAuthModal
          isOpen={authModal === "main_signup"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
          setRecoveryUserEmail={setRecoveryUserEmail}
        />
      )}
      {authModal === "signup" && (
        <SignUpModal
          userId={user?.id || ""}
          isOpen={authModal === "signup"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "signup_x" && (
        <SignUpXModal
          isOpen={authModal === "signup_x"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "welcome_bluff" && (
        <WelcomeBluffModal
          isOpen={authModal === "welcome_bluff"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "account_recovery" && (
        <AccountRecoveryModal
          isOpen={authModal === "account_recovery"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
          setRecoveryUserEmail={setRecoveryUserEmail}
        />
      )}
      {authModal === "recovery_code" && (
        <RecoveryCodeModal
          recoveryUserEmail={recoveryUserEmail!}
          isOpen={authModal === "recovery_code"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "new_password" && (
        <SetPasswordModal
          recoveryUserEmail={recoveryUserEmail!}
          isOpen={authModal === "new_password"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "reset_password_success" && (
        <PasswordResetSucessModal
          isOpen={authModal === "reset_password_success"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
        />
      )}
      {authModal === "reset_email_sent" && (
        <PasswordResetEmailSentModal
          isOpen={authModal === "reset_email_sent"}
          onClose={() => {
            setAuthModal("none");
          }}
          setAuthModal={setAuthModal}
          recoveryUserEmail={recoveryUserEmail!}
        />
      )}
      {isWithdrawModalOpen && dbUser && (
        <WithdrawalModal
          onClose={handleCloseWithdrawModal}
          dbUser={dbUser}
          isDeposit={true}
        />
      )}
      <NotificationsPanel
        isOpen={showNotifications}
        notifications={dbUser?.notifications?.slice(-10) || []}
        onClose={closeNotifications}
        buttonPosition={notificationButtonPosition || undefined}
      />
      <EditProfileModal
        isOpen={open === "edit_profile"}
        onClose={handleCloseEditProfileModal}
      />
      {open === "private_key" && <PrivateKey onClose={() => setOpen(null)} />}
      {open === "my_wallet" && (
        <MyWallets
          onClose={() => setOpen(null)}
          onPrivateKey={() => setOpen("export_private_key")}
          onAddWallet={() => {
            // Open the wallet_connect modal which will use ConnectButton
            setOpen("wallet_connect");
          }}
        />
      )}
      {open === "empty_funds" && (
        <EmptyFunds
          onClose={() => setOpen(null)}
          onDeposit={() => setIsWithdrawModalOpen(true)}
        />
      )}
      {open === "export_private_key" && (
        <ExportPrivateKey
          onClose={() => setOpen(null)}
          onExportPrivateKey={() => setOpen("private_key")}
        />
      )}
      {open === "wallet_connect" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setOpen(null)} />
      )}
      {open === "wallet_connect" && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-[#0D0D0D] rounded-[24px] overflow-hidden w-[460px]">
            <div className="flex items-center justify-between px-6 pt-6 pb-8">
              <button className="p-1 hover:bg-white/5 rounded-full">
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-[20px] font-medium text-white">Connect Wallet</h2>
              <button onClick={() => setOpen(null)} className="p-1 hover:bg-white/5 rounded-full">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="px-4 pb-6 space-y-4">
              <div className="text-center">
                <p className="text-[#808080] text-[15px] mb-4">
                  Connect your wallet to add it to your Bluff account
                </p>
              </div>

              <ConnectButton isWalletBalanceShow={false} usdcBalance={0}>
                <Button
                  variant="primary"
                  className="w-full h-[46px] text-[17px] font-medium"
                  onClick={() => {
                    // The ConnectButton will handle opening the web3modal
                    // We can close this modal after a short delay to let the web3modal open
                    setTimeout(() => {
                      setOpen(null);
                    }, 100);
                  }}
                >
                  Connect Wallet
                </Button>
              </ConnectButton>

              <div className="text-center">
                <p className="text-[#808080] text-[13px]">
                  This will open the wallet connection modal where you can choose from 450+ supported wallets
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-4 border-t border-[#1A1A1A]">
              <span className="text-[#808080] text-[13px]">Haven&apos;t got a wallet?</span>
              <a href="#" className="text-[#4F7CFF] text-[13px] hover:opacity-80">
                Get started
              </a>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Header;
