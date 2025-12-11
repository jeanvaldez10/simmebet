import { PrismaClient } from '../generated/prisma'
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

export const client = createPublicClient({
  chain: arbitrum,
  transport: http(arbitrum.rpcUrls.default.http[0]),
});

export const prisma = new PrismaClient();
