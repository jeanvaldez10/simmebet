const { spawn } = require('child_process');
const path = require('path');

const indexerPath = path.join(__dirname, '../src/jobs/websocketMarketIndexer.ts');

function startIndexer() {
  console.log('Starting websocket market indexer...');
  
  const child = spawn('ts-node', ['--project', 'tsconfig2.json', indexerPath], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  child.on('exit', (code) => {
    console.log(`Indexer exited with code ${code}. Restarting in 5 seconds...`);
    setTimeout(startIndexer, 5000);
  });
}

startIndexer();
