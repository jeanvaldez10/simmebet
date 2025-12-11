/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import { ICreatorBeliefActive } from "../hook/use-creator-belief-active";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BeliefProgress from "@/app/(site)/profile/common/belief-progress";
import Button from "@/components/Button";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import { Edit3Icon, Star } from "lucide-react";
import RenounceBelief from "./modal/belief/reannounce-belief";
import CreateBelief from "./modal/belief/create-belief";
import EditConfirmBelief from "./modal/belief/edit-confirm";
import { cn } from "@/lib/utils";
import Finalize from "./modal/belief/finalize";
import ConfirmFinalize from "./modal/belief/confirm-finalize";
import ShareIcon from "@/components/shared/share-icon";
import { useBeliefForm } from "./modal/belief/store/create-context";

const BeliefItem = (item: ICreatorBeliefActive) => {
  const { setFinalizeData, setRenounce, setField } = useBeliefForm();
  const router = useRouter();
  const [open, setOPen] = useState(false);
  const [openModal, setOpenModal] = useState<
    | "reannounce_belief"
    | "edit_belief"
    | "confirm_edit"
    | "finalize"
    | "confirm_finalize"
    | "yes"
    | "no"
    | null
  >(null);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/market/${item.id}`;

  return (
    <React.Fragment>
      <div
        className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl pointer"
        key={item?.id}
        onClick={() =>
          router.push(`/market/${item.marketId}`)
        }
      >
        <div className="flex items-start justify-between mb-4 gap-1">
          <div className="flex items-center gap-3">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={item?.image}
                alt={item.title}
                className="w-full h-full object-cover"
                width={60}
                height={60}
              />
            </div>

            <h2 className="text-base font-semibold text-[#FFFFFF]">
              {item.title}
            </h2>
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
            <Edit3Icon
              size={20}
              className="text-[#FFFFFF52] hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setOpenModal("edit_belief");
                setField(
                  "description",
                  "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorum doloribus maxime quisquam porro nesciunt, optio recusandae cumque repellat."
                );
                setField("eventDate", new Date());
                setField("eventTime", "10:35");
                setField("initialBelief", 10);
                setField("marketImage", null);
                setField("marketImageUrl", "");
                setField("marketName", item.title);
                setField("oracle", item.oracle);
                setField("tieIsPossible", true);
                setField("urls", ["http://localhost:3000/creator?tab=Belief"]);
              }}
            />
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[#FFFFFFA3] text-xs mb-1">Current Marked Odds</p>
          <div className="grid grid-cols-[65px_1fr_60px]  gap-2 items-center w-full whitespace-nowrap font-semibold !text-sm text-[#FFF]">
            <span>No {item.no}%</span>

            <BeliefProgress
              width="w-full"
              yes={item.yes || 0}
              no={item.no || 0}
            />
            <span>Yes {item.yes}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Volume Traded</p>
            <p className="text-[#FFFFFF] font-semibold text-[12px] md:text-sm">
              ${item.volume}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Fees Earned</p>
            <p className="text-[#FFFFFF] font-semibold text-[12px] md:text-sm">
              ${item.fees}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Ends</p>
            <div>
              <p className="text-[#FFFFFF] font-semibold text-[12px] md:text-sm">
                {item.duration}
              </p>
            </div>
          </div>
        </div>

        <div className=" flex items-center gap-2">
          <Button
            variant="primary"
            className={cn(
              "w-full h-[36px] !text-[12px] md:!text-sm !font-semibold !px-3 md:!px-4 mt-4 !bg-[#FD3748]",
              item.isRenounced ? "opacity-50 !cursor-not-allowed" : ""
            )}
            size="sm"
            // @ts-ignore
            onClick={(e) => {
              if (item.isRenounced) return;
              e.stopPropagation();
              setOpenModal("reannounce_belief");
              setRenounce({
                image: item.image,
                name: item.title,
                desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorum doloribus maxime quisquam porro nesciunt, optio recusandae cumque repellat.",
                date: item.duration,
                result: item.yes > item.no,
              });
            }}
          >
            Renounce
          </Button>

          <Button
            variant="ghost"
            className="w-full h-[36px] !text-[12px] md:!text-sm !font-semibold mt-4 !px-3 md:!px-4 whitespace-nowrap"
            size="sm"
          >
            View Market
          </Button>
          {item.oracle === "manual" && (
            <Button
              variant="primary"
              className="w-full h-[36px] !text-[12px] md:!text-sm !font-semibold mt-4 !px-3 md:!px-4"
              // @ts-ignore
              onClick={(e) => {
                e.stopPropagation();
                setFinalizeData((prev) => ({
                  ...prev,
                  image: item.image,
                  name: item.title,
                }));
                setOpenModal("finalize");
              }}
            >
              Finalize
            </Button>
          )}
        </div>
      </div>

      {openModal === "reannounce_belief" && (
        <RenounceBelief onClose={() => setOpenModal(null)} />
      )}

      {openModal === "edit_belief" && (
        <CreateBelief
          onClose={() => setOpenModal(null)}
          onConfirm={() => setOpenModal("confirm_edit")}
          isEditBelief
        />
      )}

      {openModal === "confirm_edit" && (
        <EditConfirmBelief onClose={() => setOpenModal(null)} />
      )}

      {open && (
        <ShareModal
          tweetUrl={encodeURIComponent(
            `Check out this prediction market on Bluff!\n\n${url}`
          )}
          url={url}
          onClose={() => setOPen(false)}
        />
      )}

      {openModal === "finalize" && (
        <Finalize
          onClose={() => setOpenModal(null)}
          onContinue={() => setOpenModal("confirm_finalize")}
        />
      )}

      {openModal === "confirm_finalize" && (
        <ConfirmFinalize onClose={() => setOpenModal(null)} />
      )}
    </React.Fragment>
  );
};

export default BeliefItem;
