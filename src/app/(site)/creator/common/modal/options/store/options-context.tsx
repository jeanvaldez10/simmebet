/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useState,
} from "react";
import toast from "react-hot-toast";

// Types
export interface OptionsFormData {
  tokenImage: string;
  tokenSymbol: string;
  tokenName: string;
  expiry: string;
  tokensPerOption: number;
  amount: number;
  premium: number;
  strike: number;
  type: "call" | "put";
}

export interface OPtionsFormErrors {
  token?: string;
  strike?: string;
  expiry?: string;
  amount?: string;
  premium?: string;
}

interface OptionsFormState {
  data: OptionsFormData;
  errors: OPtionsFormErrors;
  isValid: boolean;
}

type OPtionsFormAction =
  | { type: "SET_FIELD"; field: keyof OptionsFormData; value: any }
  | { type: "SET_ERRORS"; errors: OPtionsFormErrors }
  | { type: "RESET_FORM" };

// Initial state
const initialFormData: OptionsFormData = {
  tokenImage: "/images/football.png",
  tokenName: "Token Name",
  tokensPerOption: 1,
  amount: 0,
  expiry: "",
  strike: 0,
  premium: 0,
  tokenSymbol: "TKN",
  type: "call",
};

const initialState: OptionsFormState = {
  data: initialFormData,
  errors: {},
  isValid: false,
};

// Reducer
function optionsFormReducer(
  state: OptionsFormState,
  action: OPtionsFormAction
): OptionsFormState {
  switch (action.type) {
    case "SET_FIELD":
      const newData = { ...state.data, [action.field]: action.value };
      return {
        ...state,
        data: newData,
        errors: { ...state.errors, [action.field]: undefined },
      };

    case "SET_ERRORS":
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0,
      };

    case "RESET_FORM":
      return initialState;

    default:
      return state;
  }
}

// Context
interface OptionsFormContextType {
  state: OptionsFormState;
  dispatch: React.Dispatch<OPtionsFormAction>;
  setField: (field: keyof OptionsFormData, value: any) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;

  setAddOption: React.Dispatch<React.SetStateAction<TAddOption>>;
  addOption: TAddOption;

  resetAddOption: () => void;

  setCloseOption: React.Dispatch<React.SetStateAction<TCloseOption>>;

  closeOption: TCloseOption;
  resetCloseOption: () => void;
}

const OptionsFormContext = createContext<OptionsFormContextType | undefined>(
  undefined
);

// Validation functions
const validateToken = (value: string): string | undefined => {
  if (!value.trim()) return "Token is required";
  return undefined;
};

const validateStrike = (value: number): string | undefined => {
  if (!value) return "Strike value is required";
  return undefined;
};

const validateExpiry = (value: string): string | undefined => {
  if (!value.trim()) return "Expiry is required";
  return undefined;
};

const validateAmount = (value: number): string | undefined => {
  if (!value) return "Amount value is required";
  return undefined;
};

const validatePremium = (value: number): string | undefined => {
  if (!value) return "Premium value is required";
  return undefined;
};

type TAddOption = {
  amount: number;
  tokensPerOption: number;
  currentTokensPerOption: number;
  maxTokensPerOption: number;
  image: string;
  symbol: string;
  name: string;
};

type TCloseOption = {
  image: string;
  symbol: string;
  name: string;
  optionsPrice: number;
  type: string;
  expiry: string;
  strike: number;
  options: number;
  tokensPerOption: number;
};

const initialOptionState = {
  amount: 0,
  tokensPerOption: 0,
  currentTokensPerOption: 0,
  maxTokensPerOption: 0,
  image: "",
  symbol: "",
  name: "",
};

const initialOptionsCloseState = {
  image: "",
  symbol: "",
  name: "",
  optionsPrice: 0,
  type: "",
  expiry: "",
  strike: 0,
  options: 0,
  tokensPerOption: 0,
};

export const OptionsFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(optionsFormReducer, initialState);

  const [addOption, setAddOption] = useState<TAddOption>(initialOptionState);

  const [closeOption, setCloseOption] = useState<TCloseOption>(
    initialOptionsCloseState
  );

  const resetAddOption = () => {
    setAddOption(initialOptionState);
  };

  const resetCloseOption = () => {
    setAddOption(initialOptionState);
  };
  const setField = (field: keyof OptionsFormData, value: any) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const validateForm = (): boolean => {
    const errors: OPtionsFormErrors = {};

    const tokenError = validateToken(state.data.tokenName);
    if (tokenError) errors.token = tokenError;

    const tokenImageError = validateToken(state.data.tokenImage);
    if (tokenImageError) errors.token = tokenImageError;

    const tokenSymbolError = validateToken(state.data.tokenSymbol);
    if (tokenSymbolError) errors.token = tokenSymbolError;

    const strikeError = validateStrike(state.data.strike);
    if (strikeError) errors.strike = strikeError;

    const expiryError = validateExpiry(state.data.expiry);
    if (expiryError) errors.expiry = expiryError;

    const amountError = validateAmount(state.data.amount);
    if (amountError) errors.amount = amountError;

    const premiumError = validatePremium(state.data.premium);
    if (premiumError) errors.premium = premiumError;

    dispatch({ type: "SET_ERRORS", errors });
    return Object.keys(errors).length === 0;
  };

  const submitForm = async (): Promise<boolean> => {
    try {
      const isValid = validateForm();

      if (!isValid) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong try again later");
      return false;
    }
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  const contextValue: OptionsFormContextType = {
    state,
    dispatch,
    setField,
    validateForm,
    submitForm,
    resetForm,
    addOption,
    setAddOption,
    resetAddOption,
    resetCloseOption,
    closeOption,
    setCloseOption,
  };

  return (
    <OptionsFormContext.Provider value={contextValue}>
      {children}
    </OptionsFormContext.Provider>
  );
};

export const useOptionsForm = (): OptionsFormContextType => {
  const context = useContext(OptionsFormContext);
  if (!context) {
    throw new Error("useOptionsForm must be used within a OptionsFormProvider");
  }
  return context;
};
