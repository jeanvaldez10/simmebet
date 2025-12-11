import { TextStyle } from "pixi.js";
import { ReactNode } from "react";

export interface ButtonSpriteProps {
    text?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: "orange" | "blue" | "red" | "green" | "white" | "overlay" | "black";
    disabled?: boolean;
    onClick?: () => void;
    fontSize?: number;
    zIndex?: number;
    blur?: number;
    radius?: number;
    isMobile?: boolean;
    subtitle?: string;
    subtitleStyle?: TextStyle;
    opacity?: number;
    children?: ReactNode;
    showShadow?: boolean;
}