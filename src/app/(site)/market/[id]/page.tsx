import { Metadata } from "next";
import { marketService } from "@/services/marketService";
import MarketDetailClient from "./MarketDetailClient";
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Determine if the identifier is a contract address or market ID
    const isContractAddress = id.startsWith('0x') && id.length === 42;
    
    let market;
    if (isContractAddress) {
      const result = await marketService.getMarketByContractAddress(id);
      market = result.market;
    } else {
      const result = await marketService.getMarketById(id);
      market = result.market;
    }

    if (!market) {
      return {
        title: 'Market Not Found | Bluff',
        description: 'The requested market could not be found.',
      };
    }

    const marketName = market.name || market.question;
    // Use dynamic OG image generation with the route id (supports both UUID and contract address)
    const marketOgImage = getMarketOgImageUrl(id);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/market/${id}`;

    return {
      title: `${marketName} | Bluff`,
      description: market.question || `Trade on ${marketName} - The First AI-Powered Prediction Market`,
      openGraph: {
        title: marketName,
        description: market.question || `Trade on ${marketName}`,
        url: shareUrl,
        siteName: 'Bluff',
        images: [
          {
            url: marketOgImage,
            width: 1920,
            height: 1080,
            alt: marketName,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: marketName,
        description: market.question || `Trade on ${marketName}`,
        images: [marketOgImage],
        creator: '@simmibets',
        site: '@simmibets',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata for market:', error);
    return {
      title: 'Market | Bluff',
      description: 'Trade on prediction markets - The First AI-Powered Prediction Market',
    };
  }
}

export default async function MarketDetailPage({ params }: Props) {
  const { id } = await params;
  
  return <MarketDetailClient marketId={id} />;
}
