import React, { useState } from "react";
import Image from "next/image";
import { MessageCircle, Repeat2, Heart, Bookmark } from "lucide-react";
import NotFound from "@/components/shared/not-found";
import { useAuthContext } from "@/context/AuthProvider";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import ShareIcon from "@/components/shared/share-icon";

type TweetCardProps = {
  username: string;
  handle: string;
  timestamp: string;
  content: React.ReactNode;
  isVerified?: boolean;
  avatar?: string;
  stats?: {
    replies: number;
    retweets: number;
    likes: number;
  };
};

type MarketTweetTabProps = {
  tweets?: TweetCardProps[];
};

const TweetCard = ({
  username,
  handle,
  timestamp,
  content,
  isVerified = true,
  avatar = "/images/avatar.png",
  stats = { replies: 0, retweets: 0, likes: 0 },
}: TweetCardProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/market/`;

  return (
    <div className="bg-[#16171E52] backdrop-blur-sm flex gap-3.5 p-6 max-sm:p-4 rounded-[24px] border border-solid border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <Image
        src={avatar}
        alt={`${username}'s avatar`}
        width={44}
        height={44}
        className="rounded-full h-11 w-11 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] leading-5 font-semibold text-[#F2F2FD] break-words">
              {username}
            </span>
            {isVerified && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.50992 1.25L10.0399 2.77L12.0799 2.33L12.5199 4.37L14.4999 5.44L13.9999 7.55L15.0799 9.46L13.4799 10.87L13.4999 13L11.3699 12.98L9.95992 14.58L7.99992 13.5L6.03992 14.58L4.62992 12.98L2.49992 13L2.51992 10.87L0.919922 9.46L1.99992 7.55L1.49992 5.44L3.47992 4.37L3.91992 2.33L5.95992 2.77L7.48992 1.25H8.50992Z"
                  fill="#1D9BF0"
                />
                <path
                  d="M6.73324 9.22666L10.3466 5.61333L10.9466 6.21333L6.73324 10.4267L4.61324 8.30666L5.21324 7.70666L6.73324 9.22666Z"
                  fill="white"
                />
              </svg>
            )}
          </div>
          <span className="text-[15px] leading-5 text-[#878787] break-all">
            {handle}
          </span>
          <span className="text-[15px] leading-5 text-[#878787]">·</span>
          <span className="text-[15px] leading-5 text-[#878787]">
            {timestamp}
          </span>
        </div>
        <div className="text-[15px] leading-5 text-[#F2F2FD] mt-1 space-y-0.5 break-words">
          {content}
        </div>
        <div className="mt-4 flex items-center justify-between max-sm:gap-2 max-sm:flex-wrap">
          <button className="flex items-center gap-2 text-[#878787] hover:text-blue-400 group transition-colors p-2 -m-2">
            <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[13px] leading-4">{stats.replies}</span>
          </button>
          <button className="flex items-center gap-2 text-[#878787] hover:text-green-400 group transition-colors p-2 -m-2">
            <Repeat2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[13px] leading-4">{stats.retweets}</span>
          </button>
          <button className="flex items-center gap-2 text-[#878787] hover:text-pink-400 group transition-colors p-2 -m-2">
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[13px] leading-4">{stats.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-[#878787] hover:text-blue-400 group transition-colors p-2 -m-2">
            <Bookmark className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          <button
            className="flex items-center gap-2 text-[#878787] hover:text-blue-400 group transition-colors p-2 -m-2"
            onClick={handleShare}
            style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
          >
            <ShareIcon width="18" height="18" />
          </button>
        </div>
        {isShareModalOpen && (
          <ShareModal
            tweetUrl={encodeURIComponent(
              `Check out this prediction market on Simmi!\n\n${url}`
            )}
            url={url}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export const MarketTweetTab = ({ tweets = [] }: MarketTweetTabProps) => {
  const { dbUser } = useAuthContext();

  if (!dbUser) {
    return (
      <NotFound
        className="md:mt-[-5px] mt-[-3px] h-[289px]"
        imageURL="/lock.png"
        heading="Login to see posts"
        desc="You need to login with out X account to see this content."
        buttonText="Connect X"
      />
    );
  }

  if (!tweets || tweets.length === 0) {
    return (
      <NotFound
        className="md:mt-[-5px] mt-[-3px]"
        imageURL="/market_tweet.png"
        heading="There are no tweets yet"
        desc="Be the first one to tweet about this market"
        buttonText="Open X"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {tweets.map((tweet, index) => (
        <TweetCard key={index} {...tweet} />
      ))}
    </div>
  );
};
