import { useState } from "react";

const optionCloseInitialData = {
  optionListed: 0,
  name: "",
  image: "",
  symbol: "",
  type: "",
  listPrice: 0,
};

export type TOptionClose = typeof optionCloseInitialData;

const useOptionClose = () => {
  const [optionClose, setOptionClose] = useState(optionCloseInitialData);

  return { optionCloseInitialData, optionClose, setOptionClose };
};

export default useOptionClose;
