'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import RedoIcon from '@/components/icons/RedoIcon';
import EmojiIconPlaceholder from '@/components/icons/EmojiIconPlaceholder';
import MessageIcon from '@/components/icons/MessageIcon';

interface Message {
  id: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  topOffset: number;
}

export function ChatSidebar({ isOpen, onClose, topOffset }: ChatSidebarProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'Grandpa',
      content: 'Suk my dc brh',
      timestamp: new Date('2024-12-09T17:08:00'),
    },
    {
      id: '2',
      username: 'Simmi',
      content: 'fuck youuuu!!!',
      timestamp: new Date('2024-12-09T17:09:00'),
    },
    {
      id: '3',
      username: 'Grandpa',
      content: 'Stimulation now.',
      timestamp: new Date('2024-12-09T17:09:00'),
    },
    {
      id: '4',
      username: 'Jesse',
      content: 'Guys I think we all need to chill this is getting out of hand very quickly. Theres no need to be throwing insults. We are all just trying to play some games and have fun',
      timestamp: new Date('2024-12-09T17:09:00'),
    },
    {
      id: '5',
      username: 'Grandpa',
      content: 'Man shut the hell up',
      timestamp: new Date('2024-12-09T17:09:00'),
    },
    {
      id: '6',
      username: 'Simmi',
      content: 'fuck it down more',
      timestamp: new Date('2024-12-09T17:09:00'),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      username: 'You',
      content: message,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      {/* Overlay for desktop only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 w-full md:w-[320px] border-r border-[#FFFFFF29] z-[100] flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          top: `${topOffset}px`,
          height: `calc(100vh - ${topOffset}px)`,
          background: 'rgba(22, 23, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-[#FFFFFF29]">
          {/* Mobile: Down Chevron */}
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-2 md:hidden"
            aria-label="Close chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg md:text-2xl">Global Chat</span>
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#FFFFFF29]"
                style={{
                  background: 'rgba(22, 23, 30, 0.32)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full bg-[#36FD68] animate-pulse" 
                  style={{
                    boxShadow: '0 0 8px #36FD68, 0 0 12px #36FD68',
                  }}
                />
                <span className="text-white text-xs font-medium">237</span>
              </div>
            </button>
            
            {/* Game Chat tab - visible on mobile */}
            <button className="flex items-center gap-2 md:hidden opacity-50">
              <span className="text-white/50 font-semibold text-lg">Game Chat</span>
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#FFFFFF29]"
                style={{
                  background: 'rgba(22, 23, 30, 0.32)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-[#36FD68]" />
                <span className="text-white text-xs font-medium">1</span>
              </div>
            </button>
          </div>

          {/* Desktop: Back Chevron */}
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-2 hidden md:block"
            aria-label="Close chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Mobile: X Close Button */}
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-2 md:hidden"
            aria-label="Close chat"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, index) => {
            // Check if this message is a reply (for demo purposes, messages at index 1, 4, 5 are replies)
            const isReply = index === 1 || index === 4 || index === 5;
            const replyToIndex = isReply ? index - 1 : null;
            const replyToMsg = replyToIndex !== null ? messages[replyToIndex] : null;
            const isCurrentUser = msg.username === 'You' || msg.username === 'Grandpa';

            return (
              <div key={msg.id} className="group relative">
                {/* Reply Thread Preview */}
                {isReply && replyToMsg && (
                  <div className="flex items-center gap-2 mb-2 ml-4 opacity-60">
                    <RedoIcon />
                    <div className="w-6 h-6 rounded-full bg-[#3C4055] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {replyToMsg.avatar ? (
                        <Image
                          src={replyToMsg.avatar}
                          alt={replyToMsg.username}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs">
                          {replyToMsg.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-white/60 text-xs truncate">
                      {replyToMsg.content.length > 50 
                        ? replyToMsg.content.substring(0, 50) + '...' 
                        : replyToMsg.content}
                    </span>
                  </div>
                )}

                {/* Message Card */}
                <div 
                  className="rounded-2xl p-3 relative"
                  style={{
                    backgroundColor: isCurrentUser ? '#2E3144' : 'transparent',
                    border: isCurrentUser ? 'none' : '1px solid rgba(255, 255, 255, 0.16)',
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#3C4055] flex items-center justify-center overflow-hidden">
                        {msg.avatar ? (
                          <Image
                            src={msg.avatar}
                            alt={msg.username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-medium">
                            {msg.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">
                          {msg.username}
                        </span>
                        {msg.username === 'Simmi' && (
                          <button className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-transparent border border-white/20 text-white hover:bg-white/10 transition-colors">
                            Join
                          </button>
                        )}
                      </div>
                      <p className="text-white/80 text-sm break-words leading-snug">
                        {msg.content}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[#FFFFFF52] text-xs flex-shrink-0 mt-0.5">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Reply Icon - Bottom Right on Hover */}
                  <button 
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
                    aria-label="Reply"
                  >
                    <RedoIcon />
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#FFFFFF29]">
            <div className="mb-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type Message Here..."
                  className="w-full bg-transparent text-white placeholder:text-[#FFFFFF52] px-4 py-3 pr-12 text-sm focus:outline-none border"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.16)',
                    borderRadius: '16px',
                  }}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  aria-label="Emoji"
                >
                  <EmojiIconPlaceholder />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <button 
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: 'rgba(255, 255, 255, 0.32)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 7V11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="8"
                    cy="5"
                    r="0.75"
                    fill="currentColor"
                  />
                </svg>
                <span>Chat Rules</span>
              </button>
            <div className="flex items-center gap-1 ml-auto" style={{ color: 'rgba(255, 255, 255, 0.32)' }}>
              <MessageIcon width={16} height={16} />
              <span>160</span>
            </div>
            </div>
        </div>
      </div>
    </>
  );
}

