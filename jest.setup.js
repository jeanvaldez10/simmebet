import '@testing-library/jest-dom'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

process.env.BLUFF_ACTIONS_URL = 'http://localhost:8000'
process.env.BLUFF_AI_ORACLE_ADDRESS = '0x0000000000000000000000000000000000000001'
process.env.MANUAL_ORACLE_ADDRESS = '0x0000000000000000000000000000000000000002'
// process.env.USDC_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
process.env.USDC_ADDRESS = '0x954B9655DA038FCa2C636cdc693c0813D80a61c9';

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))
