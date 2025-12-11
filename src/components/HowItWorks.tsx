"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface HowItWorksCard {
  id: string | number;
  title: string;
  image?: string;
  isButton?: boolean;
  buttonText?: string;
  route?: string;
  description?: string;
}

interface HowItWorksProps {
  title: string;
  cards: HowItWorksCard[];

  isOption?: boolean;
}

export default function HowItWorks(props: HowItWorksProps) {
  const { title, cards, isOption } = props;
  const router = useRouter();

  return (
    <div className="w-full mt-12">
      <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-3 lg:gap-2">
        {cards.map((card: HowItWorksCard) => (
          <div
            key={card.id}
            className="bg-[#16171E] rounded-[16px] backdrop-blur-sm relative overflow-hidden w-full lg:w-auto"
          >
              <div
                className="w-[200px] h-[200px] blur-[80px] absolute top-[-23%] mx-auto left-1/2 -translate-x-1/2"
                style={{
                  background:
                    "linear-gradient(180deg, #7F2FFF 0%, rgba(7, 84, 208, 0.5) 35.5%, rgba(0, 0, 0, 0) 100%)",
                }}
              />

              <div className="rounded-lg p-6 text-white min-h-[315px] flex flex-col justify-between w-full relative z-10">
                <h2 className="text-white text-xl font-semibold">
                  {card.title}
                </h2>

                <div
                  className={cn(
                    "flex justify-center mb-4 flex-1 items-center w-full",
                    isOption && "mt-4"
                  )}
                >
                  <Image
                    alt={title}
                    width={296}
                    height={160}
                    src={card.image || "/placeholder.svg"}
                    className="object-contain max-w-full [296px] max-h-[160px]"
                  />
                </div>

                <div className="mt-auto">
                  {card.isButton ? (
                    <button
                      className="bg-white cursor-pointer text-black font-medium px-4 py-2 rounded-full hover:bg-opacity-90 transition-all w-full text-center shadow-lg text-base"
                      onClick={() => {
                        if (card.route) {
                          router.push(card.route);
                        }
                      }}
                    >
                      {card?.buttonText || ""}
                    </button>
                  ) : (
                    <p className="text-gray-300 text-sm leading-relaxed break-words">
                      {card?.description || ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
