import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { DateAndTimePicker } from './date-and-time-picker';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

function openPicker() {
  const valueLabel = screen.getByText(/10\.08\.2026/);
  const trigger = valueLabel.closest('button');

  if (trigger == null) throw new Error('Date picker trigger not found');

  fireEvent.click(trigger);
}

function selectDay(day: string) {
  const dayButton = document.querySelector<HTMLButtonElement>(`button[data-day="${day}"]`);

  if (dayButton == null) throw new Error(`Calendar day ${day} not found`);

  fireEvent.click(dayButton);
}

function commit() {
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
}

describe('DateAndTimePicker', () => {
  it('preserves the time when selecting another date', () => {
    const onChange = vi.fn();

    render(<DateAndTimePicker value={new Date(2026, 7, 10, 15, 37, 42, 123)} onChange={onChange} />);

    openPicker();
    selectDay('15.08.2026');
    commit();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 15, 15, 37, 42, 123));
  });

  it('returns the selected date at midnight when the time selector is hidden', () => {
    const onChange = vi.fn();

    render(<DateAndTimePicker hideTimeSelector value={new Date(2026, 7, 10, 15, 37, 42, 123)} onChange={onChange} />);

    openPicker();

    expect(screen.queryByRole('listbox', { name: 'Часы' })).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox', { name: 'Минуты' })).not.toBeInTheDocument();

    selectDay('15.08.2026');
    commit();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 15, 0, 0, 0, 0));
  });

  it('returns the selected hour and minute with zeroed seconds', () => {
    const onChange = vi.fn();

    render(<DateAndTimePicker value={new Date(2026, 7, 10, 15, 37, 42, 123)} onChange={onChange} />);

    openPicker();

    fireEvent.click(within(screen.getByRole('listbox', { name: 'Часы' })).getByRole('option', { name: '09' }));
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Минуты' })).getByRole('option', { name: '25' }));
    commit();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 10, 9, 25, 0, 0));
  });

  it('returns undefined when the value is cleared', () => {
    const onChange = vi.fn();

    render(<DateAndTimePicker clearable value={new Date(2026, 7, 10, 15, 37)} onChange={onChange} />);

    openPicker();
    fireEvent.click(screen.getByRole('button', { name: 'Очистить' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
