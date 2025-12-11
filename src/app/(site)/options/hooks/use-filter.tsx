import { useDates } from "@/app/(site)/creator/common/modal/options/use-date";

const tokenOptions = ["All", "TKN", "ETH", "BTC", "USDC", "DAI"];
const strikeOptions = ["All", "$1-5", "$5-10", "$10-20"];
const priceOption = ["All", "Highest to Lowest", "Lowest to Highes"];
const sideOptions = ["All", "Long", "Short"];
const volumeOptions = ["All", "5k", "10k", "25k"];

const useFilter = () => {
  const { firstFriday, fourthFriday, twoDay, oneDay } = useDates();

  const expiryOptions = [
    "All",
    `1d (${oneDay})`,
    `2d (${twoDay})`,
    `Next Friday (${firstFriday})`,
    `Last Friday (${fourthFriday})`,
  ];

  const filters = {
    tokens: tokenOptions,
    tokensAll: tokenOptions.map((label) => ({ label, value: label })),
    prices: priceOption.map((label) => ({ label, value: label })),
    strikes: strikeOptions.map((label) => ({ label, value: label })),
    sides: sideOptions.map((label) => ({ label, value: label })),
    expiries: expiryOptions.map((label) => ({ label, value: label })),
    volumes: volumeOptions.map((label) => ({ label, value: label })),
  };
  return { filters };
};

export default useFilter;
