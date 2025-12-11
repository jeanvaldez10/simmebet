import { PrismaClient } from '@/generated/prisma'
import { NextResponse } from "next/server";

import { getMarketData } from "@/jobs/marketIndexer";

export async function GET() {
  // Verify cron secret to ensure only authorized calls
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  const prisma = new PrismaClient();

  try {
    await getMarketData();
    await prisma.$queryRaw`
      REFRESH MATERIALIZED VIEW token_holders;
    `;
    await prisma.$queryRaw`
      REFRESH MATERIALIZED VIEW market_data_one_hour;
    `;
    await prisma.$queryRaw`
      REFRESH MATERIALIZED VIEW market_data_one_day;
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Indexer error:", error);
    return NextResponse.json({ error: "Indexer failed" }, { status: 500 });
  }
}
