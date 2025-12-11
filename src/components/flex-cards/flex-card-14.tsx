import React from "react";
import Image from "next/image";
import { FlexUser } from "./parent-flex";

const FlexCards13 = () => {
  return (
    <div className="relative">
      <div className="absolute top-[125px] right-[-125px] z-0">
        <Image alt="bg" src="/flex_big_up.png" height={700} width={700} />
      </div>

      <div
        className="bg-[#16171E52] rounded-[32px] backdrop-blur-[40px] flex flex-col py-[56px] px-[64px] relative"
        style={{
          width: "1251px",
          height: "840px",
          border: "solid 1px",
          borderColor: "#FFFFFF29",
          gap: "3rem",
          marginTop: "265px",
        }}
      >
        <div className="absolute top-[-60px] right-[200px] z-30">
          <Image alt="down" src="/flex_up.png" height={120} width={120} />
        </div>

        <div className="absolute top-[400px] right-[-60px] z-30">
          <Image alt="down" src="/flex_up.png" height={120} width={120} />
        </div>

        <div className="flex gap-5 items-start">
          <div
            style={{
              flexShrink: 0,
              backgroundColor: "#353835",
              height: "190px",
              width: "190px",
              borderRadius: "16px",
            }}
          />
          <div>
            <p
              style={{
                lineHeight: "110.00000000000001%",
                letterSpacing: "-2%",
                marginTop: "-18px",
                fontSize: "40px",
                fontWeight: 600,
                color: "#01EFB4",
                textTransform: "uppercase",
              }}
            >
              Long
            </p>
            <h2
              style={{
                lineHeight: "120%",
                letterSpacing: "0%",
                marginTop: "-30px",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "90px",
                color: "#FFFFFF",
              }}
            >
              ETHEREUM
            </h2>
            <p
              style={{
                lineHeight: "110.00000000000001%",
                letterSpacing: "-2%",
                marginTop: "12px",
                fontSize: "40px",
                fontWeight: 600,
                color: "#FFFFFFA3",
              }}
            >
              Expired Jun 30, 2025
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "-18px",
          }}
        >
          <p
            style={{
              fontSize: "40px",
              fontWeight: 600,
              color: "#FFFFFFA3",
            }}
          >
            Profit exercised
          </p>
          <h2
            className="text-[#01FABD]"
            style={{
              textShadow: "0 0 54px rgba(0, 253, 205, 0.33)",
              backgroundColor: "transparent",
              marginTop: "-40px",
              fontSize: "90px",
              fontWeight: 900,
            }}
          >
            $434,600.00
          </h2>
        </div>

        <div
          className="grid grid-cols-3 gap-3"
          style={{
            width: "65%",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "40px",
                fontWeight: 600,
                color: "#FFFFFFA3",
              }}
            >
              Staked
            </p>
            <p
              style={{
                marginTop: "-11px",
                fontWeight: 800,
                fontSize: "60px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              $800
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "40px",
                fontWeight: 600,
                color: "#FFFFFFA3",
              }}
            >
              Options
            </p>
            <p
              style={{
                marginTop: "-11px",
                fontWeight: 800,
                fontSize: "60px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              10
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "40px",
                whiteSpace: "nowrap",
                fontWeight: 600,
                color: "#FFFFFFA3",
              }}
            >
              Strike Price
            </p>
            <p
              style={{
                marginTop: "-11px",
                fontWeight: 800,
                fontSize: "60px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              $3000
            </p>
          </div>
        </div>

        <FlexUser />
      </div>
    </div>
  );
};

export default FlexCards13;
