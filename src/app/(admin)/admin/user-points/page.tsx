"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Trophy, TrendingUp, DollarSign, Users } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserPointsData {
  userId: string;
  username: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  walletAddress: string | null;
  createdAt: string | null;
  totalVolume: number;
  tradeCount: number;
  points: number;
  rank: number;
}

interface PointsResponse {
  users: UserPointsData[];
  totalUsers: number;
  totalPoints: number;
  totalVolume: number;
  totalTrades: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>;
  }
  if (rank === 2) {
    return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>;
  }
  if (rank === 3) {
    return <Badge className="bg-orange-600 hover:bg-orange-700">🥉 3rd</Badge>;
  }
  if (rank <= 10) {
    return <Badge variant="secondary">#{rank}</Badge>;
  }
  return <Badge variant="outline">#{rank}</Badge>;
};

export default function UserPointsPage() {
  const [data, setData] = useState<PointsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users/points", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user points");
      }

      const pointsData = await response.json();
      setData(pointsData);
    } catch (error) {
      console.error("Error loading user points:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load user points"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Points</h1>
          <p className="text-muted-foreground">
            Trading volume and points leaderboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active traders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalPoints)}
            </div>
            <p className="text-xs text-muted-foreground">
              Points distributed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trading volume
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalTrades)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trades executed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Avg Trade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{getRankBadge(user.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                              {(user.username || user.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.username || user.name || "Anonymous"}
                            </p>
                            {user.walletAddress && (
                              <p className="text-xs text-muted-foreground">
                                {user.walletAddress.slice(0, 6)}...
                                {user.walletAddress.slice(-4)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(user.points)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.totalVolume)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.tradeCount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(user.totalVolume / user.tradeCount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

