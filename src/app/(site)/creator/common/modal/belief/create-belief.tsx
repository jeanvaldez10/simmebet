import React, { useRef } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";
import Button from "@/components/Button";
import { Info, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox-old";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-old";
import { cn } from "@/lib/utils";
import DateTimePicker from "./date-time";
import { useDeviceType } from "@/hooks/use-media-query";
import { useBeliefForm } from "./store/create-context";
import { CustomTooltip } from "@/components/shared/custom-tooltip";

type CreateBeliefModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  isEditBelief?: boolean;
};

const CreateBelief: React.FC<CreateBeliefModalProps> = ({
  onClose,
  onConfirm,
  isEditBelief,
}) => {
  const deviceType = useDeviceType();
  const { state, submitForm, setField, resetForm } = useBeliefForm();
  const [step, setStep] = React.useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setField("marketImage", file);
      setField("marketImageUrl", objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deviceType === "mobile") {
      if (step === 1) {
        setStep(2);
        return;
      }
    }
    const isValid = await submitForm();
    if (isValid) {
      onConfirm();
    }
  };

  const handleClose = () => {
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
  };

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
          {isEditBelief
            ? "Edit Belief"
            : step === 1
            ? "Create Belief"
            : "Add Details"}
        </h2>

        {state.errors.general && (
          <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{state.errors.general}</p>
          </div>
        )}

        <div className="mt-1 flex flex-col gap-1">
          <form onSubmit={handleSubmit} className="text-[#FFFFFFA3]">
            <div className="hidden md:block">
              <StepperOne
                imageUrl={state.data.marketImageUrl}
                handleImageUpload={handleImageUpload}
                fileInputRef={fileInputRef}
              />
            </div>

            {deviceType === "mobile" && step === 1 && (
              <StepperOne
                imageUrl={state.data.marketImageUrl}
                handleImageUpload={handleImageUpload}
                fileInputRef={fileInputRef}
              />
            )}

            <div className="hidden md:block">
              <StepperTwo isEditBelief={isEditBelief!} />
            </div>

            {deviceType === "mobile" && step === 2 && (
              <StepperTwo isEditBelief={isEditBelief!} />
            )}

            <div className="flex justify-between gap-4 items-center">
              <Button
                onClick={handleClose}
                type="button"
                fullWidth
                variant="ghost"
                className="!text-white"
              >
                {deviceType === "mobile" && step === 2 ? "Back" : "Close"}
              </Button>
              <Button type="submit" fullWidth>
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CommonModal>
  );
};

export default CreateBelief;

const StepperOne = ({
  fileInputRef,
  imageUrl,
  handleImageUpload,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageUrl: string;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { state, setField } = useBeliefForm();

  return (
    <>
      <div className="flex items-center md:my-4 my-[22.5px] justify-between gap-2">
        <div className="flex items-center gap-4">
          <div
            role="button"
            className="pointer relative group w-20 h-20 rounded-full overflow-hidden z-10 bg-[#2E3144] flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 z-10 transition duration-300 w-full h-full flex items-center justify-center",
                imageUrl ? "bg-[#00000080]" : "bg-[#00000020]"
              )}
            >
              <Plus className="opacity-50" size={32} />
            </div>

            <div className="relative z-0">
              {!imageUrl ? (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className=" opacity-50 group-hover:opacity-0 transition duration-300"
                >
                  <path
                    d="M28.9079 22.6129L24.7345 12.8662C23.3212 9.55952 20.7212 9.42619 18.9745 12.5729L16.4545 17.1195C15.1745 19.4262 12.7879 19.6262 11.1345 17.5595L10.8412 17.1862C9.1212 15.0262 6.69454 15.2929 5.45454 17.7595L3.1612 22.3595C1.54787 25.5595 3.8812 29.3329 7.45454 29.3329H24.4679C27.9345 29.3329 30.2679 25.7995 28.9079 22.6129Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.29687 10.667C11.506 10.667 13.2969 8.87613 13.2969 6.66699C13.2969 4.45785 11.506 2.66699 9.29687 2.66699C7.08774 2.66699 5.29688 4.45785 5.29688 6.66699C5.29688 8.87613 7.08774 10.667 9.29687 10.667Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <Image
                  src={imageUrl}
                  alt="user_profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </div>
          <p className="text-[#FFFFFFA3] text-sm font-medium">Market Image</p>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            className="bg-white text-black rounded-full py-1 text-xs font-semibold px-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="market_name" className="block text-sm font-medium mb-2">
          Question (market name)
        </label>
        <input
          id="market_name"
          type="text"
          placeholder="Enter here"
          value={state.data.marketName}
          onChange={(e) => setField("marketName", e.target.value)}
          className={cn(
            "pl-6 pr-4 py-3 bg-[#2c2f42] border-none text-white rounded-full w-full focus:outline-none focus:ring-1 disabled:opacity-50",
            state.errors.marketName && "focus:ring-red-500"
          )}
        />
        {state.errors.marketName && (
          <p className="text-red-400 text-xs mt-1">{state.errors.marketName}</p>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-2 items-center">
          <label htmlFor="desc" className="block text-sm font-medium">
            Description
          </label>
          <CustomTooltip
            className="max-w-[320px] w-fit text-xs"
            align="end"
            name={
              <>
                Wrote a rough description? Tap{" "}
                <span className="font-bold">Enhance</span> to let our AI polish
                and expand it. The description helps our oracle resolve the
                market, more detail means faster, fairer, and more accurate
                outcomes.
              </>
            }
          >
            <p className="pointer border text-xs px-3 py-1 rounded-full font-semibold border-[#FFFFFF52] hover:text-[#FFFFFF] hover:border-[#FFFFFF]">
              Enhance
            </p>
          </CustomTooltip>
        </div>
        <textarea
          id="desc"
          value={state.data.description}
          onChange={(e) => setField("description", e.target.value)}
          className={cn(
            "pl-6 pr-4 py-3 bg-[#2c2f42] border-none text-white min-h-[100px] rounded-md w-full focus:outline-none focus:ring-1 disabled:opacity-50",
            state.errors.description && "focus:ring-red-500"
          )}
          placeholder="Enter here"
        />
        {state.errors.description && (
          <p className="text-red-400 text-xs mt-1">
            {state.errors.description}
          </p>
        )}
      </div>
    </>
  );
};

const StepperTwo = ({ isEditBelief }: { isEditBelief: boolean }) => {
  const { state, setField, addUrl, removeUrl, updateUrl } = useBeliefForm();

  return (
    <>
      <div className="mb-3 relative md:mt-0 mt-3">
        <label className="text-sm font-medium flex items-center gap-1 w-fit mb-2">
          Oracle
          <CustomTooltip
            className="max-w-[320px] w-fit text-xs"
            align="start"
            name={
              <div className=" space-y-2">
                <p>Choose how your market will be resolved.</p>
                <p>
                  <span className=" font-semibold">Bluff AI Oracle:</span> uses
                  our web crawler to auto-resolve based on your description and
                  links.
                </p>
                <p>
                  <span className="font-semibold">Manual Outcome:</span> lets
                  you use your own oracle. You’ll finalize the result yourself
                  and must provide public evidence to support it.
                </p>
              </div>
            }
          >
            <Info className="w-4 h-4 hover:text-[#FFFFFF] pointer" />
          </CustomTooltip>
        </label>

        <Select
          value={state.data.oracle}
          onValueChange={(value) => setField("oracle", value)}
        >
          <SelectTrigger
            className={cn(
              "z-50 border-0 w-full !h-[48px] text-white bg-[#2E3144] py-3 px-5 rounded-[80px] text-sm",
              state.errors.oracle && "ring-1 ring-red-500"
            )}
            id="oracle"
          >
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#2E3144] backdrop-blur-sm text-white border-0 z-[999999]">
            <SelectGroup>
              <SelectItem
                value="bluff_ai_oracle"
                className="focus:bg-[#24273a] focus:text-white pointer"
              >
                Bluff AI Oracle
              </SelectItem>
              <SelectItem
                className="focus:bg-[#24273a] focus:text-white pointer"
                value="manual"
              >
                Manual Outcome
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {state.errors.oracle && (
          <p className="text-red-400 text-xs mt-1">{state.errors.oracle}</p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="event_date" className="block text-sm font-medium mb-2">
          Event date
        </label>
        <DateTimePicker
          onDateSelect={({ date, time }) => {
            setField("eventDate", date);
            setField("eventTime", time);
          }}
          value={
            isEditBelief
              ? { date: state.data.eventDate!, time: state.data.eventTime! }
              : null
          }
        />
        {state.errors.eventDate && (
          <p className="text-red-400 text-xs mt-1">{state.errors.eventDate}</p>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm items-center mb-2">
          <label htmlFor="range" className="block font-medium">
            Initial belief
          </label>
          <p>{state.data.initialBelief}%</p>
        </div>
        <div className="relative w-full h-2 bg-[#2E3144] rounded-full">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-150 pointer"
            style={{
              width: `${state.data.initialBelief}%`,
              background: "linear-gradient(to right, #FFFFFF52, #33E06E)",
            }}
          />

          <input
            id="range"
            type="range"
            min="0"
            max="100"
            value={state.data.initialBelief}
            onChange={(e) => setField("initialBelief", Number(e.target.value))}
            className="absolute w-full h-6 -top-2 opacity-0 pointer z-10"
            style={{ touchAction: 'pan-x' }}
          />

          <div
            className="absolute w-4 h-4 bg-[#33E06E] rounded-full -top-1 transition-all duration-150 pointer"
            style={{ left: `calc(${state.data.initialBelief}% - 8px)` }}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium flex items-center gap-1">
            URLs
            <CustomTooltip
              className="max-w-[320px] w-fit text-xs"
              align="start"
              name=" Add source links to help resolve your market. Our AI oracle crawls
              these URLs for outcome data like official scoreboards, news sites,
              or reference pages. The better the source, the faster the
              resolution."
            >
              <Info className="w-4 h-4 hover:text-[#FFFFFF] pointer" />
            </CustomTooltip>
          </label>

          <button
            type="button"
            className="text-xs px-3 py-1 border border-[#FFFFFF52] hover:text-[#FFFFFF] hover:border-[#FFFFFF] rounded-full font-semibold"
            onClick={addUrl}
          >
            Add New
          </button>
        </div>
        <div className="space-y-2">
          {state.data.urls.map((url, index) => (
            <div key={index}>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Enter here"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className={cn(
                    "pl-6 pr-10 py-3 bg-[#2c2f42] text-white rounded-full w-full focus:outline-none focus:ring-1",
                    state.errors.urls?.[index] && "focus:ring-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (state.data.urls.length === 1) {
                      updateUrl(index, "");
                    } else {
                      removeUrl(index);
                    }
                  }}
                  className="pointer ml-2 p-2 w-8 h-8 rounded-full flex justify-center items-center bg-[#2c2f42] text-white opacity-70 hover:opacity-100"
                >
                  <AiOutlineDelete size={24} />
                </button>
              </div>
              {state.errors.urls?.[index] && (
                <p className="text-red-400 text-xs mt-1">
                  {state.errors.urls[index]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex mb-3 items-center gap-2">
        <Checkbox
          className="bg-[#2c2f42] h-4 w-4"
          checked={state.data.tieIsPossible}
          onCheckedChange={(checked) => setField("tieIsPossible", checked)}
        />
        <label className="text-sm">Tie is a possible result</label>
      </div>
    </>
  );
};
