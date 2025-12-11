/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useState } from "react";
import toast from "react-hot-toast";

interface RecoveryCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  recoveryUserEmail: string;
}
const RecoveryCodeModal = ({
  isOpen,
  onClose,
  setAuthModal,
  recoveryUserEmail,
}: RecoveryCodeModalProps) => {
  const [formData, setFormData] = useState({ code: "" });
  const [errors, setErrors] = useState<{
    code?: string;
  }>({});
  const [isLoading, setIsLoading] = useState({
    recovery: false,
    sendAgain: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: { code?: string } = {};
    if (!formData.code.trim()) newErrors.code = "Code is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecoveryCode = async () => {
    if (!validateForm()) return;
    setIsLoading((prev) => ({ ...prev, recovery: true }));
    try {
      const res = await fetch("/api/recovery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryUserEmail, code: formData.code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      setAuthModal("new_password");
    } catch (error: any) {
      setErrors({ code: error.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, recovery: false }));
    }
  };

  const handleSendCodeAgain = async () => {
    setIsLoading((prev) => ({ ...prev, sendAgain: true }));

    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryUserEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      toast.success("Recovery code sent to your email.");
    } catch (error: any) {
      setErrors({ code: error.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, sendAgain: false }));
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" className="rounded-xl">
      <div className="py-2 px-4 flex flex-col gap-2">
        <h4 className="text-[36px] leading-tight font-semibold">
          Recovery code
        </h4>
        <p className="text-[#FFFFFFA3]">
          Enter the code that was sent to your email.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleRecoveryCode();
          }}>
            <label htmlFor="code">Code</label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter here"
              className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.code && <p className="text-red-400 text-sm">{errors.code}</p>}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="text-center mt-2 py-3"
              disabled={isLoading.recovery || !formData.code}
            >
              Verify
            </Button>
          </form>

          <button
            onClick={handleSendCodeAgain}
            disabled={isLoading.sendAgain}
            className="my-2 w-full text-center cursor-pointer"
          >
            Send code again
          </button>

          <div className="flex items-center justify-center w-full mx-auto mb-4">
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
          </div>

          <Button
            onClick={() => {
              setAuthModal("account_recovery");
            }}
            variant="secondary"
            fullWidth
            className="text-center py-3 flex items-center border-gray-400 bg-black border"
          >
            Go Back
          </Button>
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

export default RecoveryCodeModal;
