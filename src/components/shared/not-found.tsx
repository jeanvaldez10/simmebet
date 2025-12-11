import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const NotFound = ({
  imageURL,
  heading,
  desc,
  className,
  buttonClassName,
  buttonText = "View Markets",
  buttonHref = "/markets",
  isButtonShow = true,
}: {
  imageURL: string;
  heading: string;
  desc: string;
  className?: string;
  buttonText?: string;
  buttonClassName?: string;
  buttonHref?: string;
  isButtonShow?: boolean;
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden relative mt-4 bg-black backdrop-blur-sm w-full border border-dashed border-[#FFFFFF29] p-4 rounded-[16px] flex items-center justify-center h-[401px]",
        className
      )}
    >
      <div className=" relative z-10 flex items-center justify-center gap-3 flex-col">
        <Image src={imageURL} width={48} height={48} alt="not-found" />
        <div className=" flex items-center justify-center gap-1 flex-col">
          <h2 className=" text-2xl font-semibold text-center">{heading}</h2>
          <p className="text-[#FFFFFFA3] text-base  text-center">{desc}</p>
        </div>

        {isButtonShow && (
          <Link href={buttonHref}>
            <button
              className={cn(
                "bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-5 py-2 rounded-[80px] text-xs font-semibold text-[#FFFFFF] transition-colors",
                buttonClassName
              )}
              aria-label={buttonText}
            >
              {buttonText}
            </button>
          </Link>
        )}
      </div>

      <div
        className="w-[366px] h-[366px] blur-[80px] absolute top-[-23%]"
        style={{ background: "linear-gradient(#FFFFFF52 32%, black 0%)" }}
      />
    </div>
  );
};

export default NotFound;
