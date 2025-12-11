"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type authModalKey =
  | "none"
  | "main_signup"
  | "signup"
  | "signup_x"
  | "signup_email_verify"
  | "welcome_bluff"
  | "connect_wallet"
  | "connected_wallet"
  | "login"
  | "login_x"
  | "login_connect"
  | "account_recovery"
  | "recovery_code"
  | "new_password"
  | "reset_password_success"
  | "reset_email_sent";

type OpenModalKey = 
  | "edit_profile"
  | "wallet_connect"
  | "private_key"
  | "my_wallet"
  | "export_private_key"
  | "empty_funds"
  | null;

interface HeaderModalContextType {
  authModal: authModalKey;
  setAuthModal: (modal: authModalKey) => void;
  open: OpenModalKey;
  setOpen: (modal: OpenModalKey) => void;
}

const HeaderModalContext = createContext<HeaderModalContextType | undefined>(undefined);

export function HeaderModalProvider({ children }: { children: ReactNode }) {
  const [authModal, setAuthModal] = useState<authModalKey>("none");
  const [open, setOpen] = useState<OpenModalKey>(null);

  return (
    <HeaderModalContext.Provider value={{ authModal, setAuthModal, open, setOpen }}>
      {children}
    </HeaderModalContext.Provider>
  );
}

const useHeaderModal = () => {
  const context = useContext(HeaderModalContext);
  if (context === undefined) {
    throw new Error("useHeaderModal must be used within a HeaderModalProvider");
  }
  return context;
};

export default useHeaderModal;
