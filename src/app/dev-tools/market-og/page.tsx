'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TestMarketOGPage() {
  const router = useRouter();
  const [marketId, setMarketId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Redirect to home if not in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  // Don't render anything if not in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleGenerateImage = () => {
    if (marketId) {
      const url = `/api/og/market?marketId=${marketId}`;
      setImageUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dev-tools">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dev Tools
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Market OG Image Generator</h1>
          <p className="text-muted-foreground">
            Test and preview dynamically generated market Open Graph images
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Image</CardTitle>
            <CardDescription>
              Enter a market identifier to generate and preview the OG image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketId">Market ID (UUID) or Contract Address</Label>
                <div className="flex gap-4">
                  <Input
                    id="marketId"
                    type="text"
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                    placeholder="UUID or 0x... contract address"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateImage}
                    disabled={!marketId}
                  >
                    Generate Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepts both UUID format (123e4567-...) or contract address (0x...)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {imageUrl && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
                <CardDescription>1920x1080 (Full HD) - Open Graph format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Generated Market OG"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs text-primary break-all block bg-muted p-3 rounded">
                  {imageUrl}
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>Add to your Next.js page metadata</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-x-auto bg-muted p-4 rounded">
{`// In your Next.js page metadata:
export const metadata = {
  openGraph: {
    images: ['/api/og/market?marketId=${marketId}'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og/market?marketId=${marketId}'],
  },
};`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <strong>Enter a valid market identifier:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Market UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)</li>
                  <li>Contract Address (e.g., 0x1234...abcd)</li>
                </ul>
              </li>
              <li>
                <strong>Click &ldquo;Generate Image&rdquo; to see the preview</strong>
              </li>
              <li>
                <strong>The route automatically:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Fetches market data from the database</li>
                  <li>Uses the market&apos;s socialImage, or falls back to imageSquare or image</li>
                  <li>Displays market title and current odds</li>
                  <li>Shows the market date and category</li>
                  <li>Renders a circular progress indicator with the odds percentage</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mt-6 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-500">API Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm block mb-3 text-yellow-800 dark:text-yellow-300">
              GET /api/og/market?marketId=&lt;uuid-or-contract-address&gt;
            </code>
            <p className="text-sm text-muted-foreground">
              This endpoint generates a 1920x1080 (Full HD) image suitable for Open Graph and Twitter cards.
              The marketId parameter accepts both UUID and contract address (0x...) formats.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

