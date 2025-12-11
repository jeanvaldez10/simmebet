"use client";

import React from "react";
import Image from "next/image";
import { Copy } from "lucide-react";
import CommonModal from "@/components/modals";
import Button from "@/components/Button";
import { useToast } from "@/components/common/ToastContext";

type ReferralShareModalProps = {
  onClose: () => void;
  referralCode: string;
  referralLink: string;
};

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({ 
  onClose, 
  // referralCode, 
  referralLink 
}) => {
  const { showToast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast({ message: "Referral link copied!" });
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent("Join Bluff and get a 10% boost on your trading points! I'll earn points from your volume too. Let's win together! 🎯");
    const url = encodeURIComponent(referralLink);
    const href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(href, "_blank");
  };

  return (
    <CommonModal onClose={onClose} className="md:max-w-[420px] w-full md:w-[95%]">
      <div className="relative z-10 flex flex-col gap-4 items-center">
        {/* Share Icon */}
        <Image
          src="/images/share.png"
          alt="Share Modal"
          width={100}
          height={100}
        />

        <h2 className="text-2xl font-bold text-white">
          Refer your friends
        </h2>
        <p className="text-gray-400 text-center">
          They get a 10% boost, you earn 10% of their volume as points!
        </p>
        
        {/* Referral Link Display */}
        <div className="w-full bg-[#2E3144] rounded-[12px] px-4 py-3 flex items-center justify-between">
          <span className="text-[#F2F2FD] text-sm font-medium truncate flex-1">
            {referralLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="ml-2 text-[#FFFFFFA3] hover:text-[#F2F2FD] transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>

        {/* Share to Twitter Button */}
        <Button
          variant="primary"
          className="w-full text-base font-semibold"
          fullWidth
          onClick={handleTwitterShare}
          icon={
            <Image
              src="/images/twitterblack.png"
              alt="X"
              width={20}
              height={20}
            />
          }
        >
          Share to
        </Button>
      </div>
    </CommonModal>
  );
};

export default ReferralShareModal;

