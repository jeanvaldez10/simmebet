import { useState } from "react";

const exerciseInitialData = {
  amount: 0,
  optionBalance: 100,
  name: "",
  image: "",
  symbol: "",
  type: "",
  strikePrice: 0,
  optionCost: 0,
  expiry: "7 days",
  priceImpact: 0.534,
  priceImpactPercentage: 0.3,
  fee: 0.5,
};

export type TOptionExerciseForm = typeof exerciseInitialData;

const useOptionsExercise = () => {
  const [exerciseData, setExerciseData] = useState(exerciseInitialData);

  return { exerciseInitialData, exerciseData, setExerciseData };
};

export default useOptionsExercise;
