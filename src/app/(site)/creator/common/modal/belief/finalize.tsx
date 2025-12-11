import Button from "@/components/Button";
import CommonModal from "@/components/modals";
import { Info } from "lucide-react";
import React from "react";
import { useBeliefForm } from "./store/create-context";
import { CustomTooltip } from "@/components/shared/custom-tooltip";

const Finalize = ({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) => {
  const { finalizeData, setFinalizeData, resetFinalizeData } = useBeliefForm();

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetFinalizeData();
      }}
      className="md:w-[480px] overflow-y-auto max-h-[95vh]"
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Manual Finalization
        </h2>

        <div className="mt-4">
          <p className="text-[#FFFFFFA3] text-sm  font-semibold mb-2">
            Which side won?
          </p>
          <div className="flex w-full bg-[#2E3144] rounded-[100px] p-[2px]">
            <button
              onClick={() => {
                setFinalizeData((prev) => ({
                  ...prev,
                  result: false,
                }));
              }}
              className={`flex-1 text-sm font-medium h-[40px] py-2 rounded-[100px] text-center transition-all cursor-pointer ${
                !finalizeData?.result
                  ? "bg-[#FF4D4D] text-[#070708]"
                  : "text-white hover:bg-[#3A3D4D]"
              }`}
            >
              No
            </button>
            <button
              onClick={() => {
                setFinalizeData((prev) => ({
                  ...prev,
                  result: true,
                }));
              }}
              className={`flex-1 text-sm font-medium h-[40px] py-2 rounded-[100px] text-center transition-all cursor-pointer ${
                finalizeData?.result
                  ? "bg-[#46FD84] text-[#070708]"
                  : "text-white hover:bg-[#3A3D4D]"
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[#FFFFFFA3] text-sm  font-semibold">
              Evidence
            </span>
            <CustomTooltip
              className="max-w-[320px] w-fit text-xs"
              name=" To finalize manually, you must submit evidence backing your
              outcome. Use trusted, public sources like official websites or
              news articles. Weak or unverifiable links may lead to disputes or
              overrides."
            >
              <Info className="w-5 h-5 hover:text-[#FFFFFF] pointer text-[#FFFFFFA3]" />
            </CustomTooltip>
          </div>

          <textarea
            className="py-2 px-3 bg-[#2E3144] rounded-[16px] w-full min-h-[100px] max-h-[200px] text-sm  outline-none text-[#F2F2FD] placeholder:text-[#FFFFFFA3]"
            placeholder="Enter here"
            value={finalizeData?.Evidence}
            onChange={(e) => {
              setFinalizeData((prev) => ({
                ...prev,
                Evidence: e.target.value,
              }));
            }}
          />
        </div>

        <div className="flex justify-between gap-4 items-center  mt-4">
          <Button
            onClick={() => {
              onClose();
              resetFinalizeData();
            }}
            type="button"
            fullWidth
            variant="ghost"
            className="!text-white !h-[46px]"
          >
            Close
          </Button>
          <Button
            type="submit"
            fullWidth
            onClick={onContinue}
            className="!h-[46px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default Finalize;
