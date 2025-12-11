/**
 * Test script to verify the API integration with single market indexer
 * This script simulates the non-blocking behavior
 */

import { indexSingleMarketFromLastBlock } from './marketIndexer';

/**
 * Simulate the non-blocking behavior used in the API routes
 */
async function simulateApiCall(marketId: string) {
  console.log(`🚀 Simulating API call for market: ${marketId}`);
  
  // Simulate the main API logic (e.g., processing a bet)
  console.log('📝 Processing bet/update-belief...');
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
  
  console.log('✅ API response ready, triggering non-blocking indexing...');
  
  // This is the exact pattern used in the API routes
  indexSingleMarketFromLastBlock(marketId).catch((error) => {
    console.error(`❌ Error indexing market ${marketId}:`, error);
  });
  
  console.log('📤 API response sent (indexing running in background)');
  
  // Simulate the API returning immediately
  return {
    success: true,
    txHash: '0x1234567890abcdef',
    message: 'API call completed, indexing started in background'
  };
}

/**
 * Test the integration
 */
async function testIntegration() {
  const testMarketId = process.argv[2] || 'test-market-123';
  
  try {
    console.log('🧪 Testing API integration with single market indexer...\n');
    
    const startTime = Date.now();
    const result = await simulateApiCall(testMarketId);
    const endTime = Date.now();
    
    console.log('\n📊 Results:');
    console.log(`⏱️  API response time: ${endTime - startTime}ms`);
    console.log(`📋 Response:`, result);
    
    // Wait a bit to see if indexing completes
    console.log('\n⏳ Waiting to see indexing progress...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Test completed! The API should have returned immediately while indexing runs in the background.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testIntegration();
}

export { simulateApiCall };
