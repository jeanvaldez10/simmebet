"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";

const ResetPasswordPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; submit?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      setErrors({ submit: "Missing token." });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      router.push("/auth/signin?resetSuccess=true");
    } catch (error: unknown) {
      setErrors({ submit: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1A1A2A] p-8 rounded-xl">
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">Set New Password</h1>
        {!token ? (
          <p className="text-red-500 text-center">Invalid or missing token.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              id="password"
              type="password"
              placeholder="New password"
              value={formData.password}
              onChange={handleChange}
              className="pl-6 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-6 pr-4 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
            {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="py-3">
              {isLoading ? "Saving..." : "Save Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 
