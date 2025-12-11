import { IPositionBelief } from "@/hooks/use-position-belief";
import MobileBeliefCard from "./mobile-belief-card";

const MobileBelief = ({
  isError,
  isLoading,
  data,
  onClaim,
  onUpdate,
  onUpdateLP,
  onView,
  isPublic,
}: {
  data: IPositionBelief[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onUpdate: (e: string) => void;
  onUpdateLP: (e: string) => void;
  onClaim: (marketAddress?: string) => void;
  onView: () => void;
  isPublic: boolean;
}) => {
  return (
    <div className="grid mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] sm:grid-cols-[repeat(auto-fit,_minmax(320px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(380px,_1fr))] [@media_(min-width:1100px)]:grid-cols-2 cursor-pointer">
      {isLoading || isError || data === undefined ? (
        Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[291px]"
          >
            <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
          </div>
        ))
      ) : (
        <>
          {data.map((belief, idx) => (
            <MobileBeliefCard
              onClaim={onClaim}
              onUpdate={onUpdate}
              onUpdateLP={onUpdateLP}
              onView={onView}
              belief={belief}
              idx={idx}
              key={idx}
              isPublic={isPublic}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MobileBelief;
