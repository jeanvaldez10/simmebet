'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SendIcon } from '@/components/icons/SendIcon';
import EmojiIcon from '@/components/icons/EmojiIcon';
interface TrollBoxProps {
  label: string;
  x: number;
}
interface MessageProps {
  bot?: string;
  user?: string;
}
function TrollBox({ label, x }: TrollBoxProps) {
  const [isExpand, setIsExpand] = useState(false);
  const [message, setMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageProps[]>([
    {
      bot: `@grandpaMF: Hello`,
      user: `user: What can I help you?`,
    },
  ]);
  const SendMessage = useCallback(() => {
    if (!message.trim()) return;
    const userMessage = `user: ${message}`;
    setMessages((prev) => [...prev, { user: userMessage }]);
    setMessage('');
    setTimeout(() => {
      const botMessage = `@grandpaMF: Got it! 🤖`;
      setMessages((prev) => [...prev, { bot: botMessage }]);
    }, 600);
  }, [message]);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);
  const labelStyle = {
    fontFamily: 'Minecraft, monospace',
    fontSize: 16,
    fill: '#ffffff',
    letterSpacing: 0,
    textShadow: '1.5px 1.5px 0px #00000080',
  };
  const renderMessage = (text: string, type: 'bot' | 'user') => {
    const [username, ...rest] = text.split(':');
    const messageText = rest.join(':').trim();

    const usernameColor = type === 'bot' ? '#0092FF' : '#FF5050';

    return (
      <span className="text-[10px] font-['Minecraft'] font-medium leading-4">
        <span className="capitalize" style={{ color: usernameColor }}>
          {username}:
        </span>{' '}
        <span style={{ color: '#000000' }}>{messageText}</span>
      </span>
    );
  };
  return (
    <div
      className="absolute bottom-0 flex flex-col left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-auto"
      style={{ left: x }}
    >
      <button
        className="h-10 cursor-pointer flex flex-col items-center justify-center text-center w-[240px]"
        style={{
          backgroundImage:
            'url(/games/blackjack/assets/images/backgrounds/trollbox-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={() => setIsExpand((prev) => !prev)}
      >
        <span style={labelStyle} className="uppercase">
          {label}
        </span>
      </button>
      {isExpand && (
        <div className="bg-[#182325] h-[435px] flex flex-col px-2 pb-4 w-full">
          <div
            className="h-full flex flex-col w-full"
            style={{
              backgroundImage:
                'url(/games/blackjack/assets/images/backgrounds/inputbox.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div
              ref={containerRef}
              className="flex-1 pt-5 flex flex-col gap-1  overflow-y-auto scrollbar-hide"
            >
              {messages &&
                messages.length > 0 &&
                messages.map((msg, index) => (
                  <div key={index} className="flex flex-col px-3 w-full">
                    {msg.bot && renderMessage(msg.bot, 'bot')}
                    {msg.user && renderMessage(msg.user, 'user')}
                  </div>
                ))}
            </div>
            <div className="h-12 flex items-center justify-center gap-1 w-full">
              <div
                className="h-6 pl-2 w-[156px]"
                style={{
                  backgroundImage:
                    'url(/games/blackjack/assets/images/backgrounds/messagebox.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <input
                  type="text"
                  placeholder="TYPE A MESSAGE..."
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'TYPE A MESSAGE...')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      SendMessage();
                    }
                  }}
                  className="border-none outline-none text-[10px] leading-[1] font-medium h-full w-full text-black placeholder:text-black"
                />
              </div>
              <button className="w-5 h-5 cursor-pointer">
                <EmojiIcon />
              </button>
              <button
                className={`w-5 h-5  ${
                  message
                    ? 'text-black cursor-pointer'
                    : 'text-[#9698A3] cursor-default'
                }`}
                disabled={!message}
                onClick={SendMessage}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrollBox;
