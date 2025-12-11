/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "next/image";
import { useState } from "react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
}
const SignUpXModal = ({ isOpen, onClose, setAuthModal }: SignUpModalProps) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: { username?: string; email?: string; password?: string } =
      {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Invalid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (validateForm()) {
      setAuthModal("welcome_bluff");
    }
  };

  const handleSkip = () => {
    setAuthModal("welcome_bluff");
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-xl"
      className="rounded-md"
    >
      <div className="py-2 px-4 flex flex-col gap-2">
        <h4 className="text-[36px] leading-tight font-semibold">
          Complete your Profile
        </h4>
        <p className="text-[#FFFFFFA3]">
          Your personal details are private and safe with us
        </p>

        <div className="mx-auto font-semibold mt-4 text-center">
          <Image
            src={"/images/avatar.png"}
            className="rounde-full mb-4"
            width={150}
            height={150}
            alt="user_profile"
          />

          <p className="my-3 text-[#FFFFFFA3]">Profile Avatar</p>
          <button className="cursor-pointer">Upload</button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="username">Username or Email</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="John Doe"
            className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          {errors.username && (
            <p className="text-red-400 text-sm">{errors.username}</p>
          )}

          <p className="my-2">
            Add an email/username and password for account recovery
          </p>

          <label htmlFor="email">Email(Optinal)</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@gmail.com"
            className="pl-6 mb-1 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="*******"
            className="pl-6 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}

          <div className="flex gap-4 items-center">
            <Button
              variant="secondary"
              fullWidth
              className="text-center mt-2 py-3"
              onClick={handleSkip}
            >
              Ski it
            </Button>
            <Button
              variant="primary"
              fullWidth
              className="text-center mt-2 py-3"
              onClick={handleSignup}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignUpXModal;
