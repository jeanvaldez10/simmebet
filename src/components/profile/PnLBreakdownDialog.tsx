"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBalance } from "@/utils/format";
import { ProfitBreakdown } from "@/hooks/useUserProfit";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface PnLBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: ProfitBreakdown;
  totalProfit: number;
  liquidityPnL?: number;
}

export function PnLBreakdownDialog({
  open,
  onOpenChange,
  breakdown,
  totalProfit,
  liquidityPnL = 0,
}: PnLBreakdownDialogProps) {
  const isProfit = totalProfit >= 0;
  const hasLiquidityData =
    liquidityPnL !== 0 || breakdown.onchainFees.count > 0;
  const formatTokenAmount = (value: number) => {
    if (value === 0) return "0";
    if (Math.abs(value) >= 1) return value.toFixed(2);
    return value.toFixed(4);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="wide"
        className="max-h-[90vh] overflow-y-auto bg-[#16171E] border-[#FFFFFF29] z-[9999]"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-[#60d87e]" />
            ) : (
              <TrendingDown className="w-6 h-6 text-[#FD3748]" />
            )}
            P&L Breakdown
          </DialogTitle>
          <DialogDescription className="text-[#FFFFFFA3]">
            Detailed breakdown of your profit and loss calculation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {/* Total Summary */}
          <Card className="bg-[#1E2029] border-[#FFFFFF29]">
            <CardHeader>
              <CardTitle className="text-white">Total Profit/Loss</CardTitle>
              <CardDescription className="text-[#FFFFFFA3]">
                Combined P&L from all sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${isProfit ? 'text-[#60d87e]' : 'text-[#FD3748]'}`}>
                {formatBalance(totalProfit)}
              </div>
            </CardContent>
          </Card>

          {/* Bet Positions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Bet Positions
              </h3>
              <p className="text-sm text-[#FFFFFFA3]">
                Includes all YES/NO trades in active and resolved markets
              </p>
            </div>

            {/* Realized Profit */}
            <Card className="bg-[#1E2029] border-[#FFFFFF29]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#60d87e]" />
                    <CardTitle className="text-white">Realized Profit</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-white border-[#FFFFFF29]">
                    {breakdown.realized.count} positions
                  </Badge>
                </div>
                <CardDescription className="text-[#FFFFFFA3]">
                  {breakdown.realized.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${breakdown.realized.value >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}`}>
                  {formatBalance(breakdown.realized.value)}
                </div>
                <p className="text-sm text-[#FFFFFFA3] mt-2">
                  This includes profits and losses from markets you&apos;ve claimed or cashed out
                </p>

                {/* Realized Positions Table */}
                {breakdown.realized.positions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Resolved Markets:</h4>
                    <div className="rounded-md border border-[#FFFFFF29] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#FFFFFF29] hover:bg-[#2E3144]">
                            <TableHead className="text-[#FFFFFFA3]">Market</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Invested</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Returned</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Net P&L</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Txns</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.realized.positions.map((position) => (
                            <TableRow 
                              key={position.marketId} 
                              className="border-[#FFFFFF29] hover:bg-[#2E3144]"
                            >
                              <TableCell className="text-white max-w-[200px] truncate">
                                {position.marketName}
                              </TableCell>
                              <TableCell className="text-[#FFFFFFA3] text-right">
                                {formatBalance(position.totalInvested)}
                              </TableCell>
                              <TableCell className="text-white text-right">
                                {formatBalance(position.totalReturned)}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${position.netProfit >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}`}>
                                {position.netProfit >= 0 ? '+' : ''}
                                {formatBalance(position.netProfit)}
                              </TableCell>
                              <TableCell className="text-[#FFFFFFA3] text-right">
                                {position.transactionCount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unrealized Profit */}
            <Card className="bg-[#1E2029] border-[#FFFFFF29]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#8B3DFF]" />
                    <CardTitle className="text-white">Unrealized Profit</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-white border-[#FFFFFF29]">
                    {breakdown.unrealized.count} active positions
                  </Badge>
                </div>
                <CardDescription className="text-[#FFFFFFA3]">
                  {breakdown.unrealized.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${breakdown.unrealized.value >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}`}>
                  {formatBalance(breakdown.unrealized.value)}
                </div>
                <p className="text-sm text-[#FFFFFFA3] mt-2">
                  Current value of your active positions minus your investment
                </p>

                {/* Active Positions Table */}
                {breakdown.unrealized.positions.length > 0 && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">
                        Historical Investment (All Buys)
                      </h4>
                      <p className="text-xs text-[#FFFFFF80]">
                        Includes every buy you&apos;ve ever made in these live
                        markets. This is why it can be higher than the amount
                        you&apos;re currently holding.
                      </p>
                    </div>
                    <div className="rounded-md border border-[#FFFFFF29] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#FFFFFF29] hover:bg-[#2E3144]">
                            <TableHead className="text-[#FFFFFFA3]">Market</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Invested</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Current Value</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">P&L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.unrealized.positions.map((position) => (
                            <TableRow 
                              key={position.marketId} 
                              className="border-[#FFFFFF29] hover:bg-[#2E3144]"
                            >
                              <TableCell className="text-white max-w-[200px] truncate">
                                {position.marketName}
                              </TableCell>
                              <TableCell className="text-[#FFFFFFA3] text-right">
                                {formatBalance(position.invested)}
                              </TableCell>
                              <TableCell className="text-white text-right">
                                {formatBalance(position.currentValue)}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${position.unrealizedPnL >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}`}>
                                {position.unrealizedPnL >= 0 ? '+' : ''}
                                {formatBalance(position.unrealizedPnL)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">
                        Current Wallet Holdings
                      </h4>
                      <p className="text-xs text-[#FFFFFF80]">
                        Shows only the YES/NO tokens currently in your wallet.
                        These numbers align with the active position rows on the
                        market page.
                      </p>
                    </div>
                    <div className="rounded-md border border-[#FFFFFF29] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#FFFFFF29] hover:bg-[#2E3144]">
                            <TableHead className="text-[#FFFFFFA3]">Market</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">YES Tokens</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">NO Tokens</TableHead>
                            <TableHead className="text-[#FFFFFFA3] text-right">Wallet Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.unrealized.positions.map((position) => (
                            <TableRow
                              key={`${position.marketId}-wallet`}
                              className="border-[#FFFFFF29] hover:bg-[#2E3144]"
                            >
                              <TableCell className="text-white max-w-[200px] truncate">
                                {position.marketName}
                              </TableCell>
                              <TableCell className="text-[#FFFFFFA3] text-right">
                                {formatTokenAmount(position.yesBalance)}
                              </TableCell>
                              <TableCell className="text-[#FFFFFFA3] text-right">
                                {formatTokenAmount(position.noBalance)}
                              </TableCell>
                              <TableCell className="text-white text-right">
                                {formatBalance(position.currentValue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <Separator className="bg-[#FFFFFF29]" />

          {/* Liquidity Positions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Liquidity Positions (Bookie Mode)
              </h3>
              <p className="text-sm text-[#FFFFFFA3]">
                Tracks bookie-mode LP inventory value and any uncollected fees
              </p>
            </div>

            {hasLiquidityData ? (
              <>
                <Card className="bg-[#1E2029] border-[#FFFFFF29]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#00FF66]" />
                      <CardTitle className="text-white">
                        Liquidity Positions Value
                      </CardTitle>
                    </div>
                    <CardDescription className="text-[#FFFFFFA3]">
                      Current value of all liquidity positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        liquidityPnL >= 0 ? "text-[#60d87e]" : "text-[#FD3748]"
                      }`}
                    >
                      {formatBalance(liquidityPnL)}
                    </div>
                    <p className="text-sm text-[#FFFFFFA3] mt-2">
                      Total value of tokens held in liquidity positions plus any
                      realized LP P&L
                    </p>
                  </CardContent>
                </Card>

                {breakdown.onchainFees.count > 0 && (
                  <Card className="bg-[#1E2029] border-[#FFFFFF29]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-[#00FF66]" />
                          <CardTitle className="text-white">
                            LP Fees (Uncollected)
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-white border-[#FFFFFF29]"
                        >
                          {breakdown.onchainFees.count} LP positions
                        </Badge>
                      </div>
                      <CardDescription className="text-[#FFFFFFA3]">
                        {breakdown.onchainFees.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-[#60d87e]">
                        {formatBalance(breakdown.onchainFees.value)}
                      </div>
                      <p className="text-sm text-[#FFFFFFA3] mt-2">
                        Fees earned from providing liquidity that haven&apos;t been
                        collected yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-[#1E2029] border-[#FFFFFF29]">
                <CardContent>
                  <p className="text-sm text-[#FFFFFFA3]">
                    No liquidity positions are currently contributing to your
                    P&L.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="bg-[#FFFFFF29]" />

          {/* Calculation Formula */}
          <Card className="bg-[#1E2029] border-[#FFFFFF29]">
            <CardHeader>
              <CardTitle className="text-white">Total Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-sm text-[#FFFFFFA3] space-y-2">
                <div className="flex justify-between items-center">
                  <span>Realized Profit (Resolved Markets)</span>
                  <span className={breakdown.realized.value >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}>
                    {formatBalance(breakdown.realized.value)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>+ Unrealized Profit (Active Positions)</span>
                  <span className={breakdown.unrealized.value >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}>
                    {formatBalance(breakdown.unrealized.value)}
                  </span>
                </div>
                {breakdown.onchainFees.value > 0 && (
                  <div className="flex justify-between items-center">
                    <span>+ Uncollected LP Fees</span>
                    <span className="text-[#60d87e]">
                      {formatBalance(breakdown.onchainFees.value)}
                    </span>
                  </div>
                )}
                {liquidityPnL !== 0 && (
                  <div className="flex justify-between items-center">
                    <span>
                      {liquidityPnL >= 0
                        ? "+ Liquidity Positions"
                        : "- Liquidity Positions"}
                    </span>
                    <span
                      className={
                        liquidityPnL >= 0 ? "text-[#60d87e]" : "text-[#FD3748]"
                      }
                    >
                      {formatBalance(liquidityPnL)}
                    </span>
                  </div>
                )}
                <Separator className="bg-[#FFFFFF29] my-2" />
                <div className="flex justify-between items-center font-bold">
                  <span className="text-white">= Total P&L</span>
                  <span className={totalProfit >= 0 ? 'text-[#60d87e]' : 'text-[#FD3748]'}>
                    {formatBalance(totalProfit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

