import React, { useState } from "react";
import { MoveRight } from "lucide-react";
import CommonModal from "@/components/modals";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import axios from "axios";
import { ErrorComp } from "@/components/lottie/success-animation";

const AccessDenied = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleBetaAccess = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`/api/waitlist?code=${code}`);
      setIsLoading(false);

      if (res.data.status === 200) {
        localStorage.setItem("access", "yes");
        toast.success(res.data.message);
        setCode("");
        setOpen(false);
        return;
      }

      if (res.data.status === 400) {
        toast.error(res.data.message);
        return;
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(
        (error as Error)?.message || "Failed to verify code, Try later"
      );
    }
  };

  return (
    <CommonModal onClose={() => setOpen(false)} className="w-[300px]">
      <div className="relative  flex flex-col items-center rounded-lg z-10 gap-4">
        <div>
          <ErrorComp />
        </div>

        <h2 className=" text-[#F2F2FD] font-semibold text-2xl text-center">
          Bluff Beta
        </h2>
        <p className=" text-[#F2F2FD] text-sm font-normal text-center">
          Bluff is in beta, if you have received a beta-testing code, please
          enter it below to gain access.
        </p>

        <form
          className="w-full mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleBetaAccess();
          }}
        >
          <input
            placeholder="Enter Code"
            className=" bg-[#2E3144] rounded-[50px] py-3 px-5 h-[46px] w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            className=" !text-sm mt-3 w-full  cursor-pointer"
            disabled={!code || isLoading}
          >
            {isLoading ? "Loading.." : "Submit"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className=" mt-6 w-full !text-sm flex items-center gap-1"
            onClick={() => {
              window.location.href = "https://getwaitlist.com/waitlist/28583";
            }}
          >
            No Code? Join Waitlist
            <MoveRight />
          </Button>
        </form>
      </div>

      <div
        className="w-[366px] h-[366px] blur-[80px] absolute top-[-23%]"
        style={{ background: "linear-gradient(#2E3144 32%, black 0%)" }}
      />
    </CommonModal>
  );
};

export default AccessDenied;
