import fs from 'fs';
import path from 'path';

module.exports = async () => {
  if ((global as any).__TESTCONTAINER__) {
    await (global as any).__TESTCONTAINER__.stop();
  }
}; 
