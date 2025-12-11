/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { FaXTwitter } from "react-icons/fa6";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthErrors } from "@/hooks/use-auth-errors";
import { handleAuthError } from "@/utils/auth-errors";
import { useAuthContext } from "@/context/AuthProvider";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  onLoginStart?: () => void;
  onLoginEnd?: () => void;
}

const LoginModal = ({
  isOpen,
  onClose,
  setAuthModal,
  onLoginStart,
  onLoginEnd,
}: LoginModalProps) => {
  const router = useRouter();
  const { clearError } = useAuthErrors();
  const { refreshDbUser, updateSession, signIn } = useAuthContext();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    login?: string;
  }>({});
  const [isLoading, setIsLoading] = useState({
    login: false,
    twitter: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear errors when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // Trigger loading shimmer in header
    onLoginStart?.();

    setIsLoading((prev) => ({ ...prev, login: true }));
    clearError(); // Clear any previous errors

    try {
      const result = (await signIn("credentials", {
        email: formData.username,
        password: formData.password,
        isSignUp: "false",
        redirect: false,
      })) as { error?: string; ok?: boolean };

      if (result?.error) {
        console.log("Login error:", result.error);
        onLoginEnd?.();

        if (result.error === "AccessDenied") {
          onClose(); // Close the modal before redirecting
          router.push("/unauthorized");
          return;
        }

        // Use the new error handling system
        const { message } = handleAuthError(result, false);

        setErrors((prev) => ({
          ...prev,
          login: message,
        }));
      } else if (result?.ok) {
        console.log("Login successful, updating session...");
        // Force immediate session update
        console.log("Calling updateSession...");
        const sessionResult = await updateSession();
        console.log("updateSession result:", sessionResult);

        console.log("Setting auth modal to none...");
        setAuthModal("none");

        console.log("Calling refreshDbUser...");
        await refreshDbUser();
        console.log("Login flow completed");

        // Force a session refresh and wait a bit for the UI to update
        console.log("Forcing session refresh...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await updateSession();

        // Login completed successfully - no need for page refresh
        console.log("Login completed successfully");
      } else {
        console.log("No error or ok in result:", result);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        login: "Something went wrong. Please try again.",
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, login: false }));
    }
  };

  const handleXLogin = async () => {
    setIsLoading((prev) => ({ ...prev, twitter: true }));
    try {
      const result = (await signIn("twitter", {
        callbackUrl: "/",
      })) as { error?: string };

      if (result?.error) {
        setErrors((prev) => ({
          ...prev,
          login: "Twitter login failed. Please try again.",
        }));
      } else {
        // Force session update for Twitter login
        updateSession();
        refreshDbUser();
      }
    } catch (error) {
      console.error("Twitter login failed", error);
      setErrors((prev) => ({
        ...prev,
        login: "Twitter login failed. Please try again.",
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, twitter: false }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-4xl"
      contentClassName="relative shadow-lg p-0 bg-transparent"
      className="rounded-3xl"
      zIndex={9999}
    >
      <div className="relative overflow-hidden h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 !h-[600px] rounded-3xl">
          {/* Left side: full-bleed image */}
          <div className="hidden md:block relative h-full w-full p-0 m-0 md:w-[108%] md:-mr-8 md:-ml-[4%] overflow-hidden z-0">
            <div className="absolute inset-0 w-full h-full">
              <Image
                src="/images/BLUFF_LAUNCH.jpg"
                alt="Betting interface preview"
                fill
                className="object-cover w-full h-full p-0 m-0 border-none"
                style={{ display: "block" }}
              />
            </div>
          </div>

          {/* Right side: login panel with gradient background */}
          <div className="py-2 px-4 pb-8 pt-[90px] flex flex-col min-h-full justify-center bg-[#16171E] rounded-l-3xl relative z-10">
            <div className="modal-header flex flex-col justify-center items-start h-[90px] absolute top-0 left-0 right-0 z-20 pl-4 pr-4 pt-2">
              <h4 className="text-[32px] leading-tight font-semibold">Login</h4>
              <p className="text-[#FFFFFFA3]">
                Login with your username or email
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  console.log("Form submitted, preventing default");
                  e.preventDefault();
                  console.log("Calling handleLogin from form submit");
                  handleLogin();
                }}
              >
                <div className="mb-5">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-2"
                  >
                    Username / Email
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter here"
                    disabled={isLoading.login}
                    className={
                      `pl-6 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full border border-solid border-[1.5px] focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50 ` +
                      (errors.username
                        ? "border-red-500"
                        : "border-transparent")
                    }
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter here"
                    disabled={isLoading.login}
                    className={
                      `pl-6 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full border border-solid border-[1.5px] focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50 ` +
                      (errors.password
                        ? "border-red-500"
                        : "border-transparent")
                    }
                  />
                  <div className="min-h-[1.25rem] mt-1">
                    {errors.username ? (
                      <p className="text-red-400 text-xs">{errors.username}</p>
                    ) : errors.password ? (
                      <p className="text-red-400 text-xs">{errors.password}</p>
                    ) : errors.login ? (
                      <p className="text-red-400 text-xs">{errors.login}</p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="text-center mt-2 py-3"
                  disabled={isLoading.login}
                  onClick={() => console.log("Login button clicked")}
                >
                  {isLoading.login ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="flex items-center justify-center w-[80%] mx-auto my-8">
                <div className="flex-grow border-t border-dashed border-gray-600"></div>
                <span className="px-4 text-white text-sm whitespace-nowrap">
                  or connect with
                </span>
                <div className="flex-grow border-t border-dashed border-gray-600"></div>
              </div>

              <Button
                variant="secondary"
                fullWidth
                className="text-center py-3 flex items-center border-gray-400 bg-black border mb-6"
                onClick={handleXLogin}
                disabled={isLoading.twitter}
              >
                {isLoading.twitter ? "Connecting with" : "Complete with"}
                <FaXTwitter size={20} />
              </Button>
            </div>
            <div className="flex items-center gap-2 justify-between text-sm">
              <button
                onClick={() => {
                  setAuthModal("account_recovery");
                }}
                className="cursor-pointer text-[#FFFFFFA3] hover:text-white transition-colors"
              >
                I forgot my password
              </button>
              <button
                className="cursor-pointer text-[#FFFFFFA3] hover:text-white transition-colors"
                onClick={() => {
                  setAuthModal("main_signup");
                }}
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
