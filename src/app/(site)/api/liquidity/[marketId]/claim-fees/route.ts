import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import api from "@/services/api/config";
import { getUserById } from "@/services/userService";
import { getTransfersAndWriteBalanceChanges } from "@/utils/onchain/transfers";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ marketId: string }> }
) {
  const session = await auth();
  const { marketId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbUser = await getUserById(session.user.id);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const response = await api.post(`/bets/${dbUser.id}/claim-fees`, body);

    // Track transfers in background (fire and forget with delay for RPC indexing)
    setTimeout(() => {
      getTransfersAndWriteBalanceChanges({
        txHash: response.data.txHash as `0x${string}`,
        walletAddress: dbUser.walletAddress as `0x${string}`,
        userId: dbUser.id,
        marketId: marketId,
        rpcUrl: "https://arb1.arbitrum.io/rpc",
        chainId: 42161,
      }).catch(error => {
        console.warn('Transfer tracking failed (non-critical):', error instanceof Error ? error.message : 'Unknown error');
      });
    }, 2000); // 2 second delay to allow RPC node to index the transaction
    
    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
