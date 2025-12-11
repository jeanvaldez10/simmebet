import React from "react";
import Image from "next/image";
import { Copy } from "lucide-react";
import CommonModal from "@/components/modals";
import Button from "@/components/Button";
import { useToast } from "@/components/common/ToastContext";

type ShareModalProps = {
  onClose: () => void;
  url: string;
  tweetUrl: string;
  marketName?: string;
  marketImage?: string;
  marketQuestion?: string;
};

const ShareModal: React.FC<ShareModalProps> = ({ onClose, url, marketName, marketImage, marketQuestion }) => {
  const { showToast } = useToast();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    showToast({ message: "URL copied!" });
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent("Check out my latest beliefs on @CallMyBluff_io");
    const profileUrl = encodeURIComponent(url); // Use the profile URL for sharing
    const href = `https://twitter.com/intent/tweet?text=${text}&url=${profileUrl}`;
    window.open(href, "_blank");
  };
  

  return (
    <CommonModal onClose={onClose} className="w-[420px]">
      <div className="relative z-10 flex flex-col gap-4 items-center">
        <Image
          src="/images/share.png"
          alt="Share Modal"
          width={100}
          height={100}
        />
        <h2 className="text-2xl font-bold text-white">
          Share with your friends
        </h2>
        <p className="text-gray-400">Show off your profile!</p>
        
        {/* Social Preview */}
        {marketName && (
          <div className="w-full bg-[#1A1A2E] border border-[#FFFFFF29] rounded-lg overflow-hidden">
            {marketImage && (
              <div className="w-full h-32 relative">
                <Image
                  src={marketImage}
                  alt={marketName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-2">Preview</p>
              <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                {marketName}
              </h3>
              {marketQuestion && (
                <p className="text-gray-400 text-xs line-clamp-2">
                  {marketQuestion}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                callmybluff.io
              </p>
            </div>
          </div>
        )}
        
        <div className="flex-1 relative w-full">
          <input
            type="text"
            id="walletId"
            name="walletId"
            value={url}
            readOnly
            className="w-full bg-[#1F1F3A] rounded-full pl-4 pr-16 py-3 text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-default text-sm"
          />

          <button
            onClick={handleCopyUrl}
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity pointer"
            title="Copy URL"
          >
            <Copy className="w-5 h-5 text-white" />
          </button>
        </div>
        <Button
          variant="primary"
          className="text-sm px-8 py-0"
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

      <div
        className="w-[420px] h-[420px] blur-[80px] absolute top-[-23%]"
        style={{ background: "linear-gradient(#2E3144 32%, black 0%)" }}
      />
    </CommonModal>
  );
};

export default ShareModal;
