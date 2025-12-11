import Image from "next/image";

interface AIResultProps {
  viewer: boolean;
  curatorName?: string;
  curatorAvatar?: string;
  resolvedOption?: string;
  resolutionEvidence?: string | null;
}

const AIResult = ({ viewer, curatorName, curatorAvatar, resolvedOption, resolutionEvidence }: AIResultProps) => {
  if (!viewer) return null;

  return (
    <div className="flex flex-col bg-[#1A1A24] rounded-xl p-6 mb-8 w-full overflow-hidden">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-[120px] h-[120px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
          <div className="text-white text-4xl">
            <Image
              src={curatorAvatar || "/images/avatar.png"}
              alt="Market Curator"
              width={140}
              height={140}
              className="rounded-xl"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <p className="text-gray-400 text-sm">Market Curator</p>
          {curatorName === "Simmi" ? (
            <a
              href="https://x.com/Simmi_IO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Visit Simmi's profile"
            >
              <h2 className="text-white text-2xl font-semibold mt-1">
                {curatorName}
              </h2>
            </a>
          ) : (
            <h2 className="text-white text-2xl font-semibold mt-1">
              {curatorName || "Anonymous"}
            </h2>
          )}
          <div className="flex items-center mt-2 gap-2">
            <div className="bg-[#2A2A3A] p-1 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="4" fill="#2A2A3A" />
                <path
                  d="M12 6L7 12H11V18L16 12H12V6Z"
                  fill="#888"
                  stroke="#888"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-gray-400">Provided Outcome</span>
            <div className="flex-1"></div>
            <div className="bg-white text-black font-small py-2 px-4 rounded-full flex items-center gap-2">
              {resolvedOption || "Pending"}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-2 pt-4">
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-sm">
            This market was resolved with the outcome: <span className="text-white font-semibold">{resolvedOption || "Pending"}</span>
          </p>
          <p className="text-gray-400 text-sm">
            The outcome was determined by the market curator based on real-world events and verified sources.
          </p>
          
          {resolutionEvidence && (
            <div className="mt-4">
              <h3 className="text-white font-semibold mb-2 text-sm">Resolution Evidence:</h3>
              <style jsx global>{`
                .resolution-evidence ul {
                  list-style-type: disc !important;
                  padding-left: 1.5rem !important;
                  margin: 0.5rem 0 !important;
                }
                .resolution-evidence ol {
                  list-style-type: decimal !important;
                  padding-left: 1.5rem !important;
                  margin: 0.5rem 0 !important;
                }
                .resolution-evidence li {
                  display: list-item !important;
                }
              `}</style>
              <div 
                className="resolution-evidence text-gray-300 text-sm prose prose-sm prose-invert max-w-none prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300 prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-5 prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-gray-300 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: resolutionEvidence }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResult;
