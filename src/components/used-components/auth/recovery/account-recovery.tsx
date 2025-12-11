/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useState } from "react";
import { validateEmail } from "@/utils/date";
import toast from "react-hot-toast";

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  setRecoveryUserEmail: any;
}

const AccountRecoveryModal = ({
  isOpen,
  onClose,
  setAuthModal,
  setRecoveryUserEmail,
}: AccountRecoveryModalProps) => {
  const [formData, setFormData] = useState({ username: "" });
  const [errors, setErrors] = useState<{
    username?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: { username?: string } = {};
    if (!formData.username) {
      newErrors.username = "Email is required.";
    }
    if (formData.username && !validateEmail(formData.username)) {
      newErrors.username = "Invalid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      toast.success("Password reset link sent to your email.");
      setRecoveryUserEmail(formData.username);
      setAuthModal("reset_email_sent");
    } catch (error: any) {
      setErrors({ username: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" className="rounded-xl">
      <div className="py-2 px-4 flex flex-col gap-2">
        <h4 className="text-[36px] leading-tight font-semibold">
          Account recovery
        </h4>
        <p className="text-[#FFFFFFA3]">
          Enter your email and we&apos;ll send you a password reset link.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendCode();
          }}>
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter here"
              className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.username && (
              <p className="text-red-400 text-sm">{errors.username}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || !formData.username}
              className="text-center mt-2 py-3"
            >
              Send Link
            </Button>
          </form>

          <div className="flex items-center justify-center w-[80%] mx-auto my-6">
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
            <span className="px-4 text-white text-sm whitespace-nowrap">
              or
            </span>
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            className="text-center py-3 flex items-center border-gray-400 bg-black border"
          >
            Connect Wallet
          </Button>
          <p className="text-center">You must connect a wallet that has been linked to your account.</p>
        </div>
        <button
          onClick={() => {
            setAuthModal("login");
          }}
          className="mt-6 w-full text-center cursor-pointer"
        >
          Back to login
        </button>
      </div>
    </Modal>
  );
};

export default AccountRecoveryModal;
