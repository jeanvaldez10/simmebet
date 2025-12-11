#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Get the base URL from environment or default to localhost
const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

async function updateNftPositions() {
  try {
    console.log(`[${new Date().toISOString()}] Starting NFT positions update...`);
    
    const url = `${baseUrl}/api/cron/update-nft-positions`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] Update completed:`, {
      message: data.message,
      updated: data.updated,
      total: data.total,
      timestamp: data.timestamp,
    });

    if (data.error) {
      console.error(`[${new Date().toISOString()}] Error:`, data.error);
      process.exit(1);
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating NFT positions:`, error.message);
    process.exit(1);
  }
}

// Run the update
updateNftPositions();
