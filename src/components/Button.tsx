"use client";

import { ReactNode } from "react";
import { WalletType } from "@/types";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  onClick?: () => void;
  walletType?: WalletType;
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
}

const Button = ({
  children,
  variant = "primary",
  onClick,
  className = "",
  icon,
  fullWidth = false,
  disabled = false,
  size = "md",
  type = "button",
}: ButtonProps) => {
  const baseClasses =
    "font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer";

  const variantClasses = {
    primary: "bg-white text-black hover:bg-white/90 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed",
    secondary: "bg-white/10 text-white hover:bg-white/20 disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed",
    tertiary: "bg-[#36FD68] hover:bg-green-500 text-black font-bold text-xl py-2 rounded-2xl transition-colors duration-200",
    ghost: "text-[--text-secondary] hover:text-white bg-transparent outline outline-1 outline-white/30 disabled:text-white/30 disabled:cursor-not-allowed",
  };

  const widthClasses = fullWidth ? "w-full" : "";
  const sizeClasses = {
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
  };
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && e.key === "Enter" && onClick?.()}
    >
      {children}
      {icon && <span className="flex items-center justify-center">{icon}</span>}
    </button>
  );
};

export default Button;
