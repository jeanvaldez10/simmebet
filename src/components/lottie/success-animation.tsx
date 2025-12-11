import Lottie from "lottie-react";
import SuccessLottie from "../../../public/lottie/Success.json";
import PendingLottie from "../../../public/lottie/Pending.json";
import ErrorLottie from "../../../public/lottie/Error.json";

export const Success = () => {
  return (
    <Lottie
      animationData={SuccessLottie}
      className="!cursor-pointer"
      loop={false}
    />
  );
};

export const ErrorComp = () => {
  return (
    <Lottie
      animationData={ErrorLottie}
      loop={false}
      className="!cursor-pointer"
    />
  );
};

export const Pending = () => {
  return (
    <div className="relative inline-block">
      <div 
        className="absolute rounded-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/blackjack/assets/images/animationbevel.png')",
          width: 'calc(100% - 40px)',
          height: 'calc(100% - 44px)',
          left: '20px',
          top: '20px'
        }}
      />
      <div className="relative z-10 mt-[0px]">
        <Lottie animationData={PendingLottie} loop className="!cursor-pointer" />
      </div>
    </div>
  );
};
