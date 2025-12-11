import React, { ReactNode } from "react";
import Image from "next/image";

const ParentFlex = ({ children }: { children: ReactNode }) => {
  return (
    <div
      style={{
        backgroundImage: 'url("./flex_background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "1500px",
        height: "1500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {children}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          justifyItems: "center",
          marginTop: "90px",
          width: "100%",
        }}
      >
        <Image
          alt="logo"
          src={"/flex_bluff_logo.png"}
          width={272}
          height={106}
          style={{
            width: "272px",
            height: "106px",
          }}
        />
        <p
          style={{
            marginTop: "30px",
            whiteSpace: "nowrap",
            fontSize: "32px",
            fontWeight: 400,
            color: "#FFFFFFA3",
          }}
        >
          Bet Placed 11:22:00 UTC via @Simmi on X
        </p>
      </div>
    </div>
  );
};

export default ParentFlex;

interface FlexUserProps {
  userData?: {
    name: string;
    avatar?: string;
    level?: string;
  };
}

export const FlexUser: React.FC<FlexUserProps> = ({ userData }) => {
  const user = userData || {
    name: "James_Baker",
    level: "88"
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        marginTop: "30px",
      }}
    >
      <div
        style={{
          backgroundColor: "#353835",
          borderRadius: "100%",
          width: "93px",
          height: "93px",
          marginTop: "4px",
        }}
      />
      <p
        style={{
          fontSize: "41px",
          fontWeight: 600,
          color: "#FFFFFF",
          marginTop: "-25px",
        }}
      >
        {user.name}
      </p>

      {user.level && (
        <div
          style={{
            backgroundColor: "#353835",
            borderRadius: "99px",
            fontSize: "30px",
            color: "#FFFFFF",
            fontWeight: 600,
            width: "79px",
            height: "46px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "14px",
          }}
        >
          <p
            style={{
              marginBottom: "27px",
            }}
          >
            {user.level}
          </p>
        </div>
      )}
    </div>
  );
};
