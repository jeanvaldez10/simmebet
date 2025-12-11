import { LayoutGrid, StretchHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import DesktopBelief from "./desktop-belief";
import DesktopOptions from "./desktop-options";
import ExerciseCard from "@/app/(site)/options/common/exercise-card";
import { portfolio } from "@/temp/option";
import MobileBelief from "./mobile-belief";
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-media-query";
import { useAuthContext } from "@/context/AuthProvider";
import usePositionBelief from "@/hooks/use-position-belief";
import usePortfolioOptions from "@/hooks/portfolio/usePortfolioOptions";
import { betsService } from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import SellOptions from "./modal/sell-options";
import ConformSellOptions from "./modal/confirm-sell-options";
import ExerciseOptions from "./modal/exercise-options";
import BuyOptionModal from "@/app/(site)/options/common/buy-modal";
import ClaimWinnings from "@/app/(site)/market/trading-panel/modal/claim-winnings";
import UpdatePosition from "./modal/update-position";
import UpdateLiquidity from "./modal/update-liquidity";
import NotFound from "@/components/shared/not-found";
import UpdateListing from "@/app/(site)/options/modal/update-listing";
import ConfirmUpdate from "@/app/(site)/options/modal/confirm-update";
import ConformCloseOptions from "@/app/(site)/options/modal/confirm-close";
import { useIsMediumScreen } from "@/hooks/use-medium-screen";
import useBetUpdate from "@/app/(site)/options/hooks/use-bet-update";
import { useQueryClient } from "@tanstack/react-query";
import useOptionsExercise from "@/app/(site)/options/hooks/use-option-exercise";
import useOptionSell from "@/app/(site)/options/hooks/use-option-sell";
import useOptionClose from "@/app/(site)/options/hooks/use-option-close";
import { useMarkets } from "@/hooks/useMarkets";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";

const Position = ({ isPublic, selectedOption }: { isPublic: boolean; selectedOption: "belief" | "options" }) => {
  const deviceType = useDeviceType();
  const screenMedium = useIsMediumScreen();

  const [open, setOpen] = useState<
    | "sell"
    | "confirm_sell"
    | "exercise"
    | "confirm_exercise"
    | "pending"
    | "success"
    | "update"
    | "confirm_close"
    | "confirm_update"
    | null
  >(null);
  const [openUpdate, setOpenUpdate] = useState("");
  const [openUpdateLP, setOpenUpdateLP] = useState("");
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimingMarketAddress, setClaimingMarketAddress] = useState<string | null>(null);
  const { dbUser } = useAuthContext();
  const { updateBet, setUpdateBet, updateBetInitialData } = useBetUpdate();
  const queryClient = useQueryClient();
  const { exerciseData, exerciseInitialData, setExerciseData } =
    useOptionsExercise();
  const { sellInitialData, setOPtionSell, optionSell } = useOptionSell();
  const { setOptionClose, optionClose } = useOptionClose();
  const { data: markets } = useMarkets();

  const {
    data: beliefData,
    isLoading,
    isError,
  } = usePositionBelief(dbUser?.id || "", selectedOption === "belief");

  const {
    data: optionsData,
    isLoading: isOptionLoading,
    isError: isOPtionError,
  } = usePortfolioOptions(dbUser?.id || "", selectedOption === "options");

  const [layout, setLayout] = useState<"table" | "card">("table");

  useEffect(() => {
    if (deviceType === "mobile") {
      setLayout("card");
    } else {
      setLayout("table");
    }
  }, [deviceType]);

  useEffect(() => {
    if (deviceType !== "mobile") {
      if (screenMedium) {
        setLayout("card");
      } else {
        setLayout("table");
      }
    }
  }, [deviceType, screenMedium]);

  const handleClaim = (marketAddress?: string) => {
    if (!dbUser?.id || !marketAddress) {
      toast.error("Unable to claim winnings. Please try again.");
      return;
    }
    setClaimingMarketAddress(marketAddress);
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = async (): Promise<{ claimedAmount?: string; amountOut?: string }> => {
    if (!dbUser?.id || !claimingMarketAddress) {
      toast.error("Unable to claim winnings. Please try again.");
      throw new Error("Unable to claim winnings. Please try again.");
    }

    try {
      const response = await betsService.claimWinnings(dbUser.id, claimingMarketAddress, {
        idempotencyKey: uuidv4(),
      });
      
      if (response.success) {
        // Refresh balances and data
        queryClient.invalidateQueries({ queryKey: ["usdcBalance"] });
        queryClient.invalidateQueries({ queryKey: ["marketBalances"] });
        queryClient.invalidateQueries({ queryKey: ["allMarketBalances"] });
        queryClient.invalidateQueries({ queryKey: ["positionBelief"] });
        
        // Return the response data for the modal to use
        return {
          claimedAmount: response.claimedAmount?.toString(),
          amountOut: response.amountOut?.toString()
        };
      } else {
        throw new Error(response.message || "Failed to claim winnings");
      }
    } catch (error) {
      console.error("Error claiming winnings:", error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Get market data and token balances for claiming market
  const claimingMarket = markets?.find(m => m.contractAddress === claimingMarketAddress);
  const { tokenABalance, tokenBBalance } = useMarketTokens(
    (claimingMarketAddress as `0x${string}`) || "0x0"
  );

  // Calculate winning side and balance for claim modal
  const winningSide = claimingMarket ? 
    (claimingMarket.resolvedOption === "Yes" || claimingMarket.resolvedOption === claimingMarket.yesSideName) ? "yes" : "no"
    : "yes";
  const winningSideBalance = winningSide === "yes" ? tokenBBalance : tokenABalance;

  return (
    <div>
      <div
        className={cn(
          "p-4 hidden md:grid grid-cols-2 gap-4 justify-between   border border-[#FFFFFF29] backdrop-blur-sm bg-black  rounded-[16px]",
          layout === "card"
            ? "rounded-t-[0px] border-t-0"
            : "rounded-t-[0px] rounded-b-[0px] border-t-0 border-b-0 !border-b-transparent"
        )}
      >
        <div className="flex  rounded-[100px] p-[2px] w-[250px] border border-[#FFFFFF29]">
          <button
            className={`flex-1 text-sm font-normal  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "belief"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Belief
          </button>
          {/* <button
            onClick={() => {
              setSelectedOption("options");
            }}
            className={`flex-1 text-sm font-normal py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "options"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Options
          </button> */}
        </div>
        <div className=" w-full flex items-center justify-end pTableCard">
          <div className="border border-[#FFFFFF29] p-1 rounded-[50px] flex items-center justify-center   w-fit">
            <div
              role="button"
              className={cn(
                "flex items-center pointer justify-center p-1.5 h-[28px] w-[28px] text-[#fff] rounded-full",
                layout === "table" ? "bg-[#2E3144]" : "opacity-60"
              )}
              onClick={() => {
                if (!screenMedium) {
                  setLayout("table");
                }
              }}
            >
              <StretchHorizontal />
            </div>
            <div
              role="button"
              className={cn(
                "flex items-center pointer justify-center p-1.5 h-[28px] w-[28px] text-[#fff] rounded-full",
                layout === "card" ? "bg-[#2E3144]" : "opacity-60"
              )}
              onClick={() => setLayout("card")}
            >
              <LayoutGrid />
            </div>
          </div>
        </div>
      </div>


      {false ? (
        <NotFound
          imageURL="/position-not-found.png"
          heading="There are no positions here"
          desc="Browse markets and start betting on different topics"
          buttonText="Browse Markets"
          buttonHref="/markets"
        />
      ) : (
        <>
          {layout === "table" && (
            <>
              {selectedOption === "belief" ? (
                <DesktopBelief
                  isLoading={isLoading}
                  isError={isError}
                  data={beliefData}
                  onClaim={handleClaim}
                  onUpdate={setOpenUpdate}
                  onUpdateLP={setOpenUpdateLP}
                  isPublic={isPublic}
                />
              ) : (
                <DesktopOptions
                  isLoading={isOptionLoading}
                  isError={isOPtionError}
                  data={optionsData}
                  onSellOpen={(e) => {
                    setOpen("sell");
                    setOPtionSell(e);
                  }}
                  onExerciseOpen={(e) => {
                    setOpen("exercise");
                    setExerciseData(e);
                  }}
                  onClose={(e) => {
                    setOpen("confirm_close");
                    setOptionClose(e);
                  }}
                  onUpdate={(e) => {
                    setOpen("update");
                    setUpdateBet({ ...e, amount: 0 });
                  }}
                  isPublic={isPublic}
                />
              )}
            </>
          )}

          {layout === "card" && (
            <>
              {selectedOption === "belief" ? (
                <MobileBelief
                  isLoading={isLoading}
                  isError={isError}
                  data={beliefData}
                  onClaim={handleClaim}
                  onUpdate={(e) => setOpenUpdate(e)}
                  onUpdateLP={(e) => setOpenUpdateLP(e)}
                  onView={() => {}}
                  isPublic={isPublic}
                />
              ) : (
                <div className="grid  mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))]">
                  {isLoading || isError || optionsData === undefined ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={index}
                        className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[352px]"
                      >
                        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
                      </div>
                    ))
                  ) : (
                    <>
                      {portfolio.map((option, index) => (
                        <ExerciseCard
                          id={String(option.id)}
                          key={index}
                          tokenSymbol={option.tokenSymbol}
                          tokenName={option.tokenName}
                          currentPrice={option.currentPrice}
                          priceChange={option.priceChange}
                          strikePrice={option.strikePrice}
                          expiry={option.expiry}
                          position={option.position}
                          tokenImage={option.tokenImage}
                          size={option.size}
                          chartData={option.chartData}
                          onExercise={(e) => {
                            setOpen("exercise");
                            setExerciseData(e);
                          }}
                          onSell={(e) => {
                            setOpen("sell");
                            setOPtionSell(e);
                          }}
                          isPublic={isPublic}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
      {open === "sell" && (
        <SellOptions
          amount={optionSell.amount}
          setAmount={(e) => setOPtionSell((prev) => ({ ...prev, amount: e }))}
          setPrice={(e) => setOPtionSell((prev) => ({ ...prev, price: e }))}
          price={optionSell.price}
          onClose={() => {
            setOpen(null);
            setOPtionSell(sellInitialData);
          }}
          onSellConfirm={() => setOpen("confirm_sell")}
          balance={25}
        />
      )}
      {open === "confirm_sell" && (
        <ConformSellOptions
          onClose={() => {
            setOpen(null);
            setOPtionSell(sellInitialData);
          }}
          amount={optionSell.amount}
          price={optionSell.price}
          name={optionSell.name}
          image={optionSell.image}
          symbol={optionSell.symbol}
          type={optionSell.type}
        />
      )}
      {open === "exercise" && (
        <ExerciseOptions
          onClose={() => {
            setOpen(null);
            setExerciseData(exerciseInitialData);
          }}
          balance={exerciseData.optionBalance}
          onExerciseConfirm={() => setOpen("confirm_exercise")}
          amount={exerciseData.amount}
          setAmount={(e) => setExerciseData((prev) => ({ ...prev, amount: e }))}
        />
      )}

      <BuyOptionModal
        title={open === "confirm_exercise" ? "Confirm exercise order" : ""}
        isOpen={open === "confirm_exercise"}
        onClose={() => {
          setOpen(null);
          setExerciseData(exerciseInitialData);
        }}
        tokenSymbol={exerciseData.symbol}
        tokenName={exerciseData.name}
        selectedOption={"exercise"}
        tokenImage={exerciseData.image}
        strikePrice={exerciseData.strikePrice}
        optionCost={exerciseData.optionCost}
        amount={exerciseData.amount}
        expiry={exerciseData.expiry}
        fees={exerciseData.fee}
        priceChange={exerciseData.priceImpact}
        priceChangePercentage={exerciseData.priceImpactPercentage}
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        }}
      />

      {isClaimModalOpen && claimingMarket && (
        <ClaimWinnings
          onClose={() => {
            setIsClaimModalOpen(false);
            setClaimingMarketAddress(null);
          }}
          imageSrc={winningSide === "yes" ? claimingMarket?.yesSideIcon || "/images/cup.png" : claimingMarket?.noSideIcon || "/images/cup.png"}
          name={winningSide === "yes" ? claimingMarket?.yesSideName || "Yes" : claimingMarket?.noSideName || "No"}
          winningsAmount={`$${formatTokenAmount(winningSideBalance || 0n)}`}
          onConfirm={handleConfirmClaim}
        />
      )}

      {openUpdate && (
        <UpdatePosition onClose={() => setOpenUpdate("")} id={openUpdate} />
      )}

      {openUpdateLP && (
        <UpdateLiquidity onClose={() => setOpenUpdateLP("")} id={openUpdateLP} />
      )}

      {open === "update" && (
        <UpdateListing
          currentPrice={25.5}
          onClose={() => {
            setOpen(null);
            setUpdateBet(updateBetInitialData);
          }}
          onUpdateConfirm={() => setOpen("confirm_update")}
          amount={updateBet.amount}
          setAmount={(e) => setUpdateBet((prev) => ({ ...prev, amount: e }))}
        />
      )}

      {open === "confirm_update" && (
        <ConfirmUpdate
          onClose={() => {
            setOpen(null);
            setUpdateBet(updateBetInitialData);
          }}
          type={updateBet.type}
          name={updateBet.symbol}
          newPrice={updateBet.amount}
          oldPrice={25.5}
          totalAmount={updateBet.amount + 0.5}
          imageSrc={updateBet.image}
          tokenName={updateBet.name}
        />
      )}

      {open === "confirm_close" && (
        <ConformCloseOptions onClose={() => setOpen(null)} {...optionClose} />
      )}
    </div>
  );
};

export default Position;
