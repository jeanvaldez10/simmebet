import { useState, useCallback } from 'react';

interface PrivateKeyResponse {
  pkValue: string;
}

interface UsePrivateKeyReturn {
  privateKey: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePrivateKey = (): UsePrivateKeyReturn => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivateKey = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching private key from /api/user/wallet');
      const response = await fetch('/api/user/wallet');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error(errorData.error || 'Private key not found for this user');
        } else if (response.status === 401) {
          throw new Error('Please log in to access your private key');
        } else {
          throw new Error(errorData.error || 'Failed to fetch private key');
        }
      }
      
      const data: PrivateKeyResponse = await response.json();
      console.log('Private key data received:', data);
      setPrivateKey(data.pkValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch private key';
      setError(errorMessage);
      console.error('Error fetching private key:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(() => {
    fetchPrivateKey();
  }, []);

  return {
    privateKey,
    loading,
    error,
    refetch,
  };
};
