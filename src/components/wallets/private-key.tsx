import React, { useEffect } from "react";
import CommonModal from "../modals";
import Button from "../Button";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { usePrivateKey } from "@/hooks/usePrivateKey";

const PrivateKey = ({ onClose }: { onClose: () => void }) => {
  const [showPrivateKey, setShowPrivateKey] = React.useState(false);
  const { privateKey, loading, error, refetch } = usePrivateKey();
  useEffect(() => {
    refetch();
  }, []);

  return (
    <CommonModal onClose={onClose} className="!w-[364px]">
      <div>
        <div className="flex flex-col items-center justify-center w-full">
          <Image
            src="/lock.png"
            alt="Lock icon"
            className="w-24 h-24"
            width={96}
            height={96}
          />

          <h2 className="text-[#F2F2FD] text-2xl font-semibold mt-4">
            Export Private Key
          </h2>

          <p className="text-[#FFFFFFA3] text-sm font-normal mt-4">
            Keep it safe
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 bg-[#2E3144] py-3 px-5 rounded-[50px] gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFFA3]" />
              <p className="text-[#FFFFFFA3] text-sm font-semibold">Loading private key...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-2 w-full">
              <p className="text-red-400 text-sm font-semibold">Error: {error}</p>
            </div>
          ) : (
            <>
              <p className="text-[#FFFFFFA3] text-sm font-semibold overflow-scroll">
                {showPrivateKey && privateKey
                  ? privateKey
                  : "****************************************"}
              </p>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="cursor-pointer"
                disabled={!privateKey}
              >
                {showPrivateKey ? (
                  <Eye className="w-4 h-4 text-[#fff]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#fff]" />
                )}
              </button>
            </>
          )}
        </div>

        <Button
          variant="primary"
          className="w-full h-[46px] mt-5 !text-sm !font-semibold pointer"
          onClick={() => {
            if (privateKey) {
              navigator.clipboard.writeText(privateKey);
              toast.success("Private key copied to clipboard");
            } else {
              toast.error("No private key available to copy");
            }
          }}
          disabled={!privateKey || loading}
        >
          {loading ? "Loading..." : "Copy Private Key"}
        </Button>
      </div>
    </CommonModal>
  );
};

export default PrivateKey;
