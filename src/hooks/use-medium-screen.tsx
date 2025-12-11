import { useEffect, useState } from "react";

export function useIsMediumScreen() {
  const [isMedium, setIsMedium] = useState(
    typeof window !== "undefined"
      ? window.innerWidth >= 768 && window.innerWidth < 1341
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMedium(width >= 768 && width < 1345);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMedium;
}
