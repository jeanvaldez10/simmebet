import Button from "@/components/Button";
import { useAuthContext } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import useCreatorOptionsActive from "../hook/use-creator-options-active";
import OptionsItem from "./options-item";
import OptionsHistory from "./options-history";
import CreateOption from "./modal/options/create-option";
import ConfirmOptionPut from "./modal/options/confirm-option-put";
import ConfirmOptionCall from "./modal/options/confirm-option-call";

const Options = () => {
  const [selectedOption, setSelectedOption] = useState<"active" | "history">(
    "active"
  );
  const [open, setOpen] = useState<
    "create_option" | "confirm_option_put" | "confirm_option_call" | null
  >(null);

  const { dbUser } = useAuthContext();

  const { isFetching, data, isError } = useCreatorOptionsActive(
    dbUser?.id || ""
  );

  return (
    <div>
      <div
        className={cn(
          "p-4 hidden md:grid grid-cols-2 gap-4 justify-between   border border-[#FFFFFF29] backdrop-blur-sm bg-[#16171E52]  rounded-[16px]",
          selectedOption === "active"
            ? "rounded-t-[0px] border-t-0"
            : "rounded-t-[0px] rounded-b-[0px] border-t-0 border-b-0 !border-b-transparent"
        )}
      >
        <div className="flex  rounded-[100px] p-[2px] w-[250px] border border-[#FFFFFF29]">
          <button
            onClick={() => {
              setSelectedOption("active");
            }}
            className={`flex-1 text-sm font-normal  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "active"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setSelectedOption("history");
            }}
            className={`flex-1 text-sm font-normal py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "history"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            History
          </button>
        </div>

        <div className="w-full justify-end flex items-center">
          <Button
            onClick={() => setOpen("create_option")}
            className="w-fit flex items-center gap-1 text-sm "
          >
            Add New
            <Plus size={18} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#16171E52] backdrop-blur-md z-20 sticky !top-[77px] md:hidden pt-0 border border-[#FFFFFF29] p-4 rounded-[16px] rounded-t-[0px] border-t-0">
        <div className="flex rounded-[100px] p-[2px] w-full border border-[#FFFFFF29]">
          <button
            onClick={() => {
              setSelectedOption("active");
            }}
            className={`flex-1 text-sm font-normal !h-[50px]  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "active"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setSelectedOption("history");
            }}
            className={` !h-[50px] flex-1 text-sm font-normal py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "history"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            History
          </button>
        </div>
        <div className=" h-[56px] w-[56px] rounded-full justify-end flex items-center">
          <Button
            onClick={() => setOpen("create_option")}
            className="flex items-center justify-center gap-1 text-sm h-[56px] w-[56px] rounded-full !p-0"
          >
            <Plus size={20} />
          </Button>
        </div>
      </div>

      {selectedOption === "active" && (
        <div className="grid  mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] cursor-pointer">
          {isFetching || isError || data === undefined ? (
            Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[272px]"
              >
                <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
              </div>
            ))
          ) : (
            <>
              {data.map((belief, idx) => (
                <OptionsItem key={idx} {...belief} />
              ))}
            </>
          )}
        </div>
      )}

      {selectedOption === "history" && (
        <OptionsHistory isEnabled={selectedOption === "history"} />
      )}

      {open === "create_option" && (
        <CreateOption onClose={() => setOpen(null)} onConfirm={setOpen} />
      )}

      {open === "confirm_option_put" && (
        <ConfirmOptionPut onClose={() => setOpen(null)} />
      )}

      {open === "confirm_option_call" && (
        <ConfirmOptionCall onClose={() => setOpen(null)} />
      )}
    </div>
  );
};

export default Options;
