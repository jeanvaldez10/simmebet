'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select } from '@/components/ui/select'; // May be used later
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PasswordProtection } from './components/PasswordProtection';

export default function ApiDocsPage() {
  return (
    <PasswordProtection>
      <ApiDocsContent />
    </PasswordProtection>
  );
}

function ApiDocsContent() {
  const { data: session, status } = useSession();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsCheckingAuth(false);
    }
  }, [status]);

  if (status === 'loading' || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    const mainSiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bluff.com';
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              🔐 Sign In Required
            </CardTitle>
            <CardDescription>
              You must be signed in to access the API testing interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 border border-muted rounded-lg p-4 text-sm text-center space-y-3">
              <p className="font-medium text-foreground">
                Please sign in on the main site first
              </p>
              <p className="text-muted-foreground text-xs">
                After signing in, return to this page to access the API documentation
              </p>
            </div>
            
            <Button
              onClick={() => window.location.href = mainSiteUrl}
              className="w-full"
              size="lg"
            >
              Go to Main Site to Sign In
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              You must be authenticated with a valid Bluff account to access developer tools
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold tracking-tight">API Documentation & Testing</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {session.user?.email || session.user?.name}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Interactive documentation and testing interface for Bluff APIs
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="blackjack" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="blackjack">
              🎴 Blackjack
            </TabsTrigger>
            <TabsTrigger value="coinflip" disabled>
              🪙 Coin Flip
              <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
            </TabsTrigger>
            <TabsTrigger value="minesweeper" disabled>
              💣 Minesweeper
              <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Blackjack API Section */}
          <TabsContent value="blackjack" className="space-y-6">
            <BlackjackApiTester />
          </TabsContent>

          {/* Placeholder for other APIs */}
          <TabsContent value="coinflip">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  Coin Flip API
                </CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="minesweeper">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💣</span>
                  Minesweeper API
                </CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BlackjackApiTester() {
  const [action, setAction] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableActions = [
    'PLACE_BET',
    'START_ROUND',
    'HIT',
    'STAND',
    'DOUBLE',
    'SPLIT',
    'SURRENDER',
    'INSURANCE',
    'DECLINE_INSURANCE',
    'PLAY_AGAIN',
    'START_NEW_GAME',
    'RESET_GAME',
    'SWITCH_HAND',
  ];

  const handleGetGameState = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/games/blackjack/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAction = async () => {
    if (!action) {
      setError('Action is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const body: { action: string; betAmount?: number } = { action };
      if (betAmount) {
        body.betAmount = parseFloat(betAmount);
      }

      const res = await fetch('/api/games/blackjack/current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            Blackjack Game API
          </CardTitle>
          <CardDescription>
            Test and interact with the Blackjack game endpoints. Manage game state, place bets, and execute game actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">GET</Badge>
                <code className="text-sm text-muted-foreground">/api/games/blackjack/current</code>
              </div>
              <p className="text-sm text-muted-foreground">Retrieve current game state</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">POST</Badge>
                <code className="text-sm text-muted-foreground">/api/games/blackjack/current</code>
              </div>
              <p className="text-sm text-muted-foreground">Execute game action</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Tester Card */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive API Tester</CardTitle>
          <CardDescription>
            Configure and send requests to the Blackjack API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Request Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="action" className="text-base font-medium">
                Game Action
              </Label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an action...</option>
                {availableActions.map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {actionType}
                  </option>
                ))}
              </select>
              {action && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-mono text-primary">{action}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="betAmount" className="text-base font-medium">
                Bet Amount (Optional)
              </Label>
              <Input
                type="number"
                id="betAmount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter bet amount..."
                className="w-full"
              />
              {betAmount && (
                <p className="text-xs text-muted-foreground">
                  Amount: <span className="font-mono text-primary">{betAmount}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGetGameState}
              disabled={loading}
              variant="outline"
              className="min-w-[160px]"
            >
              {loading ? 'Loading...' : '📥 Get Game State'}
            </Button>

            <Button
              onClick={handlePostAction}
              disabled={loading || !action}
              className="min-w-[160px]"
            >
              {loading ? 'Loading...' : '🚀 Send Action'}
            </Button>
          </div>

          {/* Request Preview */}
          {action && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Request Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(
                    {
                      method: 'POST',
                      url: '/api/games/blackjack/current',
                      body: {
                        action,
                        ...(betAmount && { betAmount: parseFloat(betAmount) }),
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <span>⚠️</span> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✅</span> API Response
            </CardTitle>
            <CardDescription>
              Response received at {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto">
              <pre className="text-sm text-slate-50 font-mono">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

