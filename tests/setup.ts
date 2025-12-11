import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { GenericContainer } from 'testcontainers';

module.exports = async () => {
  // Detect whether a Docker-compatible runtime is available. If not, skip integration tests.
  const dockerAvailable = (() => {
    try {
      execSync('docker info', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  })();

  if (!dockerAvailable) {
    console.warn('⚠️  Docker runtime not found – skipping integration tests that rely on containers.');
    process.env.SKIP_INTEGRATION = '1';
    return;
  }

  // spin up postgres container
  const container = await new GenericContainer('postgres:15')
    .withEnvironment({
      POSTGRES_PASSWORD: 'testpass',
      POSTGRES_USER: 'testuser',
      POSTGRES_DB: 'testdb',
    })
    .withExposedPorts(5432)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const url = `postgresql://testuser:testpass@${host}:${port}/testdb`;
  process.env.DATABASE_URL = url;
  process.env.DIRECT_URL = url;
  // expose for test processes that may import before env is available
  (global as any).__TEST_DB_URL__ = url;

  // push schema to container db
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });

  // make container available in teardown
  (global as any).__TESTCONTAINER__ = container;
}; 
