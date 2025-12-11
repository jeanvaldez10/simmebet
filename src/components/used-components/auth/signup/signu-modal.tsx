/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "next/image";
import { useRef, useState } from "react";
import { updateUser } from "../actions/user-update";
import { uploadFile } from "@/utils/blob";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
  userId: string;
}
const SignUpModal = ({
  isOpen,
  onClose,
  setAuthModal,
  userId,
}: SignUpModalProps) => {
  const [formData, setFormData] = useState({
    username: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Open file picker
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);
      const tempUrl = URL.createObjectURL(file); // ✅ Create temporary preview
      setPreviewUrl(tempUrl);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: { username?: string } = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const newBlob = image && (await uploadFile(image.name, image));

      const res = await updateUser({
        userId: userId,
        userName: formData.username,
        image: newBlob?.url || undefined,
      });
      setIsLoading(false);
      setImage(undefined);
      if (res.status === true) {
        setAuthModal("welcome_bluff");
      } else {
        setErrors((prev) => ({
          ...prev,
          username: res.message || "Update user failed, Please try again",
        }));
      }
    } catch (error) {
      setIsLoading(false);
      setErrors((prev) => ({
        ...prev,
        username:
          (error as Error)?.message ||
          "Something went wrong. Please try again.",
      }));
    }
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
            src={previewUrl || "/images/avatar.png"}
            className="rounded-full mb-4 bg-cover h-40 w-40 border"
            width={300}
            height={300}
            alt="user_profile"
          />

          <p className="my-3 text-[#FFFFFFA3]">Profile Avatar</p>
          <button className="cursor-pointer" onClick={handleButtonClick}>
            Upload
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="username">Username</label>
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

          <div className="flex gap-4 items-center">
            <Button
              variant="primary"
              fullWidth
              className="text-center mt-2 py-3"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignUpModal;
