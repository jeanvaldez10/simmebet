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
export interface BeliefFormData {
  marketImage: File | null;
  marketImageUrl: string;
  marketName: string;
  description: string;
  oracle: string;
  eventDate: Date | null;
  eventTime: string;
  initialBelief: number;
  urls: string[];
  tieIsPossible: boolean;
}

export interface BeliefFormErrors {
  marketName?: string;
  description?: string;
  oracle?: string;
  eventDate?: string;
  urls?: string[];
  general?: string;
}

interface BeliefFormState {
  data: BeliefFormData;
  errors: BeliefFormErrors;
  isValid: boolean;
}

type BeliefFormAction =
  | { type: "SET_FIELD"; field: keyof BeliefFormData; value: any }
  | { type: "SET_ERRORS"; errors: BeliefFormErrors }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "RESET_FORM" }
  | { type: "ADD_URL" }
  | { type: "REMOVE_URL"; index: number }
  | { type: "UPDATE_URL"; index: number; value: string };

// Initial state
const initialFormData: BeliefFormData = {
  marketImage: null,
  marketImageUrl: "",
  marketName: "",
  description: "",
  oracle: "",
  eventDate: new Date(),
  eventTime: "",
  initialBelief: 45,
  urls: [""],
  tieIsPossible: false,
};

const initialState: BeliefFormState = {
  data: initialFormData,
  errors: {},
  isValid: false,
};

// Reducer
function beliefFormReducer(
  state: BeliefFormState,
  action: BeliefFormAction
): BeliefFormState {
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

    case "ADD_URL":
      return {
        ...state,
        data: {
          ...state.data,
          urls: [...state.data.urls, ""],
        },
      };

    case "REMOVE_URL":
      if (state.data.urls.length === 1) return state;
      return {
        ...state,
        data: {
          ...state.data,
          urls: state.data.urls.filter((_, i) => i !== action.index),
        },
        errors: {
          ...state.errors,
          urls: state.errors.urls?.filter((_, i) => i !== action.index),
        },
      };

    case "UPDATE_URL":
      const updatedUrls = [...state.data.urls];
      updatedUrls[action.index] = action.value;
      return {
        ...state,
        data: {
          ...state.data,
          urls: updatedUrls,
        },
        errors: {
          ...state.errors,
          urls: state.errors.urls
            ?.map((error, i) => (i === action.index ? undefined : error))
            .filter((error): error is string => typeof error === "string"),
        },
      };

    default:
      return state;
  }
}

// Context
interface BeliefFormContextType {
  state: BeliefFormState;
  dispatch: React.Dispatch<BeliefFormAction>;
  setField: (field: keyof BeliefFormData, value: any) => void;
  addUrl: () => void;
  removeUrl: (index: number) => void;
  updateUrl: (index: number, value: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
  setLPAmount: React.Dispatch<React.SetStateAction<number>>;
  lpAmount: number;
  setFinalizeData: React.Dispatch<React.SetStateAction<TFinalize>>;
  finalizeData: TFinalize;

  setRenounce: React.Dispatch<React.SetStateAction<TRenounce>>;
  renounce: TRenounce;

  resetFinalizeData: () => void;
}

const BeliefFormContext = createContext<BeliefFormContextType | undefined>(
  undefined
);

// Validation functions
const validateMarketName = (value: string): string | undefined => {
  if (!value.trim()) return "Market name is required";
  if (value.trim().length < 3)
    return "Market name must be at least 3 characters";
  if (value.trim().length > 100)
    return "Market name must be less than 100 characters";
  return undefined;
};

const validateDescription = (value: string): string | undefined => {
  if (!value.trim()) return "Description is required";
  if (value.trim().length < 10)
    return "Description must be at least 10 characters";
  if (value.trim().length > 500)
    return "Description must be less than 500 characters";
  return undefined;
};

const validateOracle = (value: string): string | undefined => {
  if (!value) return "Please select an oracle";
  return undefined;
};

const validateEventDate = (value: Date | null): string | undefined => {
  if (!value) return "Event date is required";
  if (value <= new Date()) return "Event date must be in the future";
  return undefined;
};

const validateUrl = (value: string): string | undefined => {
  if (!value.trim()) return undefined; // Empty URLs are allowed

  try {
    new URL(value);
    return undefined;
  } catch {
    return "Please enter a valid URL";
  }
};

const validateUrls = (urls: string[]): string[] | undefined => {
  const errors: string[] = [];
  let hasValidUrl = false;

  urls.forEach((url, index) => {
    const error = validateUrl(url);
    if (error) {
      errors[index] = error;
    } else if (url.trim()) {
      hasValidUrl = true;
    }
  });

  if (!hasValidUrl) {
    errors[0] = "At least one valid URL is required";
  }

  return errors.length > 0 ? errors : undefined;
};

type TFinalize = {
  image: string;
  name: string;
  Evidence: string;
  result: boolean;
};

type TRenounce = {
  image: string;
  name: string;
  desc: string;
  result: boolean;
  date: string;
};

const initialFinalizeData = {
  image: "",
  name: "",
  Evidence: "",
  result: false,
};

const initialRenounceData = {
  image: "",
  name: "",
  desc: "",
  result: false,
  date: "",
};

export const BeliefFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(beliefFormReducer, initialState);

  const [lpAmount, setLPAmount] = useState(0);
  const [finalizeData, setFinalizeData] =
    useState<TFinalize>(initialFinalizeData);

  const [renounce, setRenounce] = useState<TRenounce>(initialRenounceData);

  const resetFinalizeData = () => {
    setFinalizeData(initialFinalizeData);
  };

  const setField = (field: keyof BeliefFormData, value: any) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const addUrl = () => {
    dispatch({ type: "ADD_URL" });
  };

  const removeUrl = (index: number) => {
    dispatch({ type: "REMOVE_URL", index });
  };

  const updateUrl = (index: number, value: string) => {
    dispatch({ type: "UPDATE_URL", index, value });
  };

  const validateForm = (): boolean => {
    const errors: BeliefFormErrors = {};

    // Validate market name
    const marketNameError = validateMarketName(state.data.marketName);
    if (marketNameError) errors.marketName = marketNameError;

    // Validate description
    const descriptionError = validateDescription(state.data.description);
    if (descriptionError) errors.description = descriptionError;

    // Validate oracle
    const oracleError = validateOracle(state.data.oracle);
    if (oracleError) errors.oracle = oracleError;

    // Validate event date
    const eventDateError = validateEventDate(state.data.eventDate);
    if (eventDateError) errors.eventDate = eventDateError;

    // Validate URLs
    const urlsError = validateUrls(state.data.urls);
    if (urlsError) errors.urls = urlsError;

    dispatch({ type: "SET_ERRORS", errors });
    return Object.keys(errors).length === 0;
  };

  const submitForm = async (): Promise<boolean> => {
    try {
      const isValid = validateForm();

      if (!state.data.marketImage) {
        toast.error("Image is required");
        return false;
      }

      if (!isValid) {
        return false;
      }

      const formData = new FormData();
      formData.append('marketName', state.data.marketName);
      formData.append('description', state.data.description);
      formData.append('oracle', state.data.oracle);
      formData.append('eventDate', state.data.eventDate?.toISOString() || '');
      formData.append('initialBelief', state.data.initialBelief.toString());
      formData.append('lpAmount', lpAmount.toString());
      formData.append('urls', JSON.stringify(state.data.urls));
      formData.append('tieIsPossible', state.data.tieIsPossible.toString());
      formData.append('marketImage', state.data.marketImage);

      const response = await fetch('/api/markets', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create market');
      }

      const result = await response.json();
      toast.success('Market created successfully!');
      console.log('Market created:', result);
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      
      dispatch({
        type: "SET_ERRORS",
        errors: {
          general: error instanceof Error ? error.message : "An error occurred while creating the market. Please try again.",
        },
      });
      return false;
    }
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  const contextValue: BeliefFormContextType = {
    state,
    dispatch,
    setField,
    addUrl,
    removeUrl,
    updateUrl,
    validateForm,
    submitForm,
    resetForm,
    lpAmount,
    setLPAmount,
    finalizeData,
    setFinalizeData,
    renounce,
    setRenounce,
    resetFinalizeData,
  };

  return (
    <BeliefFormContext.Provider value={contextValue}>
      {children}
    </BeliefFormContext.Provider>
  );
};

// Custom hook
export const useBeliefForm = (): BeliefFormContextType => {
  const context = useContext(BeliefFormContext);
  if (!context) {
    throw new Error("useBeliefForm must be used within a BeliefFormProvider");
  }
  return context;
};
