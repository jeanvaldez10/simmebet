import { useState, useEffect } from "react";

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
      ? "mobile"
      : "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}
