/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

async function loadGoogleFont(font: string, text: string, weight: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}&display=block`;
  
  try {
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const fontResponse = await fetch(resource[1]);
      if (fontResponse.status === 200) {
        return await fontResponse.arrayBuffer();
      }
    }
    
    throw new Error(`No font resource found for ${font} weight ${weight}`);
  } catch (error) {
    console.error(`Failed to load font ${font} weight ${weight}:`, error);
    throw new Error(`Failed to load font data for ${font} weight ${weight}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');
    
    if (!marketId) {
      return new Response('Missing marketId parameter', { status: 400 });
    }

    // Determine if the identifier is a contract address or market UUID
    const isContractAddress = marketId.startsWith('0x') && marketId.length === 42;
    
    // Fetch market data using appropriate field
    const market = await prisma.market.findUnique({
      where: isContractAddress ? { contractAddress: marketId } : { id: marketId },
      include: {
        categoryAssignments: {
          include: {
            category: true,
          },
        },
        currentOdds: true,
      },
    });

    if (!market) {
      return new Response('Market not found', { status: 404 });
    }

    // Get category name
    const categoryName = market.categoryAssignments.length > 0
      ? market.categoryAssignments[0].category.name
      : 'General';

    // Truncate market question to fit in the card
    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    };

    const truncatedQuestion = truncateText(market.question, 80);
    
    // Format the market date
    const formatDate = (date: Date | null) => {
      if (!date) return 'TBD';
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date(date));
    };

    const formattedDate = formatDate(market.date);
    
    // Get odds percentage from currentOdds if available, otherwise calculate from yesPrice
    // currentOdds.yesOdds is stored as a Decimal percentage (0-100)
    // yesPrice is a value between 0-2 that needs to be converted to percentage
    let oddsPercentage: number;
    
    if (market.currentOdds) {
      // currentOdds.yesOdds is already a percentage (0-100)
      oddsPercentage = Math.round(Number(market.currentOdds.yesOdds));
      console.log('✅ Using currentOdds.yesOdds:', {
        marketId: market.id,
        currentOddsYesOdds: market.currentOdds.yesOdds,
        currentOddsYesOddsType: typeof market.currentOdds.yesOdds,
        converted: Number(market.currentOdds.yesOdds),
        rounded: oddsPercentage
      });
    } else {
      // yesPrice is between 0-2, convert to percentage
      // yesPrice = yesProbability * 2, so yesProbability = yesPrice / 2
      const yesProbability = market.yesPrice / 2;
      oddsPercentage = Math.round(yesProbability * 100);
      console.log('⚠️ Falling back to yesPrice calculation:', {
        marketId: market.id,
        yesPrice: market.yesPrice,
        yesProbability: yesProbability,
        oddsPercentage: oddsPercentage
      });
    }
    
    console.log('📊 Final market odds for OG image:', {
      marketId: market.id,
      marketQuestion: truncatedQuestion,
      hasCurrentOdds: !!market.currentOdds,
      finalOddsPercentage: oddsPercentage
    });
    
    // Determine market image URL - prioritize socialImage, then landscape image
    const marketImageUrl = market.socialImage || market.image || market.imageSquare;
    const fullMarketImageUrl = marketImageUrl
      ? (marketImageUrl.startsWith('http') 
          ? marketImageUrl 
          : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${marketImageUrl}`)
      : null;

    // Generate text content for font loading
    const textContent = `${categoryName.toUpperCase()} ${truncatedQuestion} ${formattedDate} Place Your Bet ${oddsPercentage}% ${market.name}`;
    const allText = `${textContent}ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!@#$%^&*()+-=[]{}|;:'"<>?/~`;
    
    // Load fonts
    const [font600, font700, font900] = await Promise.all([
      loadGoogleFont('Geist', allText, '600'),
      loadGoogleFont('Geist', allText, '700'),
      loadGoogleFont('Geist', allText, '900'),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Background image layer with overlay */}
          {fullMarketImageUrl && (
            <img
              src={fullMarketImageUrl}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Content Container - Vertically Centered */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              paddingRight: '200px',
              zIndex: 1,
            }}
          >
            {/* All Content Wrapper */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '90px',
                width: '100%',
              }}
            >
              {/* Category Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 32px',
                    borderRadius: 999,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#000000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                  }}
                >
                  {categoryName}
                </div>
              </div>

              {/* Market Title and Description */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxWidth: '1250px',
                }}
              >
                <h1
                  style={{
                    fontSize: '80px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {truncatedQuestion}
                </h1>
                <p
                  style={{
                    fontSize: '27px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {market.name || 'This is a prediction market. Place your bet and win big!'}
                </p>
              </div>

              {/* Bottom Section - Date, Button, and Odds Circle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '24px',
                }}
              >
              {/* Date Button */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '25px 60px',
                  borderRadius: 999,
                  fontSize: '27px',
                  fontWeight: 700,
                  color: '#000000',
                  display: 'flex',
                  letterSpacing: '0.5px',
                }}
              >
                {formattedDate}
              </div>

              {/* Place Your Bet Button */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '25px 60px',
                  borderRadius: 999,
                  fontSize: '27px',
                  fontWeight: 700,
                  color: '#000000',
                  display: 'flex',
                  letterSpacing: '0.5px',
                }}
              >
                Place Your Bet
              </div>

              {/* Odds Circle */}
              <div
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* SVG Circle Progress */}
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  style={{
                    position: 'absolute',
                    transform: 'rotate(-90deg)',
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                  }}
                >
                  {/* Positive (Green) Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#36FD68"
                    stroke-width="6"
                    stroke-dasharray={`${(oddsPercentage / 100) * 276.46} 276.46`}
                    stroke-linecap="round"
                  />
                  {/* Negative (Red) Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#FF4D4D"
                    stroke-width="6"
                    stroke-dasharray={`${((100 - oddsPercentage) / 100) * 276.46} 276.46`}
                    stroke-linecap="round"
                    transform={`rotate(${(oddsPercentage / 100) * 360} 50 50)`}
                  />
                </svg>

                {/* Percentage text */}
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: oddsPercentage >= 50 ? '#36FD68' : '#FF4D4D',
                    display: 'flex',
                    zIndex: 1,
                  }}
                >
                  {oddsPercentage}%
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1920,
        height: 1080,
        fonts: [
          {
            name: 'Geist',
            data: font600,
            weight: 600,
            style: 'normal',
          },
          {
            name: 'Geist',
            data: font700,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Geist',
            data: font900,
            weight: 900,
            style: 'normal',
          },
        ],
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch (e: unknown) {
    console.error('Error generating market OG image:', e);
    return new Response(
      `Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`,
      {
        status: 500,
      }
    );
  }
}

