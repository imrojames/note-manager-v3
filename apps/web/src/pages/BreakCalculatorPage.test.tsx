import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BreakCalculatorPage } from './BreakCalculatorPage';

describe('BreakCalculatorPage', () => {
  it('computes the return time for the default 1h30m break', () => {
    render(<BreakCalculatorPage />);
    const timeInput = screen.getByLabelText(/break start time/i) as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '09:00' } });
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('respects a custom duration', () => {
    render(<BreakCalculatorPage />);
    fireEvent.change(screen.getByLabelText(/break start time/i), { target: { value: '09:15' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '45' } });
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('wraps past midnight', () => {
    render(<BreakCalculatorPage />);
    fireEvent.change(screen.getByLabelText(/break start time/i), { target: { value: '23:00' } });
    expect(screen.getByText('00:30')).toBeInTheDocument();
  });
});
