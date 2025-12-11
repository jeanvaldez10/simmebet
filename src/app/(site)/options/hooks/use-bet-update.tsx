import { useState } from "react";

const updateBetInitialData = {
  amount: 0,
  name: "",
  image: "",
  symbol: "",
  type: "",
};

const useBetUpdate = () => {
  const [updateBet, setUpdateBet] = useState(updateBetInitialData);

  return { updateBetInitialData, updateBet, setUpdateBet };
};

export default useBetUpdate;
