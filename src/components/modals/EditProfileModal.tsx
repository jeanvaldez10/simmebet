/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { Copy } from "lucide-react";
import React, { useState } from "react";
import { getConnectorIconByName, validateUsername } from "@/utils";
import { useAuthContext } from "@/context/AuthProvider";
import { formatWalletAddress } from "@/utils/format";
import { useToast } from "../common/ToastContext";
import { uploadFile } from "@/utils/blob";
import { cn } from "@/lib/utils";
import CommonModal from ".";
import HorizontalLine from "../common/HorizontalLine";
import { signIn } from "next-auth/react";

interface ProfileFormData {
  username: string;
  email: string;
  xAccount: string;
  walletId: string;
  avatar: string;
  socials: {
    facebook: string;
  };
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form field component for consistent styling
const FormField = ({ 
  label, 
  children, 
  error, 
  helperText 
}: { 
  label: string; 
  children: React.ReactNode; 
  error?: string; 
  helperText?: string; 
}) => (
  <div className="flex flex-col">
    <div className="flex items-center">
      <label className="w-28 text-[#FFFFFFA3] text-sm font-medium">
        {label}
      </label>
      <div className="flex-1">
        {children}
      </div>
    </div>
    {error && (
      <div className="ml-28 mt-1">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )}
    {helperText && (
      <div className="ml-28 mt-1">
        <p className="text-blue-400 text-sm">{helperText}</p>
      </div>
    )}
  </div>
);

// Input component with consistent styling
const StyledInput = ({ 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "w-full rounded-full px-4 py-2 text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-[#2E3144] text-sm transition-all duration-200",
      props.disabled && "opacity-50 cursor-not-allowed",
      props.className
    )}
  />
);

// Button component with consistent styling
const StyledButton = ({ 
  variant = "primary", 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "danger" | "ghost"; 
}) => {
  const baseClasses = "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-white text-black hover:bg-gray-100",
    secondary: "bg-transparent border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF0A]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-white hover:bg-[#FFFFFF0A]"
  };

  return (
    <button
      {...props}
      className={cn(baseClasses, variantClasses[variant], props.className)}
    >
      {children}
    </button>
  );
};

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const [image, setImage] = useState<File>();
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { dbUser, refreshDbUser } = useAuthContext();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string>("");

  const [currentData, setCurrentData] = useState<ProfileFormData>(() => ({
    username: dbUser?.username || "",
    email: dbUser?.email || "",
    xAccount: (dbUser as any)?.xAccount || "",
    walletId: address || "",
    avatar: dbUser?.avatar || "/images/dummy.png",
    socials: {
      facebook: dbUser?.facebook || "",
    },
  }));

  const [formData, setFormData] = useState<ProfileFormData>(currentData);

  React.useEffect(() => {
    if (dbUser) {
      const newData = {
        username: dbUser.username || "",
        email: dbUser.email || "",
        xAccount: (dbUser as any).xAccount || "",
        walletId: address || "",
        avatar: dbUser.avatar || "/images/dummy.png",
        socials: {
          facebook: dbUser.facebook || "",
        },
      };
      setCurrentData(newData);
      setFormData(newData);
      setUsernameError("");
    }
  }, [dbUser, address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      // Update form data with the input value
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear any previous errors
      setUsernameError("");
      
      // Only validate if user has typed something
      if (value.length > 0) {
        const validationResult = validateUsername(value);
        if (!validationResult.isValid) {
          setUsernameError(validationResult.error || "Invalid username format");
        }
      }
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileFormData] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!dbUser?.id) {
      showToast({ message: "User not found" });
      return;
    }

    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast({ message: "Image must be less than 4MB" });
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showToast({
          message: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!dbUser?.id || usernameError) {
        return;
      }

      setIsLoading(true);

      const newBlob = image && await uploadFile(
        `avatar.${image.type.split("/")[1]}`, 
        image
      );

      const updateData: any = {
        avatar: newBlob?.url || formData.avatar,
      };

      if (!((dbUser as any)?.twitterId && (dbUser as any)?.authenticatedType === "social")) {
        updateData.username = formData.username;
      }

      if ((dbUser as any)?.twitterId) {
        updateData.xAccount = formData.xAccount;
      }

      const response = await fetch(`/api/users/${dbUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error?.error || "Failed to update profile";

        if (errorMessage.toLowerCase().includes("username already exists")) {
          setUsernameError("This username is already taken. Please choose a different one.");
          setImage(undefined);
        } else {
          showToast({ message: errorMessage });
          setFormData(currentData);
          setImage(undefined);
        }
        return;
      }

      await response.json();

      const updatedProfileData = {
        ...formData,
        avatar: newBlob?.url || formData.avatar,
      };
      setCurrentData(updatedProfileData);
      showToast({ message: "Profile updated successfully" });
      onClose();
      setImage(undefined);
      // Refresh the user data to show the updated avatar
      await refreshDbUser();
    } catch (error) {
      console.log(error);
      setFormData(currentData);
      setImage(undefined);
      showToast({
        message: (error as Error)?.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(currentData);
    setImage(undefined);
    setUsernameError("");
    onClose();
  };

  const handleCopyWallet = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      showToast({ message: "Address copied to Clipboard" });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      showToast({ message: "Wallet disconnected successfully" });
    } catch (error: unknown) {
      console.error("Failed to disconnect wallet:", error);
      showToast({ message: "Failed to disconnect wallet" });
    }
  };

  const handleDisconnectTwitter = async () => {
    try {
      if (!dbUser?.id) {
        showToast({ message: "User not found" });
        return;
      }

      setIsLoading(true);

      const response = await fetch(`/api/users/${dbUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterId: null,
          xAccount: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        showToast({ message: error?.error || "Failed to disconnect Twitter account" });
        return;
      }

      setFormData((prev) => ({ ...prev, xAccount: "" }));
      setCurrentData((prev) => ({ ...prev, xAccount: "" }));
      showToast({ message: "X Account disconnected successfully" });
      await refreshDbUser();
    } catch (error) {
      console.error("Error disconnecting Twitter:", error);
      showToast({
        message: `Failed to disconnect Twitter account: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTwitter = async () => {
    try {
      if (!dbUser?.id) {
        showToast({ message: "User not found" });
        return;
      }

      document.cookie = `twitterLinkingUserId=${dbUser.id}; path=/; max-age=60`;

      signIn("twitter", {
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/link-callback?userId=${dbUser.id}&linking=true`,
      });
    } catch (error) {
      console.error("Error connecting Twitter:", error);
      showToast({
        message: `Failed to connect Twitter account: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const formattedDate = dbUser?.createdAt && !isNaN(new Date(dbUser.createdAt).getTime())
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Mar 2025";

  const isTwitterUser = (dbUser as any)?.twitterId && (dbUser as any)?.authenticatedType === "social";

  return (
    <React.Fragment>
      {isOpen && (
        <CommonModal onClose={handleCancel} className="max-w-xl sm:max-w-2xl">
          <div className="p-6">
            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#F2F2FD]">
                Edit your Profile
              </h2>
              <p className="text-[#FFFFFFA3] mt-2 text-sm">
                Your personal details are private and safe with us.
              </p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 ring-2 ring-[#FFFFFF1A] cursor-pointer">
                    <Image
                      src={formData.avatar || currentData.avatar}
                      alt="Profile Avatar"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                    {/* Camera overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    id="avatar-upload"
                  />
                  {/* Clickable overlay for the entire avatar */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 cursor-pointer"
                    title="Click to update profile photo"
                  />
                </div>

                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <h3 className="text-xl font-medium text-[#F2F2FD]">
                    {currentData.username}
                  </h3>
                  <p className="text-[#FFFFFFA3] text-sm">
                    Joined {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            <HorizontalLine />

            <div className="space-y-6 my-6">
              {/* Username */}
              <FormField
                label="Username"
                error={usernameError}
                helperText={isTwitterUser ? "Username is linked to your Twitter account and cannot be changed" : undefined}
              >
                <StyledInput
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={formData.username}
                  disabled={isTwitterUser}
                  placeholder={isTwitterUser ? "Linked to Twitter account" : "Enter username"}
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  title="Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens"
                  maxLength={20}
                  autoComplete="username"
                  spellCheck="false"
                />
              </FormField>

              {/* Email */}
              <FormField label="Email">
                <StyledInput
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="Email address"
                />
              </FormField>

              {/* X Account */}
              <FormField label="X Account">
                <div className="relative">
                  <StyledInput
                    type="text"
                    value={(dbUser as any)?.twitterId ? `@${formData.xAccount}` : ""}
                    disabled
                    placeholder={(dbUser as any)?.twitterId ? "Linked to X" : "Connect X"}
                    className="pl-10 pr-24"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Image
                      src="/images/twitter.png"
                      alt="X Icon"
                      width={20}
                      height={20}
                    />
                  </div>
                  {(dbUser as any)?.twitterId && (dbUser as any)?.authenticatedType !== "social" ? (
                    <StyledButton
                      variant="danger"
                      onClick={handleDisconnectTwitter}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1"
                    >
                      Disconnect
                    </StyledButton>
                  ) : !(dbUser as any)?.twitterId ? (
                    <StyledButton
                      variant="ghost"
                      onClick={handleConnectTwitter}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1"
                    >
                      Connect
                    </StyledButton>
                  ) : null}
                </div>
              </FormField>

              {/* Wallet */}
              <FormField label="Wallet">
                {address ? (
                  <div className="relative">
                    <StyledInput
                      type="text"
                      value={formatWalletAddress(address)}
                      readOnly
                      className="pl-10 pr-24 cursor-default"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Image
                        src={getConnectorIconByName(connector?.name || "MetaMask")}
                        alt="Wallet Icon"
                        width={20}
                        height={20}
                      />
                    </div>
                    <button
                      onClick={handleCopyWallet}
                      className="absolute right-20 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity p-1"
                      title="Copy wallet address"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </button>
                    <StyledButton
                      variant="danger"
                      onClick={handleDisconnectWallet}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1"
                    >
                      Disconnect
                    </StyledButton>
                  </div>
                ) : (
                  <div className="relative">
                    <appkit-button
                      balance="hide"
                      // @ts-expect-error - appkit-button is not typed
                      class="!w-full !cursor-pointer !z-[60]"
                    />
                  </div>
                )}
              </FormField>
            </div>

            <HorizontalLine />

            {/* Buttons */}
            <div className="flex flex-row gap-3 mt-6 justify-end">
              <StyledButton
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </StyledButton>
              <StyledButton
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || !!usernameError}
                className="flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </StyledButton>
            </div>
          </div>
        </CommonModal>
      )}
    </React.Fragment>
  );
};

export default EditProfileModal;
