import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

type CommentType = {
  id: string;
  username: string;
  handle: string;
  timestamp: string;
  content: string;
  isVerified?: boolean;
  likes: number;
  replies: CommentType[];
};

const CommentInput = () => {
  const [message, setMessage] = useState("");
  
  const handleSubmit = () => {
    // Handle comment submission
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-4 max-sm:flex-col max-sm:w-full">
      <div className="flex-1 relative w-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your message"
          className="w-full px-4 py-3 bg-[rgba(255,255,255,0.06)] text-[#F2F2FD] placeholder-[#878787] rounded-full outline-none border border-transparent focus:border-[rgba(255,255,255,0.16)]"
          aria-label="Add comment"
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!message.trim()}
        className="bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all max-sm:w-full"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
};

const CommentCard = ({ comment }: { comment: CommentType }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const handleReply = () => {
    setShowReplyInput(!showReplyInput);
  };

  return (
    <div className="flex gap-3.5 pb-4">
      <Image
        src="/images/avatar.png"
        alt={`${comment.username}'s avatar`}
        width={44}
        height={44}
        className="rounded-full h-11 w-11 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] leading-5 font-semibold text-[#F2F2FD] break-words">
              {comment.username}
            </span>
            {comment.isVerified && (
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
          <span className="text-[15px] leading-5 text-[#878787] break-all">{comment.handle}</span>
          <span className="text-[15px] leading-5 text-[#878787]">·</span>
          <span className="text-[15px] leading-5 text-[#878787]">
            {comment.timestamp}
          </span>
        </div>
        <div className="text-[15px] leading-5 text-[#F2F2FD] mt-1 break-words">
          <p>{comment.content}</p>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <button 
            onClick={handleReply}
            className="flex items-center gap-2 text-[#878787] hover:text-blue-400 transition-colors text-[13px] leading-4 p-2 -m-2"
            aria-label="Reply to comment"
          >
            Reply
          </button>
          <button className="flex items-center gap-2 text-[#878787] hover:text-pink-400 transition-colors p-2 -m-2">
            <Heart className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px] leading-4">{comment.likes}</span>
          </button>
        </div>
        
        {showReplyInput && (
          <div className="mt-3">
            <CommentInput />
          </div>
        )}
        
        {comment.replies.length > 0 && (
          <div className="mt-3 pl-4 max-sm:pl-2 border-l border-[rgba(255,255,255,0.06)]">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const MarketCommentsTab = () => {
  // Mock comments data
  const mockComments: CommentType[] = [
    {
      id: "1",
      username: "JaneDoe",
      handle: "@janedoe",
      timestamp: "2 days ago",
      content: "I think this is very likely to happen, considering the current political climate.",
      isVerified: true,
      likes: 12,
      replies: [
        {
          id: "1-1",
          username: "JohnSmith",
          handle: "@johnsmith",
          timestamp: "1 day ago",
          content: "I disagree, there are too many factors at play.",
          isVerified: false,
          likes: 3,
          replies: []
        }
      ]
    },
    {
      id: "2",
      username: "PoliticalAnalyst",
      handle: "@polanalyst",
      timestamp: "3 days ago",
      content: "Based on historical data, this seems unlikely within the first 90 days. New administrations typically take time to establish diplomatic channels.",
      isVerified: true,
      likes: 24,
      replies: []
    },
    {
      id: "3",
      username: "NewsJunkie",
      handle: "@newsjunkie",
      timestamp: "1 day ago",
      content: "Has anyone seen the latest polls on this? What's the current sentiment?",
      isVerified: false,
      likes: 5,
      replies: [
        {
          id: "3-1",
          username: "DataGuru",
          handle: "@dataguru",
          timestamp: "23h ago",
          content: "Latest polls show about 30% believe it will happen, 45% believe it won't, and 25% are undecided.",
          isVerified: true,
          likes: 8,
          replies: []
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <CommentInput />
      
      <div className="mt-4 space-y-5">
        {mockComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}; 
