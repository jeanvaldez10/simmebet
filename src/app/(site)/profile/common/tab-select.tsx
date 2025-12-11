import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-old";

export function TabSelect({
  value,
  setValue,
  isPublic,
  isCreator = false,
}: {
  value: string;
  setValue: (e: string) => void;
  isPublic: boolean;
  isCreator?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(e) => setValue(e)}>
      <SelectTrigger className=" border-0 w-full !h-[46px] text-[#FFFFFFA3] bg-[#2E3144] py-3 px-5 rounded-[80px] text-sm font-semibold">
        <SelectValue placeholder="Select a Tab" />
      </SelectTrigger>
      <SelectContent className="bg-[#2E3144] backdrop-blur-sm text-white border-0">
        <SelectGroup>
          {!isCreator ? (
            <>
              <SelectItem value="Positions">Positions</SelectItem>
              <SelectItem value="Activity">Activity</SelectItem>
              <SelectItem value="Watchlist">Watchlist</SelectItem>
              <SelectItem value="Friends">Friends</SelectItem>
              {!isPublic && (
                <SelectItem value="Notifications">Notifications</SelectItem>
              )}
            </>
          ) : (
            <>
              <SelectItem value="Belief">Belief</SelectItem>
              <SelectItem value="Options">Options</SelectItem>
            </>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
