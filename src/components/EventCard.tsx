import Image from "next/image";
import Link from "next/link";
import { CircularProgress } from "./common/CircularProgress";

interface EventCardProps {
  title: string;
  subtitle: string;
  date: string;
  betChance: number;
  description: string;
  imageSrc: string;
  logoSrc?: string;
}

const EventCard = ({
  title,
  subtitle,
  date,
  betChance,
  description,
  imageSrc,
  logoSrc,
}: EventCardProps) => {
  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl">
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50" />

      <div className="absolute w-1/6 inset-0 bg-gradient-to-b from-transparent via-[#02079d] to-[#02079d]" />
      <div className="absolute w-1/3 inset-0 bg-gradient-to-b from-transparent via-transparent to-[#02079d]" />
      <div className="absolute w-1/2 inset-0 bg-gradient-to-b from-transparent via-transparent to-[#02079d]" />
      <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#2E3144] backdrop-blur-sm px-4 py-[10px] rounded-full text-sm">
            <span className="text-white">{date}</span>
          </div>

          <div className="bg-[#2E3144] backdrop-blur-sm px-4 pr-2 py-2 rounded-full h-10 flex items-center">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-white">
                Bet chance
              </span>

              <CircularProgress
                positivePercentage={betChance}
                negativePercentage={100 - betChance}
                size={36}
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between  items-end">
          <div className="flex flex-col gap-4 w-full md:w-[55%]">
            {logoSrc && <Image
              src={logoSrc}
              alt="Event logo"
              width={124}
              height={80}
              className="mx-0"
            />}

            <div>
              <h1
                className="text-5xl md:text-[78px] font-semibold leading-[110%] tracking-[-0.02em] text-left"
                style={{
                  fontFamily: "'Geist', sans-serif",
                  background:
                    "linear-gradient(92.13deg, #FFFFFF 0%, #C08EFF 86.79%, #FF73AD 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {title}
              </h1>
              <h2 className="text-2xl md:text-[40px] font-semibold leading-[110%] tracking-[-0.02em] text-left text-white mt-1">
                {subtitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full md:w-2/5 mt-6 md:mt-0">
            <div className="text-left max-w-sm">
              <p className="text-gray-300 text-sm leading-tight">
                {description}
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link 
                href="/market/0x65E29e145F346c314256deC0d2bF39a6C4592655"
                className="bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-opacity-90 transition-all w-full text-center shadow-lg text-base"
              >
                Bet your Belief
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
