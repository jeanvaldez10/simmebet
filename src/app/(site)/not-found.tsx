import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#1A1A2A] rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              404 - Page Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button variant="primary" className="w-full">
                  Go Home
                </Button>
              </Link>
              <Link href="/markets">
                <Button variant="secondary" className="w-full">
                  Browse Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
