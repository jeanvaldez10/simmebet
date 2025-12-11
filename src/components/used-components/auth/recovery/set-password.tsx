/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useState } from "react";
import { updateUserPassword } from "../actions/user-password";

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  recoveryUserEmail: any;
}
const SetPasswordModal = ({
  isOpen,
  onClose,
  setAuthModal,
  recoveryUserEmail,
}: SetPasswordModalProps) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    confirmPassword?: string;
    password?: string;
    setPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: {
      confirmPassword?: string;
      password?: string;
      setPassword?: string;
    } = {};
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) {
      newErrors.setPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await updateUserPassword({
        email: recoveryUserEmail,
        password: formData.password,
      });

      if (res.status === true) {
        setAuthModal("reset_password_success");
      } else {
        setErrors((prev) => ({
          ...prev,
          setPassword:
            res.message || "Update user password failed, Please try again",
        }));
      }
    } catch (error: any) {
      setErrors({ setPassword: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" className="rounded-xl">
      <div className="py-2 px-4 flex flex-col gap-2">
        <h4 className="text-[36px] leading-tight font-semibold">
          Set new password
        </h4>
        <p className="text-[#FFFFFFA3]">
          Set your new password for your account
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleConfirmPassword();
          }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter here"
              className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password}</p>
            )}

            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter here"
              className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
            )}

            {errors.setPassword && (
              <p className="text-red-400 text-sm">{errors.setPassword}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="text-center mt-2 py-3"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
            >
              Save new password
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default SetPasswordModal;
