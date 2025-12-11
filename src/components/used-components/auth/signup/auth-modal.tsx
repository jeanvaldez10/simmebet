/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { FaXTwitter } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useAuthErrors } from "@/hooks/use-auth-errors";
import { useAuthContext } from "@/context/AuthProvider";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface SignUpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  setRecoveryUserEmail: any;
}
const SignUpAuthModal = ({
  isOpen,
  onClose,
  setAuthModal,
  setRecoveryUserEmail,
}: SignUpAuthModalProps) => {
  const { clearError } = useAuthErrors();
  const { refreshDbUser, updateSession, signIn } = useAuthContext();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    referralCode?: string;
    signup?: string;
  }>({});
  const [isLoading, setIsLoading] = useState({
    signup: false,
    twitter: false,
  });
  const [referralValidation, setReferralValidation] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    referrerInfo?: { username: string; avatar?: string };
  }>({ status: "idle" });

  // Load referral code from localStorage on mount
  useEffect(() => {
    const storedCode = localStorage.getItem("referralCode");
    const storedExpiry = localStorage.getItem("referralCodeExpiry");
    
    if (storedCode && storedExpiry) {
      const expiryDate = new Date(storedExpiry);
      if (expiryDate > new Date()) {
        setFormData((prev) => ({ ...prev, referralCode: storedCode }));
        // Validate the stored code
        validateReferralCode(storedCode);
      } else {
        // Clear expired code
        localStorage.removeItem("referralCode");
        localStorage.removeItem("referralCodeExpiry");
      }
    }
  }, []);

  const validateReferralCode = async (code: string) => {
    if (!code || code.trim().length === 0) {
      setReferralValidation({ status: "idle" });
      return;
    }

    setReferralValidation({ status: "checking" });
    
    try {
      const response = await fetch(`/api/referrals/validate?username=${encodeURIComponent(code)}`);
      
      if (response.ok) {
        const data = await response.json();
        setReferralValidation({
          status: "valid",
          referrerInfo: data.referrer,
        });
        setErrors((prev) => ({ ...prev, referralCode: undefined }));
      } else {
        setReferralValidation({ status: "invalid" });
        setErrors((prev) => ({ ...prev, referralCode: "Invalid referral code" }));
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      setReferralValidation({ status: "invalid" });
      setErrors((prev) => ({ ...prev, referralCode: "Error validating code" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear errors when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }

    // Validate referral code as user types (with debounce would be better, but this works)
    if (id === "referralCode") {
      if (value.trim().length === 0) {
        setReferralValidation({ status: "idle" });
      }
    }
  };

  const handleReferralBlur = () => {
    if (formData.referralCode && formData.referralCode.trim().length > 0) {
      validateReferralCode(formData.referralCode);
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors: {
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!formData.username) {
      newErrors.username = "Email is required.";
    }
    if (formData.username && !validateEmail(formData.username)) {
      newErrors.username = "Invalid email address.";
    }
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required.";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading((prev) => ({ ...prev, signup: true }));
    clearError(); // Clear any previous errors
    try {
      // Use referralCode from form (either entered manually or pre-filled from localStorage)
      const referralCodeToUse = formData.referralCode.trim() || null;

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.username,
          password: formData.password,
          referralCode: referralCodeToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          signup: data.error || "Something went wrong. Please try again.",
        }));
      } else {
        // Clear referral code from localStorage after successful signup
        localStorage.removeItem("referralCode");
        localStorage.removeItem("referralCodeExpiry");
        
        // Signup successful - show verification modal (user is not logged in yet)
        setRecoveryUserEmail(formData.username);
        setAuthModal("signup_email_verify");
      }
    } catch (error) {
      console.error("Signup failed", error);
      setErrors((prev) => ({
        ...prev,
        signup: "Something went wrong. Please try again.",
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  const handleXSignup = async () => {
    setIsLoading((prev) => ({ ...prev, twitter: true }));
    try {
      const result = (await signIn("twitter", {
        callbackUrl: "/",
      })) as { error?: string };

      if (result?.error) {
        setErrors((prev) => ({
          ...prev,
          signup: "Twitter sign up failed. Please try again.",
        }));
      } else {
        // Force session update for Twitter signup
        updateSession();
        refreshDbUser();
      }
    } catch (error) {
      console.error("Twitter signup failed", error);
      setErrors((prev) => ({
        ...prev,
        signup: "Twitter sign up failed. Please try again.",
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
      contentClassName="relative shadow-lg p-0 bg-transparent h-full overflow-y-auto"
      className="rounded-3xl"
    >
      <div className="relative h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full md:h-[700px] rounded-3xl">
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

          <div className="py-2 px-3 md:px-4 pb-3 md:pb-8 pt-[70px] md:pt-[90px] flex flex-col gap-2 h-full md:min-h-[700px] bg-[#16171E] rounded-l-3xl md:rounded-l-3xl rounded-t-3xl relative z-10 overflow-y-auto">
            <div className="modal-header flex flex-col justify-center items-start h-[70px] md:h-[90px] absolute top-0 left-0 right-0 z-20 pl-3 md:pl-4 pr-3 md:pr-4 pt-2 bg-[#16171E] rounded-t-3xl md:rounded-tl-none">
              <h4 className="text-[24px] md:text-[32px] leading-tight font-semibold">
                Sign Up
              </h4>
              <p className="text-[#FFFFFFA3] text-sm md:text-base">Sign up with your email</p>
            </div>
            <div className="mt-2 md:mt-4 flex flex-col gap-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup();
                }}
              >
                <div className="mb-2 md:mb-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-1 md:mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter here"
                    disabled={isLoading.signup}
                    className={
                      `pl-6 pr-4 py-2 md:py-3 bg-[#2c2f42] text-white rounded-full w-full border border-solid  focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50` +
                      (!!formData.username && !validateEmail(formData.username)
                        ? " border-red-500"
                        : " border-transparent")
                    }
                  />
                  <div className="min-h-[16px] md:min-h-[20px] mt-1">
                    {errors.username && (
                      <p className="text-red-400 text-xs">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-2 md:mb-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1 md:mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter here"
                    disabled={isLoading.signup}
                    className="pl-6 pr-4 py-2 md:py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="mb-2 md:mb-3">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    disabled={isLoading.signup}
                    className={
                      `pl-6 pr-4 py-2 md:py-3 bg-[#2c2f42] text-white rounded-full w-full border border-solid  focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50` +
                      (!!formData.confirmPassword &&
                      !!formData.password &&
                      formData.confirmPassword !== formData.password
                        ? " border-red-500"
                        : " border-transparent")
                    }
                  />
                  {((formData.confirmPassword && formData.password && formData.confirmPassword !== formData.password) || errors.confirmPassword) && (
                    <div className="mt-1">
                      {formData.confirmPassword &&
                        formData.password &&
                        formData.confirmPassword !== formData.password && (
                          <p className="text-red-400 text-xs">
                            Passwords do not match.
                          </p>
                        )}
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Referral Code Input */}
                <div className="mb-3 md:mb-4">
                  <label
                    htmlFor="referralCode"
                    className="block text-sm font-medium mb-1 md:mb-2"
                  >
                    Referral Code <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="referralCode"
                      type="text"
                      value={formData.referralCode}
                      onChange={handleChange}
                      onBlur={handleReferralBlur}
                      placeholder="Enter referral code"
                      disabled={isLoading.signup}
                      className={
                        `pl-6 pr-10 py-2 md:py-3 bg-[#2c2f42] text-white rounded-full w-full border border-solid focus:outline-none focus:ring-1 focus:ring-gray-600 disabled:opacity-50` +
                        (referralValidation.status === "invalid"
                          ? " border-red-500"
                          : referralValidation.status === "valid"
                          ? " border-green-500"
                          : " border-transparent")
                      }
                    />
                    {/* Validation Status Indicator */}
                    {referralValidation.status === "checking" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                    {referralValidation.status === "valid" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    {referralValidation.status === "invalid" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.referralCode && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.referralCode}
                    </p>
                  )}
                  {referralValidation.status === "valid" && referralValidation.referrerInfo && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-xs">
                        ✓ Valid code from <span className="font-semibold">{referralValidation.referrerInfo.username}</span>
                        <br />
                        <span className="text-gray-400">You&apos;ll receive a 10% trading bonus!</span>
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="text-center py-2 md:py-3"
                  disabled={
                    isLoading.signup ||
                    !(
                      (!formData.username &&
                        !formData.password &&
                        !formData.confirmPassword) ||
                      (validateEmail(formData.username) &&
                        formData.password &&
                        formData.confirmPassword &&
                        formData.password === formData.confirmPassword)
                    )
                  }
                >
                  {isLoading.signup ? "Creating Account..." : "Sign Up"}
                </Button>
                <p className="text-[#FFFFFFA3] text-xs text-center mt-1 md:mt-2">
                  By signup, you agree to our{" "}
                  <Link
                    href={"/terms-of-services"}
                    target="_blank"
                    className="text-white underline"
                  >
                    {" "}
                    Terms of Service{" "}
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={"/privacy-policy"}
                    target="_blank"
                    className="text-white underline"
                  >
                    {" "}
                    Privacy Policy{" "}
                  </Link>
                  .
                </p>
              </form>

              {errors.signup && (
                <p className="text-red-400 text-center text-sm mb-1 md:mb-2">
                  {errors.signup}
                </p>
              )}

              <div className="flex items-center justify-center w-[80%] mx-auto my-[6px] md:my-[10px]">
                <div className="flex-grow border-t border-dashed border-gray-600"></div>
                <span className="px-3 md:px-4 text-white text-sm whitespace-nowrap">
                  or connect with
                </span>
                <div className="flex-grow border-t border-dashed border-gray-600"></div>
              </div>

              <Button
                variant="secondary"
                fullWidth
                className="text-center py-2 flex items-center border-gray-400 bg-black border mb-2 md:mb-4"
                onClick={handleXSignup}
                disabled={isLoading.twitter}
              >
                {isLoading.twitter ? "Connecting with" : "Complete with"}
                <FaXTwitter size={20} />
              </Button>
            </div>
            <button
              onClick={() => {
                setAuthModal("login");
              }}
              className="w-full cursor-pointer text-left text-[#FFFFFFA3] hover:text-white transition-colors text-xs md:text-sm"
            >
              I already have an account
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignUpAuthModal;
