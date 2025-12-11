"use client";

import { useQueryClient } from "@tanstack/react-query";

import { networks } from "@/config/wagmi";
import { ARBITRUM_USDC_CONTRACT_ADDRESS, QUICK_AMOUNTS, DEPOSIT_DISABLED } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { CURRENCIES } from "@/temp/withdraw";
import { formatBalance } from "@/utils/format";
import { useAppKitNetwork } from "@reown/appkit/react";
import { Info, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { erc20Abi, parseEther, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import Button from "./Button";
import Dropdown, { DropdownOption } from "./common/Dropdown";
import TabSelector from "./common/TabSelector";
import { useToast } from "./common/ToastContext";
import { ConnectButton } from "./ConnectButton";
import { UserWithNotifications } from "@/hooks/useAuth";
import CommonModal from "./modals";
import SuccessModal from "@/app/(site)/options/common/success-modal";
import { CustomTooltip } from "./shared/custom-tooltip";

type ModalMode = "deposit" | "withdraw" | "completed";

export default function WithdrawalModal({
  onClose,
  dbUser,
  isDeposit,
}: {
  onClose: () => void;
  dbUser: UserWithNotifications;
  isDeposit: boolean;
}) {
  const { switchNetwork } = useAppKitNetwork();
  const { userBalance, refreshUserBalance } = useAuth();
  const { address } = useAccount();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const {
    writeContract,
    error,
    isPending: isWritePending,
    failureReason,
    isSuccess: isWriteSuccess,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        // Invalidate userBalance cache after successful withdrawal
        queryClient.invalidateQueries({ queryKey: ["usdcBalance"] });
      },
    },
  });

  const { data: usdcTokenBalance, refetch: refetchUsdcTokenBalance } = useReadContract({
    address: ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const usdcBalance = !!usdcTokenBalance
    ? Number(usdcTokenBalance / 1_000_000n)
    : 0;
  const usdcFormattedTokenBalance = usdcBalance.toFixed(2);

  // Convert userBalance to string for safe handling
  const balanceString = userBalance?.toString() || "0";

  const [amount, setAmount] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Cache duration in milliseconds (5 minutes)
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<ModalMode>("deposit");
  const [selectedTab, setSelectedTab] = useState<"deposit" | "withdraw">(
    DEPOSIT_DISABLED ? "withdraw" : (isDeposit ? "deposit" : "withdraw")
  );
  const [selectedNetwork, setSelectedNetwork] = useState<DropdownOption | null>(
    networks[0]
      ? {
          id: networks[0].id,
          name: networks[0].name,
          symbol: networks[0].name,
        }
      : null
  );
  const [selectedCurrency, setSelectedCurrency] =
    useState<DropdownOption | null>(
      CURRENCIES[4]
        ? {
            id: CURRENCIES[4].id,
            name: CURRENCIES[4].name,
            symbol: CURRENCIES[4].symbol,
          }
        : null
    );
  const [walletAddress, setWalletAddress] = useState("");
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  // const router = useRouter();

  useEffect(() => {
    if (isWriteSuccess) {
      setIsSubmitting(false);
      showToast({ message: "Transaction successful!" });
      refreshUserBalance();
      refetchUsdcTokenBalance();

      // Reset form after successful transaction
      setAmount("");
      
      // Refresh user balance after successful deposit
      setTimeout(() => {
        refreshUserBalance();
      }, 1000);
    } else if (error || failureReason) {
      console.log("failureReason:", failureReason);
      showToast({
        message: !!address
          ? "Transaction failed. Please try again."
          : "Please connect your wallet.",
      });
      setIsSubmitting(false);
    }
  }, [
    isWritePending,
    isWriteSuccess,
    error,
    failureReason,
    address,
    showToast,
    refetchUsdcTokenBalance,
    refreshUserBalance,
  ]);
  const {
    sendTransaction,
    data: hash,
    status: transactionStatus,
    isError,
    isPending,
  } = useSendTransaction({
    mutation: {
      onError: (
        error: Error & {
          code?: number | string;
          name?: string;
          shortMessage?: string;
        }
      ) => {
        setIsSubmitting(false);
        if (
          error &&
          typeof error === "object" &&
          ("code" in error || "name" in error)
        ) {
          if (
            error.code === 4001 ||
            error.code === "ACTION_REJECTED" ||
            error.name === "UserRejectedRequestError"
          ) {
            showToast({ message: "Transaction cancelled by user" });
            return;
          }
          if (error.code === -32603 || error.code === "INSUFFICIENT_FUNDS") {
            showToast({ message: "Insufficient funds for transaction" });
            return;
          }
          showToast({
            message: "Transaction failed. Please try again.",
          });
        } else {
          showToast({
            message: "Transaction failed. Please try again.",
          });
        }
      },
      onSuccess: () => {
        showToast({ message: "Transaction submitted!" });
      },
    },
  });

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const numAmount = parseFloat(amount || "0");
    const usdcBalance =
      (parseFloat(usdcTokenBalance?.toString() || "0") / 1e6) * 1;

    const balanceNum = parseFloat(balanceString);

    if (selectedTab === "withdraw") {
      setInsufficientFunds(!!address && numAmount > balanceNum);
    } else {
      setInsufficientFunds(!!address && numAmount > usdcBalance);
    }
  }, [amount, selectedTab, balanceString, usdcTokenBalance, address]);

  useEffect(() => {
    const notifySuccess = async () => {
      if (!isConfirming && hash && selectedTab === "deposit") {
        setMode("completed");
        setIsSubmitting(false);
        refreshUserBalance();
      }
    };
    notifySuccess();
  }, [
    isConfirming,
    hash,
    dbUser.id,
    amount,
    selectedTab,
    selectedCurrency?.symbol,
    refreshUserBalance,
  ]);

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  useEffect(() => {
    if ((isError || transactionStatus === "idle") && selectedTab === "deposit") {
      setIsSubmitting(false);
    }
  }, [isError, transactionStatus, selectedTab]);

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const decimalCount = (cleanValue.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setAmount(cleanValue);
    }
  };

  const handleNetworkChange = async (option: DropdownOption) => {
    try {
      setIsNetworkSwitching(true);
      setSelectedNetwork(option);

      const networkId =
        typeof option.id === "string" ? parseInt(option.id, 10) : option.id;
      const network = networks.find((n) => n.id === networkId);

      if (network) {
        await switchNetwork(network);
      }
    } catch {
      toast.error("Please switch network in your wallet");
      setSelectedNetwork(selectedNetwork);
    } finally {
      setIsNetworkSwitching(false);
    }
  };

  const handleSubmit = async () => {
    if (!dbUser) return;
    if (insufficientFunds) return;

    if (selectedCurrency?.id !== "eth" && selectedCurrency?.id !== "usd-coin") {
      toast.error("Only USDC and ETH are supported for deposit/withdrawal");
      return;
    }

    if (selectedTab === "deposit" && selectedNetwork?.id.toString() !== "42161") {
      toast.error("Only Arbitrum is supported for deposits");
      return;
    }

    try {
      if (selectedTab === "deposit") {
        setIsSubmitting(true);
        if (!selectedNetwork || !selectedCurrency || !amount) {
          toast.error("Please fill in all required fields");
          setIsSubmitting(false);
          return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          toast.error("Please enter a valid amount");
          setIsSubmitting(false);
          return;
        }

        const currencyValue = (
          selectedCurrency as unknown as { id: string }
        ).id.toLowerCase();

        let transactionConfig: {
          to: `0x${string}`;
          value?: bigint;
          data?: `0x${string}`;
        };

        if (currencyValue === "eth") {
          const ethAmount = numericAmount.toFixed(18);
          transactionConfig = {
            to: dbUser.walletAddress as `0x${string}`,
            value: parseEther(ethAmount),
          };
          sendTransaction(transactionConfig, {
            onSuccess: (hash) => {
              console.log("ETH transfer successful:", hash);
              showToast({ message: "ETH transfer submitted successfully!" });
            },
            onError: (error) => {
              console.error("ETH transfer failed:", error);
              setIsSubmitting(false);
              showToast({ 
                message: error.message || "ETH transfer failed. Please try again." 
              });
            }
          });
        } else {
          if (!dbUser) {
            setIsSubmitting(false);
            return;
          }
          const usdcAmount = numericAmount.toFixed(6);

          //tranfer the usdcAmount to the walletAddress using wagmi
          writeContract({
            address: ARBITRUM_USDC_CONTRACT_ADDRESS,
            abi: erc20Abi,
            functionName: "transfer",
            chainId: 42161,
            args: [
              dbUser.walletAddress as `0x${string}`,
              parseUnits(usdcAmount, 6),
            ],
          }, {
            onSuccess: (hash) => {
              console.log("USDC transfer successful:", hash);
              showToast({ message: "USDC transfer submitted successfully!" });
              refreshUserBalance();
            },
            onError: (error) => {
              console.error("USDC transfer failed:", error);
              setIsSubmitting(false);
              showToast({ 
                message: error.message || "USDC transfer failed. Please try again." 
              });
              refreshUserBalance();
            }
          });
        }
      } else {
        setIsSubmitting(true);
        if (!walletAddress) {
          toast.error("Please enter a wallet address");
          setIsSubmitting(false);
          return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          toast.error("Please enter a valid amount");
          setIsSubmitting(false);
          return;
        }

        // Call our new API route
        const response = await fetch('/api/wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: numericAmount,
            recipient: walletAddress,
            token: selectedCurrency?.id || 'usd-coin',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Withdrawal failed');
        }

        const result = await response.json();
        if (result.success) {
          setMode("completed");
          toast.success("Withdrawal processed successfully!");
          
          // Refresh user balance after successful withdrawal
          setTimeout(() => {
            refreshUserBalance();
          }, 500);
        } else {
          throw new Error(result.message || 'Withdrawal failed');
        }
      }
    } catch (error: unknown) {
      console.error("Transaction error:", error);
      setIsSubmitting(false);
      toast.error("Transaction failed. Please try again.");
    }
  };

  // const goToMarkets = () => {
  //   router.push("/markets");
  //   onClose();
  // };

  const tabs = [
    { id: "deposit", label: DEPOSIT_DISABLED ? "Deposit (Disabled)" : "Deposit" },
    { id: "withdraw", label: "Withdraw" },
  ];

  return (
    <CommonModal
      onClose={onClose}
      isCloseButtonShow={false}
      className="p-0 overflow-y-auto max-h-[95vh]"
    >
      {mode === "completed" ? (
        <SuccessModal
          type={selectedTab === "deposit" ? "deposit" : "withdrawal"}
          title={
            selectedTab === "deposit"
              ? "Deposit Completed!"
              : "Withdrawal Completed!"
          }
          subtitle={
            selectedTab === "deposit"
              ? "Your deposit has been confirmed!"
              : "Your withdrawal has been processed!"
          }
          amount={`$${amount}`}
          isPositive={selectedTab === "deposit"}
          txHash={hash as `0x${string}` | null}
          buttonText="Close"
          onButtonClick={onClose}
          width="w-[300px]"
          onClose={() => {
            onClose();
          }}
        />
      ) : (
        <div className="max-w-xl w-full">
          <div className="flex items-center pt-5 pb-4 px-6 max-sm:px-4 border-b border-[rgba(255,255,255,0.08)]">
            <TabSelector
              tabs={tabs}
              selectedTab={selectedTab}
              onTabChange={(tabId) => {
                // Only allow withdraw tab if deposits are disabled
                if (DEPOSIT_DISABLED && tabId === "deposit") {
                  return; // Don't allow switching to deposit when disabled
                }
                setSelectedTab(tabId as "deposit" | "withdraw");
              }}
            />

            {selectedTab === "withdraw" && (
              <div className="ml-auto text-base max-sm:text-sm text-gray-300">
                Balance:{" "}
                <span className="text-white font-medium">
                  {formatBalance(userBalance)}
                </span>
              </div>
            )}

            {selectedTab === "deposit" && (
              <div className="ml-auto flex items-center">
                <ConnectButton
                  usdcBalance={
                    (parseFloat(usdcTokenBalance?.toString() || "0") / 1e6) * 1
                  }
                />
              </div>
            )}
          </div>

          <div className="p-6 max-sm:p-4">            
            <div className="flex flex-col gap-2 border p-4 max-sm:p-3 mb-6 rounded-lg border-solid border-[rgba(255,255,255,0.16)] bg-[#1C1C28]">
              <div className="text-base max-sm:text-sm font-semibold text-[rgba(255,255,255,0.64)] text-center">
                Enter Amount
              </div>
              <div className="text-[40px] max-sm:text-[32px] font-semibold text-[#F2F2FD] flex items-center justify-center">
                <div className="inline-flex items-center justify-center relative">
                  <span className="text-[40px] max-sm:text-[32px] text-[#F2F2FD] absolute left-0">
                    $
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      className="text-[40px] max-sm:text-[32px] bg-transparent font-semibold text-[#F2F2FD] outline-none text-center pl-6"
                      placeholder={!isInputFocused ? "0.00" : ""}
                      style={{
                        width: `${Math.max(4.3, amount.length + 1)}ch`,
                        minWidth: "4rem",
                      }}
                    />
                  </div>
                </div>
              </div>
              {insufficientFunds && (
                <div className="text-red-500 text-sm text-center">
                  {!!address && parseFloat(amount) <= usdcBalance
                    ? "Amount must be greater than 0"
                    : "Insufficient funds"}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      if (value == "Max" && !address) {
                        return;
                      } else {
                        setAmount(
                          value == "Max" ? (selectedTab === "withdraw" ? formatBalance(userBalance, {
                            noDollarSign: true
                          }) : formatBalance(usdcFormattedTokenBalance, {
                            noDollarSign: true
                          })) : value
                        );
                      }
                    }}
                    className="flex-1 border text-white text-xs font-semibold cursor-pointer px-3 py-1 rounded-[80px] border-solid border-[rgba(255,255,255,0.32)] min-w-[60px] max-sm:min-w-[70px]"
                  >
                    {value === "Max" ? value : `$${value}`}
                  </button>
                ))}
              </div>
            </div>

            {selectedTab === "withdraw" && (
              <div className="mb-4">
                <div className="text-gray-400 mb-2">Address</div>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter Address"
                  className="w-full bg-[#2A2A3A] text-white rounded-full p-4 outline-none placeholder-gray-500"
                />
              </div>
            )}

            <div className={`grid gap-4 mb-6 ${selectedTab === "deposit" ? "grid-cols-2 max-sm:grid-cols-1" : "grid-cols-1"}`}>
              {selectedTab === "deposit" && (
                <Dropdown
                  label="Network"
                  options={networks
                    .filter((net) => net.id?.toString() === "42161")
                    .map((net) => ({
                      id: net.id,
                      name: net.name,
                      symbol: "",
                    }))}
                  value={selectedNetwork}
                  onChange={handleNetworkChange}
                />
              )}
              <Dropdown
                label="Currency"
                options={CURRENCIES.filter(
                  (currency) => currency.id === "usd-coin"
                ).map((currency) => ({
                  id: currency.id,
                  name: currency.name,
                  symbol: currency.symbol,
                }))}
                value={selectedCurrency}
                onChange={(option) => setSelectedCurrency(option)}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={insufficientFunds || isSubmitting || (selectedTab === "deposit" && isPending)}
              className="w-full mb-4"
            >
              {isNetworkSwitching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Switching Network...
                </div>
              ) : (selectedTab === "deposit" && (isPending || isSubmitting)) ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isConfirming ? "Confirming..." : "Processing..."}
                </div>
              ) : selectedTab === "withdraw" && isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : insufficientFunds ? (
                "Insufficient Funds"
              ) : selectedTab === "deposit" ? (
                "Deposit"
              ) : (
                "Withdraw"
              )}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="mb-4"
              onClick={onClose}
            >
              Close
            </Button>

            <div className="flex items-center justify-center text-sm max-sm:text-xs text-gray-400 gap-1">
              <span>
                {selectedTab === "deposit" ? "deposits" : "withdrawals"} are
                sponsored by Simmi
              </span>

              <CustomTooltip
                className="max-w-[320px] w-fit text-xs"
                align="end"
                name={
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-white text-sm leading-relaxed">
                      Simmi sponsors all gas transactions on Bluff. You will never have to pay gas for any transaction. Platform fees still apply.
                    </p>
                  </div>
                }
              >
                <Info className="w-4 h-4 text-[#FFFFFF52] hover:text-white pointer" />
              </CustomTooltip>
            </div>
          </div>
        </div>
      )}
    </CommonModal>
  );
}
