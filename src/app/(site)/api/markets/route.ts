import { NextResponse, type NextRequest } from 'next/server'
import { marketService } from '@/services/marketService';
import { IMarketFilter } from '@/interfaces/market';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { encodeAbiParameters } from 'viem';

// type ApiResponse<T> = {
//   error?: string;
// } & T;

export async function GET(
  req: NextRequest,
) {
    try {
      const reqUrl = req.url
      const { searchParams } = new URL(reqUrl)
      const filter = Object.fromEntries(searchParams.entries()) as IMarketFilter;
      const { markets } = await marketService.getAllMarkets(filter);
      return NextResponse.json({ markets });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
      }
    }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    
    const marketName = formData.get('marketName') as string;
    const description = formData.get('description') as string;
    const oracle = formData.get('oracle') as string;
    const eventDate = formData.get('eventDate') as string;
    const initialBelief = Number(formData.get('initialBelief'));
    const lpAmount = Number(formData.get('lpAmount'));
    const urls = JSON.parse(formData.get('urls') as string);
    const tieIsPossible = formData.get('tieIsPossible') === 'true';
    const marketImage = formData.get('marketImage') as File;

    const encodeOracleData = (data: {
      marketName: string;
      description?: string;
      urls?: string[];
      eventDate?: string;
      tieIsPossible?: boolean;
      userAddress?: string;
    }) => {
      const validUrls = (data.urls || []).filter((url: string) => url.trim());
      
      const eventTimestamp = data.eventDate 
        ? Math.floor(new Date(data.eventDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      
      const tools = [1, 2];
      const aiModels = [0, 1];
      
      const options = data.tieIsPossible 
        ? [["Yes", "Yes outcome"], ["No", "No outcome"], ["Tie", "Tie or no contest"]]
        : [["Yes", "Yes outcome"], ["No", "No outcome"]];

      return encodeAbiParameters(
        [
          { type: 'string', name: 'marketName' },
          { type: 'string', name: 'description' },
          { type: 'string[]', name: 'urls' },
          { type: 'uint8[]', name: 'tools' },
          { type: 'uint8[]', name: 'aiModels' },
          { type: 'tuple(string,string)[]', name: 'options' },
          { type: 'uint256', name: 'eventTimestamp' },
          { type: 'address', name: 'userAddress' },
          { type: 'uint8', name: 'version' }
        ],
        [
          data.marketName,
          data.description || "",
          validUrls,
          tools,
          aiModels,
          options,
          BigInt(eventTimestamp),
          data.userAddress as `0x${string}` || "0x0000000000000000000000000000000000000000",
          3
        ]
      );
    };

    let imageUrl = '';
    if (marketImage) {
      const filename = `market-${Date.now()}.${marketImage.type.split('/')[1]}`;
      
      const uploadResponse = await fetch(`${req.nextUrl.origin}/api/image/upload`, {
        method: 'POST',
        body: JSON.stringify({
          pathname: filename,
          contentType: marketImage.type,
          access: 'public'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url || '';
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    let oracleAddress: string;
    
    if (oracle === 'bluff_ai_oracle') {
      oracleAddress = process.env.EVENT_ORACLE_ADDRESS || process.env.BLUFF_AI_ORACLE_ADDRESS!;
    } else {
      if (!user?.walletAddress) {
        throw new Error('User wallet address is required for manual oracle');
      }
      
      oracleAddress = user.walletAddress;
    }

    if (!oracleAddress) {
      throw new Error(`Oracle address is required for ${oracle}`);
    }

    const oracleData = encodeOracleData({
      marketName,
      description,
      urls: urls.filter((url: string) => url.trim()),
      eventDate,
      tieIsPossible,
      userAddress: user?.walletAddress || undefined
    });

    const bluffActionsUrl = process.env.BLUFF_ACTIONS_URL || 'http://0.0.0.0:8000';
    
    if (!process.env.BLUFF_ACTIONS_API_KEY) {
      throw new Error('BLUFF_ACTIONS_API_KEY environment variable is required');
    }

    const bluffResponse = await fetch(`${bluffActionsUrl}/actions/${userId}/create-market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.BLUFF_ACTIONS_API_KEY
      },
      body: JSON.stringify({
        market_name: marketName,
        collateral_token: process.env.USDC_ADDRESS!,
        outcomes: ["Yes", "No"],
        oracle_address: oracleAddress,
        oracle_data: oracleData,
        initial_liquidity: lpAmount || 1000,
        initial_price: Math.round((initialBelief) * 100),
        protocol_fee_bps: 100,
        creator_fee_bps: 50,
        fee: 3000,
        tick_spacing: 60,
        min_tick: -887272,
        max_tick: 887272,
      })
    });

    if (!bluffResponse.ok) {
      const errorText = await bluffResponse.text();
      throw new Error(`Bluff Actions API error: ${bluffResponse.statusText} - ${errorText}`);
    }

    const { tx_hash, market_address, yes_token_address, no_token_address, oracle_market_id } = await bluffResponse.json();

    const market = await prisma.market.create({
      data: {
        name: marketName,
        question: marketName,
        contractAddress: market_address,
        yesTokenAddress: yes_token_address,
        noTokenAddress: no_token_address,
        poolAddress: market_address,
        createdBy: userId,
        yesPrice: initialBelief,
        noPrice: 100 - initialBelief,
        rules: urls.filter((url: string) => url.trim()),
        volume: 0,
        totalLiquidity: lpAmount || 0,
        status: "ACTIVE",
        image: imageUrl,
        date: eventDate ? new Date(eventDate) : null,
        oracleType: oracle,
        tieIsPossible: tieIsPossible || false,
        oracleMarketId: oracle_market_id || null,
      },
    });

    return NextResponse.json({ market, tx_hash });
  } catch (error) {
    console.error("Error creating market:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create market" },
      { status: 500 }
    );
  }
}                                                                  
