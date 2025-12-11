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

// Helper function to render avatar with fallback
function renderAvatar(avatar: string | null | undefined, size: number = 36) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: 'cover',
        }}
      />
    );
  }
  
  // Fallback to gray circle placeholder
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: '#2A3133',
        display: 'flex',
      }}
    />
  );
}

// Remove edge runtime to allow Prisma to work
// export const runtime = 'edge';

interface FlexSnapshot {
  id: string;
  userId: string;
  type: string;
  username: string;
  avatar?: string | null;
  profitLoss: number;
  volumeTraded: number;
  balance: number;
  createdAt: Date;
  // Bet-specific fields (nullable for backward compatibility)
  betData?: Record<string, unknown>;
  marketId?: string;
  marketQuestion?: string;
  betAmount?: number;
  betSide?: string;
  beliefPercentage?: number;
  amountWon?: number;
  betStatus?: string;
  marketImage?: string;
  // What If card fields
  potentialWinAmount?: number;
  potentialLossAmount?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get('snapshotId');
    
    if (!snapshotId) {
      return new Response('Missing snapshotId parameter', { status: 400 });
    }

    // Fetch snapshot data
    const snapshot = await prisma.flexSnapshot.findUnique({
      where: { id: snapshotId },
    }) as FlexSnapshot | null;

    if (!snapshot) {
      return new Response('Snapshot not found', { status: 404 });
    }

    // Route based on snapshot type
    // The flex type is determined when the flex button is pressed
    // flex10: completed bet with result
    // flex12: ongoing bet with potential outcomes
    // flex15: ongoing position current value
    // Other types: profile cards
    switch (snapshot.type) {
      case 'flex10':
        return generateBetCard(snapshot);
      case 'flex12':
        return generateWhatIfCard(snapshot);
      case 'flex15':
        return generateOngoingPositionCard(snapshot);
      default:
        return generateProfileCard(snapshot);
    }
  } catch (e: unknown) {
    console.error('Error generating OG image:', e);
    return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    });
  }
}

async function generateBetCard(snapshot: FlexSnapshot) {

  // Truncate market question to fit in the card
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  const truncatedQuestion = truncateText(snapshot.marketQuestion || 'Unknown Market', 100);
  
  // Extract category from betData JSON or default to "General"
  const betData = snapshot.betData as { marketCategory?: string } | null;
  const categoryName = betData?.marketCategory || 'General';
  
  // Generate text content for font loading optimization
  const amountWonText = snapshot.amountWon ? 
    (Number(snapshot.amountWon) >= 0 ? 
      `+$${Number(snapshot.amountWon).toFixed(2)}` : 
      `-$${Math.abs(Number(snapshot.amountWon)).toFixed(2)}`
    ) : 
    '$0.00';
  // Include belief in font loading only if it's available
  const beliefText = snapshot.beliefPercentage != null && !isNaN(Number(snapshot.beliefPercentage)) 
    ? ` Belief ${Number(snapshot.beliefPercentage).toFixed(0)}%` 
    : '';
  const textContent = `${categoryName.toUpperCase()} ${truncatedQuestion} Amount won ${amountWonText} Bet $${Number(snapshot.betAmount).toFixed(2)} Side ${snapshot.betSide}${beliefText} @${snapshot.username} 1 Bet Placed via @Simmi on X`;

  // Load Geist fonts with different weights - ensure all characters are included
  const allText = `${textContent}ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!@#$%^&*()+-=[]{}|;:'"<>?/~`;
  const [font600, font800, font900] = await Promise.all([
    loadGoogleFont('Geist', allText, '600'),
    loadGoogleFont('Geist', allText, '800'),
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
        {/* Background image layer */}
        <img
          src="https://i.imgur.com/zzfnL3Y.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Main Card */}
        <div
          style={{
            width: 1100,
            height: 580,
            backgroundColor: 'rgba(22, 23, 30, 0.32)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 32,
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 40px',
            zIndex: 1,
            justifyContent: 'space-between',
            marginTop: '0px',
          }}
        >
          {/* Top section with image and question */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div
              style={{
                flexShrink: 0,
                backgroundColor: '#353835',
                height: '120px',
                width: '120px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {snapshot.marketImage ? (
                <img
                  src={snapshot.marketImage.startsWith('http') 
                    ? snapshot.marketImage 
                    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${snapshot.marketImage}`
                  }
                  alt="Market"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px', flex: 1 }}>
              <p
                style={{
                  lineHeight: '110%',
                  letterSpacing: '-2%',
                  marginTop: '20px',
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                {categoryName}
              </p>
              <p
                style={{
                  lineHeight: '115%',
                  letterSpacing: '-1.57px',
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: '0px',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: '"Geist"',
                }}
              >
                {truncatedQuestion}
              </p>
            </div>
          </div>

          {/* Middle section - Amount won */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#FFFFFFA3',
                marginBottom: '8px',
              }}
            >
              Amount won
            </p>
            <h2
              style={{
                textShadow: Number(snapshot.amountWon) < 0 ? 
                  '0 0 54px rgba(255, 85, 113, 0.33)' : 
                  '0 0 54px rgba(0, 253, 205, 0.33)',
                backgroundColor: 'transparent',
                marginTop: '0px',
                fontSize: '72px',
                fontWeight: 900,
                color: Number(snapshot.amountWon) < 0 ? '#FF5571' : '#01FABD',
                lineHeight: 1,
              }}
            >
              {snapshot.amountWon ? 
                (Number(snapshot.amountWon) >= 0 ? 
                  `+$${Number(snapshot.amountWon).toFixed(2)}` : 
                  `-$${Math.abs(Number(snapshot.amountWon)).toFixed(2)}`
                ) : 
                '$0.00'
              }
            </h2>
          </div>

          {/* Bet details row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '80px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Bet
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                ${Number(snapshot.betAmount).toFixed(2)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Side
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                {snapshot.betSide}
              </p>
            </div>
            {/* Only show Belief if it's available and valid */}
            {snapshot.beliefPercentage != null && !isNaN(Number(snapshot.beliefPercentage)) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p
                  style={{
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#FFFFFFA3',
                    marginBottom: '4px',
                    fontFamily: '"Geist"',
                  }}
                >
                  Belief
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    fontSize: '48px',
                    marginTop: '0px',
                    lineHeight: 1,
                    fontFamily: '"Geist"',
                  }}
                >
                  {Number(snapshot.beliefPercentage).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Bottom section - User and Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {renderAvatar(snapshot.avatar, 36)}
              <span style={{ fontWeight: 600, fontSize: 20, display: 'flex', fontFamily: '"Geist"' }}>@{snapshot.username}</span>
            </div>
          <img
            src="https://i.imgur.com/ZtOYMkW.png"
            alt="Bluff"
              style={{ width: 160 }}
          />
          </div>
        </div>
      </div>
    ),
    {
      width: 1500,
      height: 750,
      fonts: [
        {
          name: 'Geist',
          data: font600,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: font800,
          weight: 800,
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
}

async function generateProfileCard(snapshot: FlexSnapshot) {

  // Use snapshot data
  const { username, profitLoss, volumeTraded } = snapshot;

  // Generate text content for font loading optimization
  // Note: Level, Tier, and Win Ratio are commented out until real data is implemented
  const textContent = `Lifetime PNL $${Number(volumeTraded).toFixed(2)} Volume ${Number(profitLoss) >= 0 ? '' : '-'}$${Math.abs(Number(profitLoss)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} @${username} via @Simmi on X`;

  // Load Geist fonts with different weights - ensure all characters are included
  const allText = `${textContent}ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!@#$%^&*()+-=[]{}|;:'"<>?/~`;
  const [font600, font800, font900] = await Promise.all([
    loadGoogleFont('Geist', allText, '600'),
    loadGoogleFont('Geist', allText, '800'),
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
        {/* Background image layer */}
        <img
          src="https://i.imgur.com/zzfnL3Y.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Main Card - Reduced height since Level, Tier, Win Ratio are commented out */}
        <div
          style={{
            width: 1100,
            height: 320,
            backgroundColor: 'rgba(22, 23, 30, 0.32)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 24,
            color: '#E7F0EE',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 40px',
            zIndex: 1,
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          {/* Top section - Level and Tier - COMMENTED OUT until real data is implemented */}
          {/* <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '120px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#93A29B', fontSize: 22, fontWeight: 600, display: 'flex', fontFamily: '"Geist"', marginBottom: '4px' }}>Level</div>
              <div style={{ fontSize: 48, fontWeight: 900, display: 'flex', fontFamily: '"Geist"', lineHeight: 1, letterSpacing: '0px' }}>1</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#93A29B', fontSize: 22, fontWeight: 600, display: 'flex', fontFamily: '"Geist"', marginBottom: '4px' }}>Tier</div>
              <div style={{ fontSize: 48, fontWeight: 900, display: 'flex', fontFamily: '"Geist"', lineHeight: 1, letterSpacing: '0px' }}>BETA</div>
            </div>
          </div> */}

          {/* Middle section - Win Ratio - COMMENTED OUT until real data is implemented */}
          {/* <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '100px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#93A29B', fontSize: 22, fontWeight: 600, display: 'flex', fontFamily: '"Geist"', marginBottom: '4px' }}>Win ratio</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#00E5B0', display: 'flex', lineHeight: 1, fontFamily: '"Geist"', letterSpacing: '0px' }}>65%</div>
            </div>
          </div> */}

          {/* PNL Section - Now the main focus */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: '12px' }}>
              <div style={{ color: '#93A29B', fontSize: 24, fontWeight: 600, display: 'flex', fontFamily: '"Geist"' }}>Lifetime PNL</div>
              <div style={{ color: '#93A29B', fontSize: 24, fontWeight: 600, display: 'flex', fontFamily: '"Geist"' }}>${Number(volumeTraded).toFixed(2)} Volume</div>
          </div>
          <div
            style={{
                fontSize: 100,
              lineHeight: 1,
              fontWeight: 900,
              color: Number(profitLoss) >= 0 ? '#00E5B0' : '#EF4444',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            {Number(profitLoss) >= 0 ? '' : '-'}${Math.abs(Number(profitLoss)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Bottom section - User and Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {renderAvatar(snapshot.avatar, 40)}
              <span style={{ fontWeight: 600, fontSize: 22, display: 'flex', fontFamily: '"Geist"' }}>@{username}</span>
              {/* <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  backgroundColor: '#151C1E',
                  border: '1px solid #0E171A',
                  borderRadius: 999,
                  padding: '4px 10px',
                  display: 'flex',
                }}
              >
                88
              </span> */}
            </div>
            <img
              src="https://i.imgur.com/ZtOYMkW.png"
              alt="Bluff"
              style={{ width: 160 }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1500,
      height: 750,
      fonts: [
        {
          name: 'Geist',
          data: font600,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: font800,
          weight: 800,
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
}

async function generateOngoingPositionCard(snapshot: FlexSnapshot) {
  // Truncate market question to fit in the card
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  const truncatedQuestion = truncateText(snapshot.marketQuestion || 'Unknown Market', 100);
  
  // Extract category from betData JSON or default to "General"
  const betData = snapshot.betData as { marketCategory?: string } | null;
  const categoryName = betData?.marketCategory || 'General';
  
  // Current value is the cashout amount (always positive)
  const betAmount = Number(snapshot.betAmount) || 0;
  const currentValue = Number(snapshot.amountWon) || 0;
  
  // Generate text content for font loading optimization (no belief)
  const textContent = `${categoryName.toUpperCase()} ${truncatedQuestion} Current Value +$${currentValue.toFixed(2)} Total Bet $${betAmount.toFixed(2)} Side ${snapshot.betSide} @${snapshot.username} Ongoing Position`;

  // Load Geist fonts with different weights - ensure all characters are included
  const allText = `${textContent}ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!@#$%^&*()+-=[]{}|;:'"<>?/~`;
  const [font600, font800, font900] = await Promise.all([
    loadGoogleFont('Geist', allText, '600'),
    loadGoogleFont('Geist', allText, '800'),
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
        {/* Background image layer */}
        <img
          src="https://i.imgur.com/zzfnL3Y.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Main Card */}
        <div
          style={{
            width: 1100,
            height: 580,
            backgroundColor: 'rgba(22, 23, 30, 0.32)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 32,
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 40px',
            zIndex: 1,
            justifyContent: 'space-between',
            marginTop: '0px',
          }}
        >
          {/* Top section with image and question */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div
              style={{
                flexShrink: 0,
                backgroundColor: '#353835',
                height: '120px',
                width: '120px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {snapshot.marketImage ? (
                <img
                  src={snapshot.marketImage.startsWith('http') 
                    ? snapshot.marketImage 
                    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${snapshot.marketImage}`
                  }
                  alt="Market"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px', flex: 1 }}>
              <p
                style={{
                  lineHeight: '110%',
                  letterSpacing: '-2%',
                  marginTop: '20px',
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                {categoryName}
              </p>
              <p
                style={{
                  lineHeight: '115%',
                  letterSpacing: '-1.57px',
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: '0px',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: '"Geist"',
                }}
              >
                {truncatedQuestion}
              </p>
            </div>
          </div>

          {/* Current Value section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#FFFFFFA3',
                marginBottom: '8px',
              }}
            >
              Current Value
            </p>
            <h2
              style={{
                textShadow: '0 0 54px rgba(0, 253, 205, 0.33)',
                backgroundColor: 'transparent',
                marginTop: '0px',
                fontSize: '72px',
                fontWeight: 900,
                color: '#01FABD',
                lineHeight: 1,
              }}
            >
              +${currentValue.toFixed(2)}
            </h2>
          </div>

          {/* Bet details row - no belief column */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '80px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Total Bet
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                ${betAmount.toFixed(2)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Side
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                {snapshot.betSide}
              </p>
            </div>
          </div>

          {/* Footer section with user */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {renderAvatar(snapshot.avatar, 56)}
              <p
                style={{
                  fontSize: '30px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  margin: 0,
                  fontFamily: '"Geist"',
                }}
              >
                @{snapshot.username}
              </p>
            </div>
            <img
              src="https://i.imgur.com/ZtOYMkW.png"
              alt="Bluff"
              width={150}
              height={50}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Geist',
          data: font600,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: font800,
          weight: 800,
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
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    }
  );
}

async function generateWhatIfCard(snapshot: FlexSnapshot) {


  // Truncate market question to fit in the card
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  const truncatedQuestion = truncateText(snapshot.marketQuestion || 'Unknown Market', 100);
  
  // Extract category from betData JSON or default to "General"
  const betData = snapshot.betData as { marketCategory?: string } | null;
  const categoryName = betData?.marketCategory || 'General';
  
  // Use the amountWon value that was calculated in the UnifiedModal
  // This ensures consistency with what the user sees in the success modal
  const betAmount = Number(snapshot.betAmount) || 0;
  const belief = snapshot.beliefPercentage != null && !isNaN(Number(snapshot.beliefPercentage)) 
    ? Number(snapshot.beliefPercentage) 
    : null;
  const potentialWin = Number(snapshot.amountWon) || 0;
  
  // Generate text content for font loading optimization
  // Only include belief in font loading if it's available
  const beliefText = belief != null ? ` Belief ${belief.toFixed(0)}%` : '';
  const textContent = `${categoryName.toUpperCase()} ${truncatedQuestion} You Could Win ${potentialWin >= 0 ? '+' : ''}$${potentialWin.toFixed(2)} Bet $${betAmount.toFixed(2)} Side ${snapshot.betSide}${beliefText} @${snapshot.username}`;

  // Load Geist fonts with different weights - ensure all characters are included
  const allText = `${textContent}ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!@#$%^&*()+-=[]{}|;:'"<>?/~`;
  const [font600, font800, font900] = await Promise.all([
    loadGoogleFont('Geist', allText, '600'),
    loadGoogleFont('Geist', allText, '800'),
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
        {/* Background image layer */}
        <img
          src="https://i.imgur.com/zzfnL3Y.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Main Card */}
        <div
          style={{
            width: 1100,
            height: 580,
            backgroundColor: 'rgba(22, 23, 30, 0.32)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 32,
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 40px',
            zIndex: 1,
            justifyContent: 'space-between',
            marginTop: '0px',
          }}
        >
          {/* Top section with image and question */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div
              style={{
                flexShrink: 0,
                backgroundColor: '#353835',
                height: '120px',
                width: '120px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {snapshot.marketImage ? (
                <img
                  src={snapshot.marketImage.startsWith('http') 
                    ? snapshot.marketImage 
                    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${snapshot.marketImage}`
                  }
                  alt="Market"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px', flex: 1 }}>
              <p
                style={{
                  lineHeight: '110%',
                  letterSpacing: '-2%',
                  marginTop: '20px',
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                {categoryName}
              </p>
              <p
                style={{
                  lineHeight: '115%',
                  letterSpacing: '-1.57px',
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: '0px',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: '"Geist"',
                }}
              >
                {truncatedQuestion}
              </p>
            </div>
          </div>

          {/* You Could Win section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#FFFFFFA3',
                marginBottom: '8px',
              }}
            >
              You Could Win
            </p>
            <h2
              style={{
                textShadow: potentialWin < 0 ? 
                  '0 0 54px rgba(255, 85, 113, 0.33)' : 
                  '0 0 54px rgba(0, 253, 205, 0.33)',
                backgroundColor: 'transparent',
                marginTop: '0px',
                fontSize: '72px',
                fontWeight: 900,
                color: potentialWin < 0 ? '#FF5571' : '#01FABD',
                lineHeight: 1,
              }}
            >
              {potentialWin >= 0 ? '+' : ''}${potentialWin.toFixed(2)}
            </h2>
          </div>

          {/* Bet details row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '80px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Bet
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                ${Number(snapshot.betAmount).toFixed(2)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#FFFFFFA3',
                  marginBottom: '4px',
                  fontFamily: '"Geist"',
                }}
              >
                Side
              </p>
              <p
                style={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontSize: '48px',
                  marginTop: '0px',
                  lineHeight: 1,
                  fontFamily: '"Geist"',
                }}
              >
                {snapshot.betSide}
              </p>
            </div>
            {/* Only show Belief if it's available and valid */}
            {belief != null && !isNaN(belief) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p
                  style={{
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#FFFFFFA3',
                    marginBottom: '4px',
                    fontFamily: '"Geist"',
                  }}
                >
                  Belief
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    fontSize: '48px',
                    marginTop: '0px',
                    lineHeight: 1,
                    fontFamily: '"Geist"',
                  }}
                >
                  {belief.toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Bottom section - User and Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {renderAvatar(snapshot.avatar, 36)}
              <span style={{ fontWeight: 600, fontSize: 20, display: 'flex', fontFamily: '"Geist"' }}>@{snapshot.username}</span>
            </div>
          <img
            src="https://i.imgur.com/ZtOYMkW.png"
            alt="Bluff"
              style={{ width: 160 }}
          />
          </div>
        </div>
      </div>
    ),
    {
      width: 1500,
      height: 750,
      fonts: [
        {
          name: 'Geist',
          data: font600,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: font800,
          weight: 800,
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
}
