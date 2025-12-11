import React from "react";
import { HeadingComp, PointContent } from "./common";

const points = [
  {
    title: "1. Introduction",
    desc: "Welcome to Bluff. By accessing or using our interface, you agree to comply with these Terms of Service. If you disagree with any part, please do not use the platform.",
  },
  {
    title: "2. Purpose",
    desc: "Bluff provides a graphical interface to view and interact with prediction markets deployed on public blockchain networks. We do not custody funds, create markets, or act as a bookmaker.",
  },
  {
    title: "3. Disclaimer",
    desc: "The platform is provided for informational and educational purposes only. We do not guarantee the accuracy, reliability, or availability of any content.",
  },
  {
    title: "4. No Financial Advice",
    desc: "Nothing on Bluff should be considered financial or investment advice. Users act at their own risk and are solely responsible for their decisions.",
  },
  {
    title: "5. Limitation of Liability",
    desc: "Bluff shall not be liable for any damages or losses, including but not limited to indirect or consequential losses arising from the use of the platform.",
  },
  {
    title: "6. Eligibility",
    desc: "You must be at least 18 years old and legally permitted to use blockchain-based services in your jurisdiction.",
  },
  {
    title: "7. Modifications",
    desc: "We may update these Terms at any time. Continued use of the platform means you accept any changes.",
  },
];

const TermPage = () => {
  return (
    <main className="max-w-[820px] mx-auto px-4 py-8 md:mt-0 mt-6">
      <HeadingComp heading="Terms of Service" lastUpdated="April 15, 2025" />

      <section className="flex flex-col gap-4 mt-6">
        {points.map((data) => (
          <PointContent title={data.title} desc={data.desc} key={data.title} />
        ))}
      </section>
    </main>
  );
};

export default TermPage;
