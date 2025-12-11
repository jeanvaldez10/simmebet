"use client";

import React from "react";
import Image from "next/image";
import DotDivider from "./icons/DotDivider";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";

const Footer: React.FC = () => {
  const iconItems = [
    { label: "X", url: "https://x.com/CallMyBluff_io", icon: <FaXTwitter className="w-4 h-4" /> },
    { label: "Discord", url: "https://discord.com/invite/HVfw3ZB56j", icon: <FaDiscord className="w-4 h-4" /> }
  ];

  const textItems = [
    { label: "Terms of Service", url: "/terms-of-services", internal: true },
    { label: "Privacy Policy", url: "/privacy-policy", internal: true }
  ];

  // Add dev tools link in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    textItems.push({ label: "Dev Tools", url: "/dev-tools", internal: true });
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/30 border-white/10 py-2 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {iconItems.map((item) => (
              <a 
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors flex items-center"
                title={item.label}
              >
                {item.icon}
              </a>
            ))}
            <a 
              href="https://x.com/Simmi_IO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              title="Simmi"
            >
              <Image 
                src="/SIMMI_LOGO.png" 
                alt="Simmi Logo" 
                width={32} 
                height={16}
                className="h-4 w-auto object-contain"
              />
            </a>
            <a 
              href="https://empyrealsdk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              title="Powered by Empyreal"
            >
              <Image 
                src="/EMP.png" 
                alt="Empyreal Logo" 
                width={16} 
                height={16}
                className="w-4 h-4 object-contain"
              />
            </a>
          </div>
          <div className="flex items-center gap-4">
            {textItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <a 
                  href={item.url}
                  target={item.internal ? undefined : "_blank"}
                  rel={item.internal ? undefined : "noopener noreferrer"}
                  className="text-white text-xs font-semibold hover:text-white/80 transition-colors"
                >
                  {item.label}
                </a>
                {index < textItems.length - 1 && (
                  <DotDivider className="flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            <DotDivider className="flex-shrink-0" />
            <div className="text-white text-xs font-semibold">
              Bluff © {currentYear}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
