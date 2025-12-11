import { ReactNode } from "react";
export const HeadingComp = ({
  heading,
  lastUpdated,
}: {
  heading: string;
  lastUpdated: string;
}) => {
  return (
    <div className="bg-[#16171E] border border-[#FFFFFF29] rounded-[16px] p-4 md:p-8">
      <h1 className="text-4xl md:text-[56px] font-semibold md:mt-0 mt-10">
        {heading}
      </h1>

      <div className=" flex items-center gap-2 mt-2">
        <span className="border border-[#FFFFFF29] py-1 px-3 rounded-[80px] text-[#FFFFFFA3] text-sm font-medium">
          Last Updated
        </span>
        <span className="text-[#FFFFFFA3] text-sm font-medium">
          {lastUpdated}
        </span>
      </div>
    </div>
  );
};

export const PointContent = ({
  title,
  desc,
  descChildren,
}: {
  title: string;
  desc: string;
  descChildren?: ReactNode;
}) => {
  return (
    <div className="border border-[#FFFFFF29] rounded-[16px] p-4 md:p-8 bg-[#16171E52] backdrop-blur-md">
      <h1 className="text-[#FFFFFF] text-[28px] font-semibold">{title}</h1>

      {descChildren ? (
        descChildren
      ) : (
        <p className="text-[#FFFFFFA3] text-base font-normal mt-1">{desc}</p>
      )}
    </div>
  );
};
