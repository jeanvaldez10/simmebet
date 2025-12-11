import React from "react";
import { FlexUser } from "./parent-flex";

const FlexCards9 = () => {
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
      <div
        className="grid grid-cols-3 gap-3"
        style={{
          width: "50%",
          marginTop: "-5px",
        }}
      >
        <div>
          <p
            className="text-[#FFFFFFA3]"
            style={{
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            Level
          </p>
          <p
            className="text-[#FFFFFF] uppercase font-bold text-6xl"
            style={{ fontWeight: 800 }}
          >
            88
          </p>
        </div>
        <div>
          <p
            className="text-[#FFFFFFA3]"
            style={{
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            Tier
          </p>
          <p
            className="text-[#FFFFFF] uppercase font-bold text-6xl"
            style={{ fontWeight: 800 }}
          >
            Elite
          </p>
        </div>
      </div>
      <div
        className="grid grid-cols-3 gap-3"
        style={{
          width: "50%",
          marginTop: "5px",
        }}
      >
        <div>
          <p
            className="text-[#FFFFFFA3]"
            style={{
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            Bets
          </p>
          <p
            className="text-[#FFFFFF] uppercase font-bold text-6xl"
            style={{ fontWeight: 800 }}
          >
            300
          </p>
        </div>
        <div>
          <p
            className="text-[#FFFFFFA3]"
            style={{
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            Options
          </p>
          <p
            className="text-[#FFFFFF] uppercase font-bold text-6xl"
            style={{ fontWeight: 800 }}
          >
            50
          </p>
        </div>

        <div>
          <p
            className="text-[#FFFFFFA3]"
            style={{
              fontSize: "40px",
              fontWeight: 600,
            }}
          >
            Win ratio
          </p>
          <p
            className="text-[#03DDA8] uppercase font-bold text-6xl"
            style={{ fontWeight: 800 }}
          >
            65%
          </p>
        </div>
      </div>
      <div
        style={{
          gap: "36px",
          display: "flex",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <p
          style={{
            fontSize: "36px",
            fontWeight: 600,
            color: "#FFFFFFA3",
          }}
        >
          Lifetime PNL
        </p>
        <p
          style={{
            fontSize: "36px",
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          $28,372.00 Volume
        </p>
      </div>

      <h2
        className="text-[#01FABD]"
        style={{
          textShadow: "0 0 54px rgba(0, 253, 205, 0.33)",
          backgroundColor: "transparent",
          fontSize: "120px",
          fontWeight: 900,
          marginTop: "-100px",
        }}
      >
        $434,600.00
      </h2>
      <FlexUser />
    </div>
  );
};

export default FlexCards9;
