import { useState } from "react";

const sellInitialData = {
  amount: 0,
  name: "",
  image: "",
  symbol: "",
  type: "",
  price: 0,
};

export type TOptionSell = typeof sellInitialData

const useOptionSell = () => {
  const [optionSell, setOPtionSell] = useState(sellInitialData);

  return { sellInitialData, optionSell, setOPtionSell };
};

export default useOptionSell;
