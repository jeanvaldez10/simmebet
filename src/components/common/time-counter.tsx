import React, { useEffect, useState } from "react";

const TimeCounter = ({ dateTime }: { dateTime: string }) => {
  const [hoursLeft, setHoursLeft] = useState<string>("");

  useEffect(() => {
    const updateCounter = () => {
      const target = new Date(dateTime).getTime();
      const now = Date.now();
      const diffInMs = target - now;

      if (diffInMs <= 0) {
        setHoursLeft("0 hours");
        return;
      }

      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutesLeft = Math.floor(
        (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      setHoursLeft(`${diffInHours}h ${minutesLeft}m`);
    };

    updateCounter();
    const interval = setInterval(updateCounter, 60 * 1000); // update every minute

    return () => clearInterval(interval);
  }, [dateTime]);

  return (
    <div className="flex items-center text-sm gap-1">
      <span className="text-[#FFFFFFA3]">Time left:</span>
      <span className="text-[#fff]">{hoursLeft}</span>
    </div>
  );
};

export default TimeCounter;
