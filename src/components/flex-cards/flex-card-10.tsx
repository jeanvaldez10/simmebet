import React from "react";
import { FlexUser } from "./parent-flex";

interface FlexCards10Props {
  betData?: {
    question: string;
    amountWon: string;
    betAmount: string;
    side: string;
    belief?: string;
    user: {
      name: string;
      avatar?: string;
      level?: string;
    };
    timestamp?: string;
  };
}

const FlexCards10: React.FC<FlexCards10Props> = ({ betData }) => {
  // Default data if no betData provided
  const data = betData || {
    question: "Will Spain beat Germany on the EUFA finals this year?",
    amountWon: "$434,600.00",
    betAmount: "$800",
    side: "YES",
    belief: "80%",
    user: {
      name: "Michael_Scott",
      level: "88"
    },
    timestamp: "Bet Placed 11:22:00 UTC via @Simmi on X"
  };

  // Determine if the bet is profitable based on amountWon
  const isProfitable = data.amountWon.startsWith('+') || (!data.amountWon.startsWith('-') && parseFloat(data.amountWon.replace(/[$,]/g, '')) > 0);

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
            Sports
          </p>
          <p
            style={{
              lineHeight: "120%",
              letterSpacing: "-1.57px",
              fontSize: "50px",
              fontWeight: 600,
              color: "#FFFFFF",
              marginTop: "7px",
            }}
          >
            {data.question}
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
          Amount won
        </p>
        <h2
          className={isProfitable ? "text-[#01FABD]" : "text-[#FF5571]"}
          style={{
            textShadow: isProfitable 
              ? "0 0 54px rgba(0, 253, 205, 0.33)" 
              : "0 0 54px rgba(255, 85, 113, 0.33)",
            backgroundColor: "transparent",
            marginTop: "-40px",
            fontSize: "90px",
            fontWeight: 900,
          }}
        >
          {data.amountWon}
        </h2>
      </div>
      <div
        className="grid grid-cols-3 gap-3"
        style={{
          width: "55%",
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
            Bet
          </p>
          <p
            style={{
              fontWeight: 800,
              color: "#FFFFFF",
              textTransform: "uppercase",
              fontSize: "60px",
              marginTop: "-11px",
            }}
          >
            {data.betAmount}
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
            Side
          </p>
          <p
            style={{
              fontWeight: 800,
              color: "#FFFFFF",
              textTransform: "uppercase",
              fontSize: "60px",
              marginTop: "-11px",
            }}
          >
            {data.side}
          </p>
        </div>

        {data.belief && (
          <div>
            <p
              style={{
                fontSize: "40px",
                fontWeight: 600,
                color: "#FFFFFFA3",
              }}
            >
              Belief
            </p>
            <p
              style={{
                fontWeight: 800,
                color: "#FFFFFF",
                textTransform: "uppercase",
                fontSize: "60px",
                marginTop: "-11px",
              }}
            >
              {data.belief}
            </p>
          </div>
        )}
      </div>

      <FlexUser userData={data.user} />
    </div>
  );
};

export default FlexCards10;
