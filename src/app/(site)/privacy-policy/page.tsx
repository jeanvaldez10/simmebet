import React from "react";
import { HeadingComp, PointContent } from "../terms-of-services/common";

const points = [
  {
    title: "1. What We Collect",
    desc: "Bluff does not collect personal data. We only interact with your connected wallet address. We may collect limited technical information such as browser type, IP address, and device info for analytics and performance purposes.",
  },
  {
    title: "2. Use of Information",
    desc: "",
  },
  {
    title: "3. Cookies",
    desc: "We use cookies and similar technologies to understand user activity. You may disable cookies in your browser settings, but some features may not function properly.",
  },
  {
    title: "4. Data Sharing",
    desc: "We do not sell or share your personal data. However, any transactions made through Bluff are publicly recorded on the blockchain.",
  },
  {
    title: "5. Security",
    desc: "We take reasonable measures to protect data, but cannot guarantee the security of internet transmissions. Bluff does not store private keys or wallet credentials.",
  },
  {
    title: "6. Updates",
    desc: "We may revise this Privacy Policy periodically. Please review it regularly to stay informed of changes.",
  },
];

const SubPoints = () => {
  return (
    <div className="text-[#FFFFFFA3] text-base font-normal">
      <p>The data we collect is used to:</p>

      <ul className="list-disc ml-7 mt-1">
        <li>Improve platform performance</li>
        <li>Monitor usage patterns</li>
        <li>Detect and prevent abuse</li>
      </ul>
    </div>
  );
};

const PrivacyPage = () => {
  return (
    <main className="max-w-[820px]  mx-auto px-4 py-8">
      <HeadingComp heading="Privacy Policy" lastUpdated="April 15, 2025" />

      <section className="flex flex-col gap-4 mt-6">
        {points.map((data) => (
          <PointContent
            title={data.title}
            desc={data.desc}
            key={data.title}
            descChildren={data.desc === "" && <SubPoints />}
          />
        ))}
      </section>
    </main>
  );
};

export default PrivacyPage;
