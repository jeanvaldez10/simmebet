"use client";

import * as React from "react";
import { Button } from "@/components/ui/button-old";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  isBefore,
  isToday,
  addMinutes,
  format,
  setHours,
  setMinutes,
} from "date-fns";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calender";

const CustomTimePicker = ({
  value,
  onChange,
  selectedDate,
  label = "Time",
  disabled = false,
}: {
  value: string;
  onChange: (time: string) => void;
  selectedDate?: Date;
  label?: string;
  disabled?: boolean;
}) => {
  const [hours, minutes] = value.split(":").map(Number);

  const validateTime = (newHours: number, newMinutes: number) => {
    if (!selectedDate) return true;

    const now = new Date();
    const selectedDateTime = setMinutes(
      setHours(selectedDate, newHours),
      newMinutes
    );

    if (isToday(selectedDate)) {
      const minAllowed = addMinutes(now, 5);
      if (isBefore(selectedDateTime, minAllowed)) {
        toast.error("Time must be at least 5 minutes in the future.");
        return false;
      }
    }
    return true;
  };

  const adjustHours = (increment: boolean) => {
    const newHours = increment ? (hours + 1) % 24 : (hours - 1 + 24) % 24;

    if (validateTime(newHours, minutes)) {
      onChange(
        `${newHours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  const adjustMinutes = (increment: boolean) => {
    const newMinutes = increment ? (minutes + 1) % 60 : (minutes - 1 + 60) % 60;

    if (validateTime(hours, newMinutes)) {
      onChange(
        `${hours.toString().padStart(2, "0")}:${newMinutes
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-white flex items-center gap-1">
        <Clock className="w-4 h-4 text-white" />
        {label}
      </label>
      <div className="flex items-center gap-2 p-3 bg-[#2E3144] rounded-lg border border-[#373b52]">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={() => adjustHours(true)}
            disabled={disabled}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <div className="text-lg font-mono font-semibold min-w-[2ch] text-center">
            {hours.toString().padStart(2, "0")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={() => adjustHours(false)}
            disabled={disabled}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        <div className="text-lg font-mono font-semibold">:</div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-[#373b52]"
            onClick={() => adjustMinutes(true)}
            disabled={disabled}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <div className="text-lg font-mono font-semibold min-w-[2ch] text-center">
            {minutes.toString().padStart(2, "0")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-[#373b52]"
            onClick={() => adjustMinutes(false)}
            disabled={disabled}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DateTimePicker = ({
  onDateSelect,
  value,
}: {
  value?: {
    date: Date;
    time: string;
  } | null;
  onDateSelect: ({
    date,
    time,
  }: {
    date: Date | undefined;
    time: string;
  }) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value?.date || undefined
  );
  const [time, setTime] = React.useState(value?.time || "10:30");
  const currentYear = new Date().getFullYear();

  const validateDate = (selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isBefore(selectedDate, today)) {
      toast.error("Cannot select past dates.");
      return false;
    }
    return true;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !validateDate(selectedDate)) {
      return;
    }

    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      const selectedDateTime = setMinutes(
        setHours(selectedDate, hours),
        minutes
      );
      const minAllowed = addMinutes(now, 5);

      if (isBefore(selectedDateTime, minAllowed)) {
        const newTime = format(addMinutes(now, 5), "HH:mm");
        setTime(newTime);
      }
    }

    onDateSelect({
      date: selectedDate,
      time: format(new Date(`2000-01-01T${time}:00`), "hh:mm a"),
    });
    setDate(selectedDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
  };

  const formatSelectedDate = () => {
    if (!date) return "Select event date";
    return `${format(date, "MMM dd, yyyy")},`;
  };

  const formatSelectedTime = () => {
    if (!date) return "";
    return format(new Date(`2000-01-01T${time}:00`), "hh:mm a");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex flex-col gap-3 w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="w-full">
              <Button
                variant="outline"
                id="date-picker"
                className="hover:bg-[#2E3144]  text-white hover:text-white justify-between font-normal bg-[#2E3144] w-full px-8 py-6 rounded-[50px] border-none text-left"
              >
                <div className="flex items-center gap-1 font-normal">
                  <div className="text-sm">{formatSelectedDate()}</div>

                  {date && (
                    <div className="text-xs text-gray-400">
                      {formatSelectedTime()}
                    </div>
                  )}
                </div>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0 z-[999999] bg-[#2E3144] text-white border border-[#373b52]"
              align="start"
            >
              <div className="md:p-2 flex md:items-center items-start md:gap-2 gap-1 md:flex-row flex-col relative">
                <Calendar
                  required
                  mode="single"
                  fromYear={currentYear}
                  toYear={currentYear + 5}
                  selected={date}
                  captionLayout="dropdown"
                  disabled={{ before: new Date() }}
                  onSelect={handleDateSelect}
                  className="rounded-md md:border border-[#373b52]"
                />

                {date && (
                  <div className="flex items-end flex-col pl-2 ">
                    <div className="md:border border-[#373b52] rounded-md md:p-3 md:mb-0 mb-2">
                      <CustomTimePicker
                        value={time}
                        onChange={handleTimeChange}
                        selectedDate={date}
                        label="Time"
                      />
                    </div>
                    <button
                      className=" absolute bottom-2 right-2 bg-white text-black px-4 py-1 rounded-md tex-xs md:text-sm  font-semibold"
                      onClick={() => setOpen(false)}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

DateTimePicker.displayName = "DateTimePicker";

export default DateTimePicker;
