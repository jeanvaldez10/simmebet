import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import ParentFlex from "./parent-flex";
import FlexCards10 from "./flex-card-10";
import FlexCards11 from "./flex-card-11";
import FlexCards13 from "./flex-card-13";
import FlexCards14 from "./flex-card-14";
import FlexCards9 from "./flex-card-9";

export interface BetData {
  question: string;
  amountWon: string;
  betAmount: string;
  side: string;
  belief?: string; // Made optional - only shown when accurately calculable
  user: {
    name: string;
    avatar?: string;
    level?: string;
  };
  timestamp?: string;
}

type ComponentType = {
  flex9: React.ReactElement;
  flex10: (betData?: BetData) => React.ReactElement;
  flex11: React.ReactElement;
  flex13: React.ReactElement;
  flex14: React.ReactElement;
};

const Component: ComponentType = {
  flex9: (
    <ParentFlex>
      <FlexCards9 />
    </ParentFlex>
  ),
  flex10: (betData?: BetData) => (
    <ParentFlex>
      <FlexCards10 betData={betData} />
    </ParentFlex>
  ),
  flex11: (
    <ParentFlex>
      <FlexCards11 />
    </ParentFlex>
  ),
  flex13: (
    <ParentFlex>
      <FlexCards13 />
    </ParentFlex>
  ),
  flex14: (
    <ParentFlex>
      <FlexCards14 />
    </ParentFlex>
  ),
};

export const captureComponentScreenshot = async ({
  theme,
  callback,
  isDownLoad = "",
  type = "flex9",
  betData,
}: {
  theme: string;
  callback: (link: string) => void;
  isDownLoad?: string;
  type: "flex9" | "flex10" | "flex11" | "flex13" | "flex14";
  betData?: BetData;
}) => {
  if (isDownLoad) {
    const name = new Date().toISOString();
    const link = document.createElement("a");
    link.href = isDownLoad;
    link.download = `${name}-component.jpg`;
    link.click();
  } else {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    
    // Pass betData to flex10 component
    if (type === "flex10") {
      root.render(Component[type](betData));
    } else {
      root.render(Component[type]);
    }

    await new Promise((res) => setTimeout(res, 800));

    const themes: Record<string, string> = {
      dark: "#000",
      light: "#fff",
      system: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#000"
        : "#fff",
    };
    const canvas = await html2canvas(container, {
      scale: window.devicePixelRatio || 1,
      useCORS: true,
      backgroundColor: themes[theme],
      allowTaint: false,
      imageTimeout: 15000,
      logging: false,
    });

    const imageUrl = canvas.toDataURL("image/jpeg", 0.2);
    callback(imageUrl);

    root.unmount();
    container.remove();
  }
};
