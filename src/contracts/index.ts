import {
  ARBITRUM_USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "@/constants";

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

export const usdcContract = {
  address: ARBITRUM_USDC_CONTRACT_ADDRESS,
  abi: ERC20_ABI,
};

export const usdtContract = {
  address: USDT_CONTRACT_ADDRESS,
  abi: ERC20_ABI,
};
