export interface CarouselBannerItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  betChance?: number;
  description: string;
  imageSrc: string;
  marketId?: string;
  useSocialImage?: boolean;
  marketSocialImageUrl?: string;
  mobileBannerSrc?: string;
  alignment: "left" | "center";
  isVideo: boolean;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export const carouselBanners: CarouselBannerItem[] = [
  {
    id: "alien-video",
    title: "",
    subtitle: "",
    date: "",
    description: "",
    imageSrc: "/banners/ALIEN_DESKTOP.mp4",
    alignment: "center",
    isVideo: true,
  },
  {
    id: "chiefs-vs-chargers",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/CHIEFS_VS_CHARGERS.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "Sat Sep 6th 2025 12:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "eth-surpass-ath",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/ethbanner.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "September 2025",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "vance-vs-newsom",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/vancebanner.png",
    alignment: "center",
    isVideo: false,
    primaryButtonText: "Sep 1st 2028 00:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "raja-prison",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/rajabanner.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "Sep 1st 2028 00:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
];
