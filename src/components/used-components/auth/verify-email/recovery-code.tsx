/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, CheckCircle } from "lucide-react";

interface RecoveryEmailCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  recoveryUserEmail: string;
}
const RecoveryEmailCodeModal = ({
  isOpen,
  onClose,
  setAuthModal,
  recoveryUserEmail,
}: RecoveryEmailCodeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendLinkAgain = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/send-mail/signup-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryUserEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      toast.success("Verification link sent to your email.");
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" className="rounded-xl">
      <div className="py-6 px-6 flex flex-col gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="w-12 h-12 text-blue-500" />
          </div>
          <h4 className="text-2xl font-semibold text-white mb-2">
            Check Your Email
          </h4>
          <p className="text-[#FFFFFFA3] mb-4">
            We&apos;ve sent a verification link to <strong>{recoveryUserEmail}</strong>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Click the verification link in the email to complete your registration. 
            The link will expire in 24 hours for security reasons.
          </p>
        </div>

        {emailSent && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400 text-sm">
              Verification link sent successfully!
            </span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            className="text-center py-3"
            onClick={handleSendLinkAgain}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Link Again"}
          </Button>

          <div className="flex items-center justify-center w-full mx-auto mb-4">
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
            <div className="flex-grow border-t border-dashed border-gray-600"></div>
          </div>

          <Button
            onClick={() => {
              setAuthModal("main_signup");
            }}
            variant="secondary"
            fullWidth
            className="text-center py-3 flex items-center border-gray-400 bg-black border"
          >
            Go Back
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecoveryEmailCodeModal;
