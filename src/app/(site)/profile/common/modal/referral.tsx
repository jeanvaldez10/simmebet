"use client";

import React, { useState } from "react";
import { Copy, Info } from "lucide-react";
import CommonModal from "@/components/modals";
import Button from "@/components/Button";
import { useToast } from "@/components/common/ToastContext";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthProvider";
import ReferralShareModal from "./referral-share";
import { CustomTooltip } from "@/components/shared/custom-tooltip";
import { useUserPoints } from "@/hooks/useUserPoints";

type ReferralModalProps = {
  onClose: () => void;
};

const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const { dbUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"referral" | "summary">("referral");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Fetch real points data
  const { data: pointsData, isLoading: pointsLoading } = useUserPoints();

  // Referral code is the user's username
  const referralCode = dbUser?.username || "your-username";

  // Referral link format: callmybluff.io/referral/[username]
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://callmybluff.io'}/referral/${referralCode}`;

  // Real data from API
  const volumePoints = pointsData?.tradingPoints || 0;
  const userReferralPoints = pointsData?.referralPoints || 0;
  const totalPoints = pointsData?.totalPoints || 0;
  const referredFriends = pointsData?.referredFriends || 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    showToast({ message: "Referral code copied!" });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast({ message: "Referral link copied!" });
  };

  const handleInviteFriends = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
      <CommonModal 
        onClose={onClose} 
        className="md:max-w-[420px] w-full md:w-[95%] max-h-[90vh] overflow-y-auto"
      >
        <div className="relative z-10">
          {/* Tab Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("referral")}
              className={cn(
                "text-2xl font-semibold transition-colors",
                activeTab === "referral" ? "text-[#F2F2FD]" : "text-[#FFFFFF52]"
              )}
            >
              Referral
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={cn(
                "text-2xl font-semibold transition-colors",
                activeTab === "summary" ? "text-[#F2F2FD]" : "text-[#FFFFFF52]"
              )}
            >
              Summary
            </button>
          </div>

          {/* Total Points Display */}
          <div className="border border-[#FFFFFF29] rounded-[12px] p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#FFFFFFA3] text-base">Total Points</span>
              <CustomTooltip
                className="max-w-[320px] w-fit text-sm"
                align="center"
                name={
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold text-base">Points</h3>
                    
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-[#FFFFFFA3]">Your Volume Points</span>
                      <span className="text-white font-medium">{Math.round(volumePoints).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-[#FFFFFFA3]">Your Referral Points</span>
                      <span className="text-white font-medium">{Math.round(userReferralPoints).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-[#FFFFFF29] my-2" />
                    
                    <div className="space-y-2 text-[#FFFFFFA3]">
                      <p className="text-white font-medium">Earn points - win prizes</p>
                      <p>Total points are calculated based on personal volume + referral volume:</p>
                      
                      <p>
                        <span className="text-white font-semibold">Trading:</span> You receive{" "}
                        <span className="text-white font-semibold">1 point</span> per{" "}
                        <span className="text-white font-semibold">$1</span> of volume
                      </p>
                      <p>
                        <span className="text-white font-semibold">Referrals:</span> You receive{" "}
                        <span className="text-white font-semibold">10%</span> of your referrals&apos; volume as points
                      </p>
                      <p>
                        <span className="text-white font-semibold">Bonus:</span> Users who sign up with your code get{" "}
                        <span className="text-white font-semibold">10% boost</span> to their trading points!
                      </p>
                      
                      <p className="pt-2">
                        Collecting points earn you rewards such as cash-back, fee discounts, 
                        vanity cosmetics and account levels. So start trading and invite your friends!
                      </p>
                    </div>
                  </div>
                }
              >
                <Info className="w-4 h-4 text-[#FFFFFFA3] pointer hover:text-white" />
              </CustomTooltip>
            </div>
            <div className="text-center text-[#46FD84] text-[48px] font-bold leading-tight">
              {pointsLoading ? "..." : Math.round(totalPoints).toLocaleString()}
            </div>
          </div>

          {/* Referral Tab Content - Invite Now Section */}
          {activeTab === "referral" && (
            <div className="border border-[#FFFFFF29] rounded-[12px] p-4 mb-6">
              <h3 className="text-[#F2F2FD] text-xl font-semibold mb-4">
                Invite Now
              </h3>
              
              <p className="text-[#FFFFFFA3] text-sm mb-4">
                You receive <span className="text-[#46FD84] font-semibold">10%</span> of your referrals&apos;{" "}
                trading volume as points. They get a <span className="text-[#46FD84] font-semibold">10% boost</span> for using your code!
              </p>

              {/* Referral Code */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#FFFFFFA3] text-sm">Referral Code</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#F2F2FD] text-base font-medium">
                    {referralCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-[#FFFFFFA3] hover:text-[#F2F2FD] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#FFFFFFA3] text-sm">Referral Link</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#F2F2FD] text-sm font-medium truncate max-w-[180px]">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-[#FFFFFFA3] hover:text-[#F2F2FD] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invite Friends Button */}
              <Button
                variant="primary"
                className="w-full text-base font-semibold"
                onClick={handleInviteFriends}
              >
                Invite Friends
              </Button>
            </div>
          )}

          {/* Summary Tab Content - Summary of Invitations */}
          {activeTab === "summary" && (
            <div className="border border-[#FFFFFF29] rounded-[12px] p-4 mb-6">
              <h3 className="text-[#F2F2FD] text-xl font-semibold mb-4">
                Summary of Invitations
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#FFFFFFA3] text-sm">Referred Friends</span>
                  <span className="text-[#46FD84] text-base font-medium">
                    {referredFriends}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            className="w-full text-base font-semibold border border-[#FFFFFF29]"
            onClick={onClose}
          >
          Close
        </Button>
        </div>
      </CommonModal>

      {/* Referral Share Modal */}
      {isShareModalOpen && (
        <ReferralShareModal
          onClose={() => setIsShareModalOpen(false)}
          referralCode={referralCode}
          referralLink={referralLink}
        />
      )}
    </>
  );
};

export default ReferralModal;

