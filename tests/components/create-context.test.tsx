import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BeliefFormProvider, useBeliefForm } from '@/app/(site)/creator/common/modal/belief/store/create-context';

global.fetch = jest.fn();

const TestComponent = () => {
  const { state, setField, submitForm, validateForm } = useBeliefForm();
  
  return (
    <div>
      <input
        data-testid="market-name"
        value={state.data.marketName}
        onChange={(e) => setField('marketName', e.target.value)}
      />
      <input
        data-testid="description"
        value={state.data.description}
        onChange={(e) => setField('description', e.target.value)}
      />
      <select
        data-testid="oracle"
        value={state.data.oracle}
        onChange={(e) => setField('oracle', e.target.value)}
      >
        <option value="">Select Oracle</option>
        <option value="bluff_ai_oracle">Bluff AI Oracle</option>
        <option value="manual_oracle">Manual Oracle</option>
      </select>
      <input
        data-testid="initial-belief"
        type="number"
        value={state.data.initialBelief}
        onChange={(e) => setField('initialBelief', Number(e.target.value))}
      />
      <button data-testid="validate" onClick={() => validateForm()}>
        Validate
      </button>
      <button data-testid="submit" onClick={() => submitForm()}>
        Submit
      </button>
      {state.errors.general && (
        <div data-testid="error">{state.errors.general}</div>
      )}
    </div>
  );
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BeliefFormProvider>{children}</BeliefFormProvider>
);

describe('BeliefFormProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default form data', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('market-name')).toHaveValue('');
    expect(screen.getByTestId('description')).toHaveValue('');
    expect(screen.getByTestId('oracle')).toHaveValue('');
    expect(screen.getByTestId('initial-belief')).toHaveValue(50);
  });

  it('should update form fields correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('market-name'), {
      target: { value: 'Test Market' }
    });
    fireEvent.change(screen.getByTestId('description'), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByTestId('oracle'), {
      target: { value: 'bluff_ai_oracle' }
    });
    fireEvent.change(screen.getByTestId('initial-belief'), {
      target: { value: '75' }
    });

    expect(screen.getByTestId('market-name')).toHaveValue('Test Market');
    expect(screen.getByTestId('description')).toHaveValue('Test Description');
    expect(screen.getByTestId('oracle')).toHaveValue('bluff_ai_oracle');
    expect(screen.getByTestId('initial-belief')).toHaveValue(75);
  });

  it('should validate form fields correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('validate'));

  });

  it('should submit form with correct data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        market: { id: 'test-market' },
        txHash: '0xtest',
        message: 'Market created successfully'
      })
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('market-name'), {
      target: { value: 'Test Market' }
    });
    fireEvent.change(screen.getByTestId('description'), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByTestId('oracle'), {
      target: { value: 'bluff_ai_oracle' }
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/markets', {
        method: 'POST',
        body: expect.any(FormData)
      });
    });
  });

  it('should handle form submission errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to create market'
      })
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('market-name'), {
      target: { value: 'Test Market' }
    });
    fireEvent.change(screen.getByTestId('description'), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByTestId('oracle'), {
      target: { value: 'bluff_ai_oracle' }
    });

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to create market');
    });
  });
});
