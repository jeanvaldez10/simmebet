/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import Button from "./Button";
import { AuthModalProps } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const { isLoading, signInWithTwitter } = useAuth();

  const handleTwitterConnect = async () => {
    try {
      await signInWithTwitter();
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error connecting with Twitter:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-4xl" zIndex={70}>
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:block">
            <Image
              src="/images/modal-frame.png"
              alt="Betting interface preview"
              width={1000}
              height={1000}
              className="object-cover h-full w-full"
            />
          </div>

          <div className="py-8 px-6 md:px-8 flex flex-col gap-12">
            <div className="mb-auto">
              <Image
                src="/logo.png"
                alt="Bluff"
                width={180}
                height={70}
                className="h-14 w-auto mb-10"
              />

              <div className="flex flex-col gap-4 mt-4">
                <h2 className="text-[40px] leading-tight font-bold">
                  Connect with <span className="inline-block">X</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Bluff uses X network to validate and generate all actions that
                  happen on this platform.
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <Button
                variant="primary"
                fullWidth
                onClick={handleTwitterConnect}
                className="flex items-center justify-center gap-2 py-4 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
