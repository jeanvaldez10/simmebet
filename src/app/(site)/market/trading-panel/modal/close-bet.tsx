import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import SuccessModalContent from "./success-modal-content";
import { formatBalance } from "@/utils/format";
import useCashoutInfo from "../hook/useCashoutInfo";
import { IMarketData } from "@/interfaces/market";


type CloseBetProps = {
  onClose: () => void;
  type: "yes" | "no";
  yesAmount?: string; // legacy, ignored when hook is available
  totalAmount: string; // legacy
  noAmount?: string; // legacy
  imageSrc: string;
  name: string;
  teamName?: string;
  onCloseConfirm: (option: string, amount: string) => Promise<void>;
  marketContractAddress: `0x${string}`;
  market: IMarketData;
  txHash?: `0x${string}` | null;
  amountOutFromApi?: number;
};

const CloseBet: React.FC<CloseBetProps> = ({
  onClose,
  type = "no",
  yesAmount,
  noAmount,
  totalAmount,
  imageSrc = "/images/cup.png",
  name,
  onCloseConfirm,
  marketContractAddress,
  market,
  txHash,
  amountOutFromApi,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const gradient =
    type === "yes"
      ? "linear-gradient(#36FD68 5%, #16171E 0%)"
      : "linear-gradient(#D32B3F 5%, #16171E 0%)";

  const cashoutInfo = useCashoutInfo(marketContractAddress, market, type);

  // Determine current balances and burn amount (min of yes/no)
  const yesBalRaw = cashoutInfo ? cashoutInfo.yesAmountRaw : parseFloat(yesAmount || "0");
  const noBalRaw = cashoutInfo ? cashoutInfo.noAmountRaw : parseFloat(noAmount || "0");
  const burnAmount = Math.max(Math.min(yesBalRaw || 0, noBalRaw || 0), 0);

  const projectedCashoutUsd = burnAmount;
  const cashedOutDisplay = amountOutFromApi != null ? formatBalance(amountOutFromApi / 1e6) : formatBalance(projectedCashoutUsd * 2);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      const amountToSell = String(burnAmount || 0);
      await onCloseConfirm(type, amountToSell);
      await cashoutInfo?.refreshBalances();
      setModalState("success");
    } catch (error) {
      console.error(error);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState("none");
    onClose();
  };

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Bet Closed"
          subtitle={`Cashed out from market`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
          txHash={txHash}
        >
          <SuccessModalContent
            title="Bet Closed"
            desc={``}
            amount={parseFloat(totalAmount)}
            amountNode={<p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">Cashed out {cashedOutDisplay}</p>}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
            txHash={txHash}
          />
        </SuccessModal>
      )}

      {modalState === "pending" && (
        <SuccessModal
          type="option_pending"
          title={PENDING_MESSAGES.TITLE}
          subtitle={PENDING_MESSAGES.SUBTITLE}
          isPositive={true}
          buttonText={PENDING_MESSAGES.BUTTON_TEXT}
          onButtonClick={() => {}}
          onClose={() => {}}
          width="w-[300px]"
        />
      )}
      {modalState === "error" && (
        <SuccessModal
          type="option_fail"
          title="Something went wrong"
          subtitle="Please try again or contact our support for further help."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        />
      )}

      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Cashout</h2>

        {/* Market header */}
        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: gradient }}
          />
          <div className={`flex items-center gap-4 rounded-lg py-4 relative z-10`}>
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image src={imageSrc} alt={"TKN"} width={60} height={60} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#F2F2FD] truncate">{name}</h3>
            </div>
          </div>
        </div>

        {/* Derive holdings and remaining after cashout */}
        {(() => {
          const yesBal = cashoutInfo?.yesAmountRaw ?? 0;
          const noBal = cashoutInfo?.noAmountRaw ?? 0;
          const total = yesBal + noBal;
          const yesPct = total > 0 ? (yesBal / total) * 100 : 0;
          const noPct = total > 0 ? (noBal / total) * 100 : 0;

          const sell = burnAmount || 0;
          // Close bet burns both outcome tokens proportionally to remove the position
          const remainingYes = Math.max(yesBal - sell, 0);
          const remainingNo = Math.max(noBal - sell, 0);

          return (
            <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29]">
              <div className="flex items-center justify-between">
                <p className="text-[#FFFFFFA3] font-semibold text-base">Your Holdings</p>
                <p className="text-[#FFFFFF80] text-xs font-medium">{total.toFixed(4)} total</p>
              </div>

              <div className="flex flex-col whitespace-nowrap mt-3 text-sm">
                {/* No row */}
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
                  <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(249,115,115,0.12)] text-[#F97373] text-xs font-medium">No</span>
                  <span />
                  <div className="flex flex-col items-end">
                    <span className="text-white text-base leading-tight">{noBal.toFixed(4)}</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">{noPct.toFixed(1)}%</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">- {sell.toFixed(4)} = {remainingNo.toFixed(4)}</span>
                  </div>
                </div>
                <div className="h-px bg-[rgba(255,255,255,0.08)] my-1" />
                {/* Yes row */}
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
                  <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-medium">Yes</span>
                  <span />
                  <div className="flex flex-col items-end">
                    <span className="text-white text-base leading-tight">{yesBal.toFixed(4)}</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">{yesPct.toFixed(1)}%</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">- {sell.toFixed(4)} = {remainingYes.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Projected cashout display */}
        <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29] gap-3 mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Cashout Amount</p>
            <div className="text-[20px] text-white font-semibold">{cashedOutDisplay}</div>
          </div>
          <div className="h-px bg-[rgba(255,255,255,0.08)]" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Remaining Tokens</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-[6px] bg-[rgba(249,115,115,0.12)] text-[#F97373] text-xs font-medium">No</span>
              <span className="text-white font-medium">{Math.max((noBalRaw || 0) - (burnAmount || 0), 0).toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-[6px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-medium">Yes</span>
              <span className="text-white font-medium">{Math.max((yesBalRaw || 0) - (burnAmount || 0), 0).toFixed(4)}</span>
            </div>
          </div>
        </div>

        <HorizontalLine />

        <div className="flex gap-2 my-4">
          <Button
            variant="ghost"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
            className="!h-[46px]"
          >
            Cancel
          </Button>
          <Button
            className="!h-[46px] !bg-white !text-black hover:!bg-white/90 !border-white/30"
            variant="ghost"
            onClick={handleConfirm}
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </Button>
        </div>

      </div>
    </CommonModal>
  );
};

export default CloseBet;
