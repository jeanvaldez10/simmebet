import Image from "next/image";
import { toast } from "react-hot-toast";
import React, { useState } from "react";
import { formatWalletAddress } from "@/utils/format";
import { useAuthContext } from "@/context/AuthProvider";
import { Edit3, UserRoundMinus, UserRoundPlus } from "lucide-react";
import Button from "@/components/Button";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ShareModal from "./modal/share";
import ReferralModal from "./modal/referral";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ShareIcon from "@/components/shared/share-icon";
interface ProfileData {
  username: string;
  walletId: string;
  joinDate: Date | undefined;
  avatar?: string | null;
}

interface ProfileHeaderProps {
  isPublic: boolean;
  profileData: ProfileData;
  id: string | undefined;
  isCreator?: boolean;
}

type FollowState = "follow" | "following" | "unfollow";

const ProfileHeader = ({
  profileData,
  isPublic,
  isCreator = false,
}: ProfileHeaderProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followState, setFollowState] = useState<FollowState>("follow");
  const { user, dbUser } = useAuthContext();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleFollowClick = () => {
    if (followState === "follow") {
      setFollowState("following");
    } else if (followState === "following") {
      setFollowState("unfollow");
    } else {
      setFollowState("follow");
    }
  };

  // Get user data from auth context
  const username =
    profileData?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    dbUser?.username;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/user/${username}`;

  const formattedDate =
    dbUser?.createdAt && !isNaN(new Date(dbUser.createdAt).getTime())
      ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Mar 2025";

  function formatUsername(username: string | null | undefined): string | null {
    if (!username) return null;
    return username.length <= 15 ? username : username.slice(0, 15) + "...";
  }

  return (
    <React.Fragment>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative pShare">
        <div className="flex items-start sm:items-end gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
          <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={profileData?.avatar || "/images/dummy.png"}
              alt="Profile picture"
              width={120}
              height={120}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 mb-1 flex-wrap">
              <h1
                className={cn(
                  "font-semibold text-[#F2F2FD]",
                  username && username?.length > 12
                    ? "text-[28px]"
                    : "text-[32px]"
                )}
              >
                {formatUsername(username)}
              </h1>
            </div>

            <div
              className={cn(
                " grid text-[#FFFFFFA3] text-sm gap-2 w-fit items-center",
                "grid-cols-[1fr]"
              )}
            >
              {/* Creator tag commented out
              {!isCreator && (
                <div className="bg-[#05B9FC29] border w-fit border-[#05B9FC52] py-1 pl-[10px] pr-2 rounded-[80px] flex items-center gap-1">
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.5002 3.97168C14.2683 3.97168 15.964 4.67406 17.2142 5.9243C18.4645 7.17454 19.1668 8.87024 19.1668 10.6383C19.1668 12.4065 18.4645 14.1021 17.2142 15.3524C15.964 16.6026 14.2683 17.305 12.5002 17.305C10.7321 17.305 9.03636 16.6026 7.78612 15.3524C6.53587 14.1021 5.8335 12.4065 5.8335 10.6383C5.8335 8.87024 6.53587 7.17454 7.78612 5.9243C9.03636 4.67406 10.7321 3.97168 12.5002 3.97168ZM12.5002 15.6383C13.8262 15.6383 15.098 15.1116 16.0357 14.1739C16.9734 13.2362 17.5002 11.9644 17.5002 10.6383C17.5002 9.31226 16.9734 8.04049 16.0357 7.10281C15.098 6.16513 13.8262 5.63835 12.5002 5.63835C11.1741 5.63835 9.90231 6.16513 8.96463 7.10281C8.02695 8.04049 7.50016 9.31226 7.50016 10.6383C7.50016 11.9644 8.02695 13.2362 8.96463 14.1739C9.90231 15.1116 11.1741 15.6383 12.5002 15.6383ZM2.50016 10.6383C2.50012 11.6716 2.82075 12.6795 3.4178 13.5228C4.01485 14.3661 4.8589 15.0034 5.8335 15.3467V17.0883C2.9585 16.3467 0.833496 13.7467 0.833496 10.6383C0.833496 7.53001 2.9585 4.93001 5.8335 4.18835V5.93001C3.89183 6.61335 2.50016 8.46335 2.50016 10.6383Z"
                      fill="#05B9FC"
                    />
                    <rect
                      x="11.6665"
                      y="8.13867"
                      width="1.66667"
                      height="5"
                      fill="#05B9FC"
                    />
                    <rect
                      x="15"
                      y="9.80566"
                      width="1.66667"
                      height="5"
                      transform="rotate(90 15 9.80566)"
                      fill="#05B9FC"
                    />
                  </svg>

                  <span className="text-[#05B9FC] text-sm font-medium">
                    Creator
                  </span>
                </div>
              )}
              */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className=" whitespace-nowrap">Joined {formattedDate}</span>

                {dbUser?.walletAddress && (
                  <span
                    className="border border-[#FFFFFF29] px-2.5 py-1 rounded-full pointer w-fit"
                    onClick={() => {
                      navigator.clipboard.writeText(dbUser?.walletAddress || "");
                      toast.success("Wallet address copied to clipboard!");
                      const el = event?.target as HTMLElement;
                      el.classList.toggle("text-green-500");
                      setTimeout(
                        () => el.classList.toggle("text-green-500"),
                        200
                      );
                    }}
                  >
                    {formatWalletAddress(dbUser?.walletAddress || "")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isCreator ? (
          <div className="flex gap-3 items-center self-start sm:self-end mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
            <div
              className="border border-[#FFFFFF52] pointer rounded-full  w-9 h-9 flex items-center justify-center"
              onClick={handleShare}
              role="button"
              style={{ "--icon-stroke": "white" } as React.CSSProperties}
            >
              <ShareIcon className="ml-[0.5px] mt-[-2px]" />
            </div>

            {dbUser?.twitterId && dbUser?.xAccount && (
              <a
                href={`https://twitter.com/${dbUser.xAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer"
              >
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={34}
                  height={34}
                  className="border border-[#FFFFFF52] rounded-full p-2 w-9 h-9"
                />
              </a>
            )}

            {isShareModalOpen && (
              <ShareModal
                tweetUrl={encodeURIComponent(
                  `Check out this prediction market on Bluff!\n\n${url}`
                )}
                url={url}
                onClose={() => setIsShareModalOpen(false)}
              />
            )}

            {!isPublic ? (
              <>
                <div
                  role="button"
                  onClick={handleOpenEditModal}
                  className="border border-[#FFFFFF52] pointer rounded-full p-2 w-9 h-9 flex items-center justify-center"
                >
                  <Edit3 className="!cursor-pointer" />
                </div>

                <button
                  onClick={() => setIsReferralModalOpen(true)}
                  className="border border-[#FFFFFF52] pointer rounded-full px-6 py-2 text-[#FFFFFF] text-sm hover:bg-white/5 transition-colors"
                >
                  Referral
                </button>
              </>
            ) : (
              <div
                onClick={handleFollowClick}
                className="border border-[#FFFFFF52] rounded-full p-2 w-9 h-9 flex items-center justify-center pointer"
              >
                {followState === "unfollow" ? (
                  <UserRoundMinus className="!cursor-pointer" />
                ) : (
                  <UserRoundPlus className="!cursor-pointer" />
                )}
              </div>
            )}

            {/* <Button
              variant="ghost"
              onClick={() => router.push("/creator")}
              className="text-xs lg:text-sm h-[34p] px-4 !py-[7px] lg:!px-8 border border-[#FFFFFF52] text-[#FFFFFF]  hidden md:block"
            >
              View Creator Hub
            </Button> */}
          </div>
        ) : (
          <div className="flex gap-3 items-center self-start sm:self-end mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
            {dbUser?.twitterId && dbUser?.xAccount && (
              <a
                href={`https://twitter.com/${dbUser.xAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer"
              >
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={34}
                  height={34}
                  className="border border-[#FFFFFF52] rounded-full p-2 w-9 h-9"
                />
              </a>
            )}

            <Button
              variant="ghost"
              onClick={() => router.push("/profile")}
              className="h-[36p] !py-2 !px-8 border border-[#FFFFFF52] text-[#FFFFFF] text-sm"
            >
              View Profile
            </Button>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />

      {isReferralModalOpen && (
        <ReferralModal onClose={() => setIsReferralModalOpen(false)} />
      )}
    </React.Fragment>
  );
};

export default ProfileHeader;
