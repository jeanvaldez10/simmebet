import Image from "next/image";
import { type TopHolder } from "@/services/marketService";
import { useState } from "react";

interface HoldersListProps {
  title: string;
  holders: TopHolder[];
  className?: string;
  currentUserAddress?: `0x${string}` | undefined;
}

function HolderItem({ holder, currentUserAddress }: { holder: TopHolder; currentUserAddress?: `0x${string}` | undefined }) {
  const isCurrentUser = currentUserAddress && holder.address.toLowerCase() === currentUserAddress.toLowerCase();
  const [imageError, setImageError] = useState(false);

  // Better avatar fallback logic
  const getAvatarSrc = () => {
    if (holder.avatar && holder.avatar !== 'null' && holder.avatar !== '' && !imageError) {
      return holder.avatar;
    }
    return "/images/profile.png";
  };
  
  const handleImageError = () => {
    console.log('Image failed to load for holder:', holder.address, 'avatar:', holder.avatar);
    setImageError(true);
  };

  const transformNameOrAddress = ({name, address}: {name?: string, address?: string}) => {
    if (name) {
      return name;
    }
    return address?.slice(0, 4) + "..." + address?.slice(-4) || 'Anonymous';
  };
  
  return (
    <div className={`py-4 flex items-center border-b border-[rgba(255,255,255,0.08)] ${isCurrentUser ? 'bg-[rgba(255,255,255,0.05)] rounded-lg px-3' : ''}`}>
      <div className="flex items-center gap-3 flex-1">
        <Image
          src={getAvatarSrc()}
          alt={`${holder?.username || holder?.address}'s avatar`}
          width={40}
          height={40}
          className="rounded-full h-10 w-10"
          onError={handleImageError}
          onLoad={() => setImageError(false)}
        />
        <div className="flex flex-col">
          <span className="text-[18px] font-medium text-[#F2F2FD]">
            {transformNameOrAddress({name: holder?.username, address: holder?.address})}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-blue-400 font-medium">You</span>
          )}
        </div>
      </div>
      <div className="text-[18px] text-[#F2F2FD] opacity-60 font-medium">
        {holder.totalBalance}
      </div>
    </div>
  );
}

export default function HoldersList({ title, holders, className, currentUserAddress }: HoldersListProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[20px] font-bold text-[#F2F2FD]">{title}</h3>
        <span className="text-[16px] text-[#F2F2FD] opacity-60">Shares</span>
      </div>
      <div>
        {holders.map((holder) => (
          <HolderItem key={holder.address} holder={holder} currentUserAddress={currentUserAddress} />
        ))}
      </div>
    </div>
  );
} 
