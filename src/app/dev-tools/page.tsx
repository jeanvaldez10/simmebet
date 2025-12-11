'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image, Code } from 'lucide-react';

export default function DevToolsPage() {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Development Tools</h1>
          <p className="text-muted-foreground">
            Internal tools and utilities for testing and development
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Development Only
            </span>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Market OG Image Tester */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Image className="h-5 w-5 text-primary" />
                <CardTitle>Market OG Images</CardTitle>
              </div>
              <CardDescription>
                Test and preview dynamically generated market Open Graph images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dev-tools/market-og">
                <Button className="w-full" variant="outline">
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* API Docs Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle>API Documentation</CardTitle>
              </div>
              <CardDescription>
                View API endpoints and authentication documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api-docs">
                <Button className="w-full" variant="outline">
                  Open Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Placeholder for future tools */}
          <Card className="hover:shadow-lg transition-shadow opacity-50">
            <CardHeader>
              <CardTitle>More Tools Coming Soon</CardTitle>
              <CardDescription>
                Additional development tools will be added here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/">
            <Button variant="ghost">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

