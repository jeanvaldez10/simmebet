/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import { Star } from "lucide-react";
import { ICreatorOPtionsActive } from "../hook/use-creator-options-active";
import { CircularProgress } from "@/components/common/CircularProgress";
import ProgressBar from "@/components/options/ProgressBar";
import CloseOptionModal from "./modal/options/close-option";
import AddOptionModal from "./modal/options/add-option";
import ConfirmAddModal from "./modal/options/confirm-add";
import { formatBalance } from "@/utils/format";
import ShareIcon from "@/components/shared/share-icon";
import { useOptionsForm } from "./modal/options/store/options-context";

const OptionsItem = (item: ICreatorOPtionsActive) => {
  const router = useRouter();
  const [open, setOPen] = useState(false);
  const [openModal, setOpenModal] = useState<
    "add_option" | "confirm_add_option" | "close_option" | null
  >(null);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/options/${item.id}`;

  const { setAddOption, setCloseOption } = useOptionsForm();

  return (
    <React.Fragment>
      <div
        className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl pointer"
        key={item?.id}
        onClick={() => router.push(`/options/${item.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={item?.image}
                alt={item?.ticker}
                className="w-full h-full object-cover"
                width={60}
                height={60}
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-semibold text-[#FFFFFF]">
                  {item.ticker}
                </h2>

                <div className="flex items-center justify-center rounded-[80px] w-[25px] h-[25px]">
                  <Image
                    src={"/btc.png"}
                    alt="bitcoin"
                    width={17}
                    height={17}
                  />
                </div>
              </div>

              <p className=" font-semibold text-[#FFFFFFA3] text-sm">
                {item.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Star
              className="text-[#FFFFFF52] hover:text-white"
              size={20}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                setOPen(true);
              }}
              style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
            >
              <ShareIcon width="20" height="20" />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[#FFFFFFA3] text-xs mb-1">Contracts Offered</p>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm font-semibold">
              <span className="text-[#FFFFFF]">{item.contractCurrent}</span>
              <span className="text-[#FFFFFF52]"> of {item.contractMax}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenModal("add_option");
                setAddOption((prev) => ({
                  ...prev,
                  image: item.image,
                  name: item.name,
                  symbol: item.ticker,
                  maxTokensPerOption: item.contractMax,
                  currentTokensPerOption: item.contractCurrent,
                  tokensPerOption: 100,
                }));
              }}
              type="button"
              className="w-4 h-4  rounded-full"
            >
              <Image alt="add" src="/add-circle.png" width={16} height={16} />
            </button>
          </div>
          <ProgressBar
            current={item.contractCurrent}
            total={item.contractMax}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Options Price</p>
            <p className="text-[#FFFFFF] font-semibold text-sm">
              {formatBalance(item.optionPrice)}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Strike</p>
            <p className="text-[#FFFFFF] font-semibold text-sm">
              {formatBalance(item.strike)}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Expiry</p>
            <div className="flex items-center gap-1">
              <CircularProgress
                positiveColor="#4F40FF"
                negativeColor="#ffffffa3"
                positivePercentage={50}
                negativePercentage={50}
                size={16}
                strokeWidth={3}
                showText={false}
              />
              <p className="text-[#FFFFFF] font-semibold text-sm">
                {item.expiry}
              </p>
            </div>
          </div>
        </div>

        <div className=" flex items-center gap-2">
          <Button
            variant="primary"
            className="w-full h-[36px] !text-sm !font-semibold mt-4 !bg-[#FD3748]"
            size="sm"
            // @ts-ignore
            onClick={(e) => {
              e.stopPropagation();
              setOpenModal("close_option");
              setCloseOption((prev) => ({
                ...prev,
                strike: item.strike,
                expiry: item.expiry,
                name: item.name,
                image: item.image,
                symbol: item.ticker,
                tokensPerOption: item.tokensPerOption,
                options: item.contractCurrent,
                optionsPrice: item.optionPrice,
                type: item.type,
              }));
            }}
          >
            Close
          </Button>

          <Button
            variant="ghost"
            className="w-full h-[36px] !text-sm !font-semibold mt-4"
            size="sm"
          >
            View Option
          </Button>
        </div>
      </div>
      {open && (
        <ShareModal
          tweetUrl={encodeURIComponent(
            `Check out this prediction market on Bluff!\n\n${url}`
          )}
          url={url}
          onClose={() => setOPen(false)}
        />
      )}
      {openModal === "close_option" && (
        <CloseOptionModal onClose={() => setOpenModal(null)} />
      )}
      {openModal === "add_option" && (
        <AddOptionModal
          onConfirm={() => setOpenModal("confirm_add_option")}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "confirm_add_option" && (
        <ConfirmAddModal onClose={() => setOpenModal(null)} />
      )}
    </React.Fragment>
  );
};

export default OptionsItem;
