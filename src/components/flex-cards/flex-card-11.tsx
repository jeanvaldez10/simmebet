import React from "react";
import { FlexUser } from "./parent-flex";

const FlexCards11 = () => {
  return (
    <div
      className="bg-[#16171E52] rounded-[32px] backdrop-blur-md flex flex-col py-[56px] px-[64px]"
      style={{
        width: "1251px",
        height: "840px",
        border: "solid 1px",
        borderColor: "#FFFFFF29",
        gap: "3rem",
        marginTop: "265px",
      }}
    >
      <div className=" flex gap-5 items-start">
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
              color: "#FFFFFFA3",
              textTransform: "uppercase",
            }}
          >
            LP POSITION
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
            $28,372.00 Volume
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
          marginTop: "-6px",
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
              whiteSpace: "nowrap",
            }}
          >
            Belief
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
            80%
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "40px",
              fontWeight: 600,
              color: "#FFFFFFA3",
              whiteSpace: "nowrap",
            }}
          >
            Time staked
          </p>
          <p
            style={{
              marginTop: "-11px",
              fontWeight: 800,
              fontSize: "60px",
              color: "#FFFFFF",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            30 days
          </p>
        </div>
      </div>

      <FlexUser />
    </div>
  );
};

export default FlexCards11;
