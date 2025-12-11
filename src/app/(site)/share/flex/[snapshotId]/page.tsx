import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ snapshotId: string }>; // Promise type for Next.js 15
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { snapshotId } = await params; // Await params in Next.js 15

  try {
    // Fetch snapshot data for metadata
    const snapshot = await prisma.flexSnapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!snapshot) {
      return {
        title: 'Flex Card Not Found',
        description: 'The requested flex card could not be found.',
      };
    }

    const { username, type, marketQuestion } = snapshot;
    const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/flex?snapshotId=${snapshotId}`;
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/flex/${snapshotId}`;

    // Pre-generate the OG image to ensure it's ready for Twitter crawlers
    // This happens during metadata generation, so the image is always available
    try {
      const ogResponse = await fetch(ogImageUrl, {
        method: 'HEAD',
      });
      if (!ogResponse.ok) {
        console.warn(`OG image not ready for snapshot ${snapshotId}, but continuing with metadata generation`);
      }
    } catch (error) {
      console.warn('Failed to pre-warm OG image during metadata generation:', error);
      // Continue with metadata generation even if pre-warming fails
    }

    // Determine card type based on explicit type
    const getCardInfo = (type: string, marketQuestion: string | null, username: string) => {
      switch (type) {
        case 'flex10':
          return {
            title: `${username}'s Bet on "${marketQuestion}" | SimmieBets`,
            description: `Check out ${username}'s bet on "${marketQuestion}" on SimmieBets prediction markets.`,
            ogTitle: `${username}'s Bet`
          };
        case 'flex12':
          return {
            title: `${username}'s What If Scenario on "${marketQuestion}" | SimmieBets`,
            description: `Check out ${username}'s potential outcomes for "${marketQuestion}" on SimmieBets prediction markets.`,
            ogTitle: `${username}'s belief`
          };
        default:
          return {
            title: `${username}'s Trading Stats | SimmieBets`,
            description: `Check out ${username}'s latest trading performance and stats on SimmieBets prediction markets.`,
            ogTitle: `${username}'s Trading Stats`
          };
      }
    };

    const { title, description, ogTitle } = getCardInfo(type, marketQuestion, username);

    return {
      title,
      description,
      openGraph: {
        title: ogTitle,
        description,
        url: shareUrl,
        siteName: 'SimmieBets',
        images: [
          {
            url: ogImageUrl,
            width: 1500,
            height: 750,
            alt: `${username}'s trading stats`,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description,
        images: [ogImageUrl],
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
    console.error('Error generating metadata:', error);
    return {
      title: 'SimmieBets',
      description: 'Prediction markets platform',
    };
  }
}

export default async function ShareFlexPage({ params }: Props) {
  const { snapshotId } = await params;

  try {
    const snapshot = await prisma.flexSnapshot.findUnique({
      where: { id: snapshotId },
      include: {
        user: true,
      }
    });

    if (!snapshot) {
      notFound();
    }

    // Minimal page that only hosts the image for sharing
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Image
          src={`/api/og/flex?snapshotId=${snapshotId}`}
          alt="Trading stats"
          width={1500}
          height={750}
          className="max-w-full max-h-full object-contain"
          priority
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading share page:', error);
    notFound();
  }
}
