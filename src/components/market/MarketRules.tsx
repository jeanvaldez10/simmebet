import Image from "next/image";
// import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface MarketRulesProps {
  rules: string[];
  creatorName: string;
  creatorAvatar: string;
}

export function MarketRules({ rules, creatorName, creatorAvatar }: MarketRulesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // const router = useRouter();

  return (
    <div className="flex flex-col gap-2.5 bg-[#16171E52] backdrop-blur-sm border border-[#FFFFFF29] rounded-[16px] p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold text-[#F2F2FD]">Details</div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 pointer"
        >
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <path
              d="M16.6004 12.8267L11.1671 7.39336C10.5254 6.75169 9.47539 6.75169 8.83372 7.39336L3.40039 12.8267"
              stroke="white"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.32"
            />
          </svg>
        </button>
      </div>
      {isExpanded && (
        <div>
          <div className="mb-4">
            <h2 className="text-[#FFFFFF] font-semibold mb-2 text-sm">
              Market Curator
            </h2>

            <div className="flex items-center justify-between">
              {creatorName === "Simmi" ? (
                <a
                  href="https://x.com/Simmi_IO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Visit Simmi's profile"
                >
                  <Image
                    src={creatorAvatar}
                    alt="Creator Avatar"
                    className="w-6 h-6 rounded-full"
                    width={24}
                    height={24}
                  />
                  <span className="text-[#FFFFFF] text-sm font-normal">
                    {creatorName}
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={creatorAvatar}
                    alt="Creator Avatar"
                    className="w-6 h-6 rounded-full"
                    width={24}
                    height={24}
                  />
                  <span className="text-[#FFFFFF] text-sm font-normal">
                    {creatorName}
                  </span>
                </div>
              )}

              {/* <button
                className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
                aria-label="View Profile"
                tabIndex={0}
                onClick={() => router.push(`/user/john`)}
              >
                View Profile
              </button> */}
            </div>

            <div className="mt-3">
              <h2 className="text-[#FFFFFF] font-semibold mb-2 text-sm">
                Oracles:
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center border-1 cursor-pointer border-[#FFFFFF52] pl-[6px] pr-3 gap-1 py-1 rounded-xl text-xs w-fit font-semibold text-[#FFFFFF] transition-colors">
                  <Image
                    src="/images/oracle1.png"
                    alt="Creator Avatar"
                    className="w-5 h-5 rounded-full"
                    width={20}
                    height={20}
                  />
                  Defi Oracle
                </div>

                <div className="w-fit flex items-center border-1 cursor-pointer border-[#FFFFFF52] pl-[6px] pr-3 gap-1 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors">
                  <Image
                    src="/images/oracle2.png"
                    alt="Creator Avatar"
                    className="w-5 h-5 rounded-full"
                    width={20}
                    height={20}
                  />
                  News Oracle
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-[#FFFFFF] font-semibold mb-2 text-sm">
              Rules:
            </h2>
            <div className="text-sm text-[rgba(255,255,255,0.64)] leading-6 flex flex-col gap-4">
              {rules.map((rule, index) => (
                <p key={index}>{rule}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
