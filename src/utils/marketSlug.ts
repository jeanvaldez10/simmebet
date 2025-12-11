export function generateMarketSlug(
  marketQuestion: string,
  maxLength: number = 50
): string {
  return marketQuestion
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, maxLength)
    .replace(/-$/, "");
}

export function formatTokenDeltas(
  yesDelta: number,
  noDelta: number,
  usdcDelta: number,
  yesName: string = "YES",
  noName: string = "NO"
): string {
  const deltas: string[] = [];

  // Format YES/NO deltas with consistent precision
  if (Math.abs(yesDelta) > 0.01) {
    const formatted = yesDelta.toFixed(2);
    deltas.push(`${yesDelta > 0 ? "+" : ""}${formatted} ${yesName}`);
  }
  if (Math.abs(noDelta) > 0.01) {
    const formatted = noDelta.toFixed(2);
    deltas.push(`${noDelta > 0 ? "+" : ""}${formatted} ${noName}`);
  }

  // Format USDC delta with proper sign handling
  if (Math.abs(usdcDelta) > 0.01) {
    const sign = usdcDelta > 0 ? "+" : "-";
    const amount = Math.abs(usdcDelta).toFixed(2);
    deltas.push(`${sign}$${amount} USDC`);
  }

  return deltas.join(", ") || "0";
}
