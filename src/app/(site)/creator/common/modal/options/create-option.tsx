/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import CommonModal from "@/components/modals";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import Image from "next/image";
import TradeInput from "@/components/shared/trade-input";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-old";
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-media-query";
import { ConnectButton } from "@/components/ConnectButton";
import DepositTokensModal from "./deposits/deposits-token";
import TokensDepositModal from "./deposits/token-deposit";
import SuccessModal from "@/app/(site)/options/common/success-modal";
import { useAccount } from "wagmi";
import { useDates } from "./use-date";
import { formatBalance } from "@/utils/format";
import { useOptionsForm } from "./store/options-context";
import { CustomTooltip } from "@/components/shared/custom-tooltip";

type CreateOptionModalProps = {
  onClose: () => void;
  onConfirm: any;
};

const CreateOption: React.FC<CreateOptionModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const deviceType = useDeviceType();
  const { firstFriday, fourthFriday, twoDay, oneDay } = useDates();
  const { state, setField, submitForm, resetForm } = useOptionsForm();

  const [step, setStep] = useState(1);

  const expiryOptions = [
    { label: `1d (${oneDay})`, value: oneDay },
    { label: `2d (${twoDay})`, value: twoDay },
    { label: `Next Friday (${firstFriday})`, value: firstFriday },
    { label: `Last Friday (${fourthFriday})`, value: fourthFriday },
  ];

  function handleAmountChange(type: "plus" | "minus", value: number) {
    if (type === "plus") {
      setField("tokensPerOption", value * 10);
      return;
    } else {
      setField("tokensPerOption", value / 10);
      return;
    }
  }

  const cost = state.data.tokensPerOption * state.data.amount;

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetForm();
      }}
      className="md:w-[480px] overflow-y-auto max-h-[95vh]"
    >
      <div>
        <span className="font-normal text-[#FFFFFFA3] text-sm block md:hidden">
          Step {step} of 2
        </span>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          {step === 1 ? "Create Option" : "Price Option"}{" "}
        </h2>

        <div className="hidden md:block">
          <StepperOne expiryOptions={expiryOptions} onClose={onClose} />
        </div>

        {deviceType === "mobile" && step === 1 && (
          <StepperOne expiryOptions={expiryOptions} onClose={onClose} />
        )}

        <div className="mb-4 hidden md:block">
          <HorizontalLine />
        </div>

        <div className="hidden md:block">
          <StepperTwo
            tokenPerOption={state.data.tokensPerOption}
            cost={cost}
            handleAmountChange={handleAmountChange}
          />
        </div>

        {deviceType === "mobile" && step === 2 && (
          <StepperTwo
            tokenPerOption={state.data.tokensPerOption}
            cost={cost}
            handleAmountChange={handleAmountChange}
          />
        )}

        <div className="flex mt-4 justify-between gap-4 items-center">
          <Button
            onClick={() => {
              if (deviceType === "mobile") {
                if (step === 1) {
                  onClose();
                  resetForm();
                } else {
                  setStep(1);
                }
              } else {
                onClose();
                resetForm();
              }
            }}
            fullWidth
            variant="ghost"
            className="!text-white"
          >
            Close
          </Button>
          <Button
            onClick={async () => {
              if (deviceType === "mobile") {
                if (step === 1) {
                  setStep(2);
                } else {
                  if (state.data.type === "call") {
                    const isValid = await submitForm();
                    if (isValid) {
                      onConfirm("confirm_option_call");
                    }
                  } else {
                    const isValid = await submitForm();
                    if (isValid) {
                      onConfirm("confirm_option_put");
                    }
                  }
                }
              } else {
                if (state.data.type === "call") {
                  const isValid = await submitForm();
                  if (isValid) {
                    onConfirm("confirm_option_call");
                  }
                } else {
                  const isValid = await submitForm();
                  if (isValid) {
                    onConfirm("confirm_option_put");
                  }
                }
              }
            }}
            type="submit"
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default CreateOption;

const TokenDropdown = ({ onClose }: { onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setField } = useOptionsForm();
  const { address } = useAccount();

  const tokens = [
    { symbol: "TKN", name: "Token Name", url: "/images/football.png" },
    { symbol: "ETH", name: "Ethereum", url: "/ether.png" },
    { symbol: "BTC", name: "Bitcoin", url: "/btc.png" },
    { symbol: "ARB", name: "Arbitrum", url: "/arbitrum.png" },
  ];

  const [open, setOpen] = useState<"deposit_token" | "token" | null>(null);
  const [isError, setIsError] = useState(false);

  const onConfirm = () => {
    const isError = Math.random() > 0.5;

    if (isError) {
      setIsError(true);
      setOpen(null);
      return;
    } else {
      setOpen(null);
    }
  };

  return (
    <>
      <div className="relative">
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`pl-6 pr-4 pointer py-3 bg-[#2c2f42] border-none text-white rounded-full w-full flex items-center gap-3 min-w-[200px] focus:outline-none focus:ring-1 disabled:opacity-50`}
        >
          <div className="h-[24px] w-[24px] overflow-hidden rounded-full">
            <Image
              src={state.data.tokenImage}
              alt={state.data.tokenSymbol}
              width={18}
              height={18}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 text-left">
            <span className="font-medium">{state.data.tokenSymbol}</span>
            <span className="text-white ml-2">- {state.data.tokenName}</span>
          </div>

          <div
            className="flex relative items-center gap-4"
            onClick={(e) => {
              e.stopPropagation();
              if (address) {
                setOpen("deposit_token");
              }
            }}
          >
            {address && (
              <p className="py-1 px-2 rounded-[80px] border border-[#FFFFFF52] !cursor-pointer text-whit text-sm font-semibold mr-[-15px]">
                Deposit
              </p>
            )}
            <ConnectButton
              isWalletBalanceShow={false}
              buttonText="Deposit"
              usdcBalance={0}
              onConnect={() => {
                setOpen("deposit_token");
              }}
            />
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2E3144] rounded-xl shadow-lg border border-[#2E3144] overflow-hidden z-10">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  setField("tokenImage", token.url);
                  setField("tokenName", token.name);
                  setField("tokenSymbol", token.symbol);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#282b3d] transition-colors text-white"
              >
                <div className="h-[20px] w-[20px] overflow-hidden rounded-full">
                  <Image
                    src={token.url}
                    alt={token.symbol}
                    width={18}
                    height={18}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-white ml-2">- {token.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {open === "deposit_token" && (
        <DepositTokensModal
          onClose={() => setOpen(null)}
          onConfirm={() => setOpen("token")}
        />
      )}

      {open === "token" && (
        <TokensDepositModal
          onClose={() => setOpen(null)}
          onConfirm={onConfirm}
          onGoBack={() => setOpen("deposit_token")}
        />
      )}

      {isError && (
        <SuccessModal
          type="option_fail"
          title="Something went wrong"
          subtitle="Please try again."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={onClose}
          onClose={onClose}
          width="w-[300px]"
        />
      )}
    </>
  );
};

const StepperOne = ({
  expiryOptions,
  onClose,
}: {
  expiryOptions: {
    label: string;
    value: string;
  }[];
  onClose: () => void;
}) => {
  const { state, setField } = useOptionsForm();

  return (
    <>
      <p className="text-[#FFFFFFA3] mt-4 block text-sm font-medium mb-2">
        Option type
      </p>
      <div className="flex w-full border mb-4 rounded-[100px] p-0.5 border-[#FFFFFF29]">
        <button
          onClick={() => {
            setField("type", "call");
          }}
          className={`flex-1 text-sm font-medium  py-2 rounded-[100px] text-center transition-all cursor-pointer ${
            state.data.type === "call"
              ? "bg-[#2E3144]"
              : "text-white hover:bg-[#3A3D4D]"
          }`}
        >
          Call
        </button>
        <button
          onClick={() => {
            setField("type", "put");
          }}
          className={`flex-1 text-sm font-medium py-2  rounded-[100px] text-center transition-all cursor-pointer ${
            state.data.type === "put"
              ? "bg-[#2E3144]"
              : "text-white hover:bg-[#3A3D4D]"
          }`}
        >
          Put
        </button>
      </div>

      <div className="text-[#FFFFFFA3] mb-4">
        {state.data.type === "call" ? (
          <label className="block text-sm text-left mb-2 font-medium">
            Select Token
          </label>
        ) : (
          <div className="text-sm flex justify-between items-center w-full mb-2 font-medium">
            <label>Select Token</label>
            <div className="flex items-center gap-2">
              <p>Balance:</p>
              <p className="text-white">$10.000</p>
            </div>
          </div>
        )}

        <TokenDropdown onClose={onClose} />
        {state.errors.token && (
          <p className="text-red-400 text-xs mt-1">{state.errors.token}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 text-[#FFFFFFA3] sm:items-start mb-4 gap-4">
        <div className=" relative">
          <span
            className={cn(
              "text-white text-base absolute left-5 top-10",
              state.data.strike ? " opacity-100" : "opacity-0"
            )}
          >
            $
          </span>
          <label htmlFor="strike" className="block text-sm mb-2 font-medium">
            Strike
          </label>

          <input
            value={state.data.strike || ""}
            onChange={(e) => {
              setField("strike", Number(e.target.value));
            }}
            id="strike"
            type="number"
            placeholder="Enter here"
            className={`pl-8 pr-4 py-3 bg-[#2c2f42] border-none text-white rounded-full w-full focus:outline-none focus:ring-1 disabled:opacity-50`}
          />
          {state.errors.strike && (
            <p className="text-red-400 text-xs mt-1">{state.errors.strike}</p>
          )}
        </div>

        <div>
          <label htmlFor="expiry" className="block text-sm font-medium mb-2">
            Expiry
          </label>

          <Select
            value={state.data.expiry}
            onValueChange={(e) => setField("expiry", e)}
          >
            <SelectTrigger
              className="text-base z-50 border-0 w-full !h-[48px] text-white bg-[#2E3144] py-3 px-5 rounded-[80px] focus-visible:ring-white focus-visible:ring-1"
              id="expiry"
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#2E3144] backdrop-blur-sm text-white border-0 z-[999999]">
              <SelectGroup>
                {expiryOptions.map((item, idx) => (
                  <SelectItem
                    key={idx}
                    value={item.value.slice(0, -3)}
                    className="focus:bg-[#24273a] focus:text-white"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {state.errors.expiry && (
            <p className="text-red-400 text-xs mt-1">{state.errors.expiry}</p>
          )}
        </div>
      </div>
    </>
  );
};

const StepperTwo = ({
  cost,
  handleAmountChange,
  tokenPerOption,
}: {
  handleAmountChange: (type: "plus" | "minus", value: number) => void;
  cost: number;
  tokenPerOption: number;
}) => {
  const { state, setField } = useOptionsForm();

  return (
    <>
      <div className="flex text-[#FFFFFFA3] sm:items-start flex-col sm:flex-row mb-4 gap-4 md:mt-0 mt-[14px]">
        <div className="flex-1">
          <label className="block text-sm mb-2 font-medium">
            Tokens per Option
          </label>

          <div className="bg-[#2c2f42] text-white rounded-full w-full p-3 text-sm">
            <TradeInput
              className="!text-sm  !cursor-default"
              amount={tokenPerOption}
              handleAmountChange={handleAmountChange}
              placeHolder="Enter here"
            />
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="token" className="block text-sm font-medium mb-2">
            Amount (options)
          </label>
          <input
            value={state.data.amount || ""}
            onChange={(e) => {
              setField("amount", Number(e.target.value));
            }}
            id="token"
            type="number"
            placeholder="Enter here"
            className={`pl-6 pr-4 py-3 bg-[#2c2f42] border-none text-white rounded-full w-full focus:outline-none focus:ring-1 disabled:opacity-50`}
          />
          {state.errors.amount && (
            <p className="text-red-400 text-xs mt-1">{state.errors.amount}</p>
          )}
        </div>
      </div>

      <div className=" mb-4 relative z-10 border text-[#FFFFFFA3] border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
        <span className={"font-semibold  text-base"}>
          {state.data.type === "call" ? "Token Cost" : "USDC Cost"}
        </span>
        <span className="text-[#FFFFFF] text-base font-normal">
          {state.data.type === "call"
            ? `${formatBalance(cost, { noDollarSign: true })}`
            : "$100.0"}
        </span>
      </div>

      <div className="mb-4">
        <HorizontalLine />
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2 items-center">
          <label
            htmlFor="option"
            className="block text-[#FFFFFFA3] text-sm font-medium"
          >
            Option Price (Premium)
          </label>

          <CustomTooltip
            className="max-w-[320px] w-fit text-xs"
            align="end"
            name={
              <>
                Need help pricing your option?{" "}
                <span className="font-bold">The Bluff Price Calculator</span>{" "}
                runs our algorithmic model (inspired by Black-Scholes) using
                your inputs - strike, expiry, token, and size - to suggest a
                fair premium.
              </>
            }
          >
            <div className=" group border text-xs px-2 py-1 border-[#FFFFFF52] hover:border-[#FFFFFF] flex items-center gap-2 rounded-full !cursor-pointer">
              <Image alt="logo" src="/logo.png" height={15} width={40} />
              <p className="group-hover:text-[#FFFFFF]  !cursor-pointer ">
                Price Calculator
              </p>
            </div>
          </CustomTooltip>
        </div>
        <input
          value={state.data.premium || ""}
          onChange={(e) => {
            setField("premium", Number(e.target.value));
          }}
          id="option"
          type="number"
          placeholder="Enter here"
          className={`pl-6 pr-4 py-3 bg-[#2c2f42] border-none text-white rounded-full w-full focus:outline-none focus:ring-1 disabled:opacity-50`}
        />
        {state.errors.premium && (
          <p className="text-red-400 text-xs mt-1">{state.errors.premium}</p>
        )}
      </div>
    </>
  );
};
