import Image from "next/image";
import { AiOutlineTeam } from "react-icons/ai";
import EmptyState from "@/components/common/EmptyState";
import { FriendsTabProps } from "@/types/profile";

const FriendsTab = ({ friends }: FriendsTabProps) => {
  if (friends.length === 0) {
    return (
      <EmptyState
        icon={<AiOutlineTeam className="w-8 h-8 text-gray-400" />}
        title="No friends to display"
        description="Connect with other users to see their activity and share predictions."
        actionLabel="Find Friends"
        actionLink="/community"
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
            <th className="pb-3 font-medium">User</th>
            <th className="pb-3 font-medium">Profit/Loss</th>
            <th className="pb-3 font-medium">Volume Traded</th>
            <th className="pb-3 font-medium text-right">Market Traded</th>
          </tr>
        </thead>
        <tbody>
          {friends.map((friend) => (
            <tr key={friend.id} className="border-b border-gray-800/50">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={friend.avatar}
                      alt={friend.username}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="font-medium">{friend.username}</div>
                </div>
              </td>
              <td className="py-4">{friend.profileLoss}</td>
              <td className="py-4">{friend.volumeTraded}</td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2">
                  <span>{friend.marketTraded}</span>
                  {/* <button
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
                    aria-label="Remove friend"
                    tabIndex={0}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L9 9M9 1L1 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FriendsTab;
