import { AiOutlineMessage } from "react-icons/ai";
import { MarketTweetTab } from "@/components/market/tabs/MarketTweetTab";
import EmptyState from "@/components/common/EmptyState";
import { TweetsTabProps } from "@/types/profile";

const TweetsTab = ({ tweets }: TweetsTabProps) => {
  if (tweets.length === 0) {
    return (
      <EmptyState
        icon={<AiOutlineMessage className="w-8 h-8 text-gray-400" />}
        title="No tweets to display"
        description="Connect your X account to display your tweets."
        actionLabel="Connect X"
        actionLink="/settings"
      />
    );
  }

  return <MarketTweetTab />;
};

export default TweetsTab; 