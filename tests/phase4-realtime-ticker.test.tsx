import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';

describe('Phase 4 - Realtime Velocity Ticker, Desktop Split-Screen & Persistence', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('displays official run-rates in Snapshot mode and ticks live in Live Session mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T12:00:00'));

    render(<App />);

    // Snapshot default
    expect(screen.getByTestId('ticker-hires-value')).toHaveTextContent('2.08/sec');
    expect(screen.getByTestId('ticker-postings-value')).toHaveTextContent('2.95/sec');
    expect(screen.getByTestId('ticker-layoffs-value')).toHaveTextContent('0.62/sec');

    // Switch to Live Session Ticker
    fireEvent.click(screen.getByTestId('pulse-mode-session'));
    expect(screen.getByTestId('ticker-hires-value')).toHaveTextContent('+0');

    // Advance 10 seconds -> 10 * 2.08 = 20 hires, 10 * 2.95 = 29 postings, 10 * 0.62 = 6 layoffs
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByTestId('ticker-hires-value')).toHaveTextContent('+20');
    expect(screen.getByTestId('ticker-postings-value')).toHaveTextContent('+29');
    expect(screen.getByTestId('ticker-layoffs-value')).toHaveTextContent('+6');
    expect(screen.getByTestId('ticker-net-value')).toHaveTextContent('+14');

    // Metric cards show live flow badges
    expect(screen.getByTestId('live-badge-hires')).toHaveTextContent('+20 live');
    expect(screen.getByTestId('live-badge-job_postings')).toHaveTextContent('+29 live');
    expect(screen.getByTestId('live-badge-layoffs')).toHaveTextContent('+6 live');

    // Zero button resets session counters
    fireEvent.click(screen.getByTestId('reset-session-pulse'));
    expect(screen.getByTestId('ticker-hires-value')).toHaveTextContent('+0');
  });

  it("computes cumulative Today's US Labor Flow since midnight local time", () => {
    vi.useFakeTimers();
    // 1 hour = 3600 seconds since midnight
    vi.setSystemTime(new Date('2026-11-11T01:00:00'));

    render(<App />);
    fireEvent.click(screen.getByTestId('pulse-mode-today'));

    // 3600 * 2.08 = 7,488 hires; 3600 * 0.62 = 2,232 layoffs; 3600 * 2.95 = 10,620 postings
    expect(screen.getByTestId('ticker-hires-value')).toHaveTextContent('+7,488');
    expect(screen.getByTestId('ticker-postings-value')).toHaveTextContent('+10,620');
    expect(screen.getByTestId('ticker-layoffs-value')).toHaveTextContent('+2,232');
    expect(screen.getByTestId('live-badge-hires')).toHaveTextContent('+7,488 today');
  });

  it('persists PopulationLens and LivePulseMode in localStorage and supports Compare & Reset', () => {
    const { unmount } = render(<App />);

    fireEvent.click(screen.getByTestId('lens-btn-employed'));
    fireEvent.click(screen.getByTestId('pulse-mode-today'));

    expect(window.localStorage.getItem('usjp_population_lens')).toBe('employed');
    expect(window.localStorage.getItem('usjp_pulse_mode')).toBe('today');

    // Remount App and verify preferences are restored
    unmount();
    render(<App />);

    expect(screen.getByTestId('lens-btn-employed')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('pulse-mode-today')).toHaveAttribute('aria-checked', 'true');

    // Toggle Compare utility
    fireEvent.click(screen.getByTestId('compare-cohorts-btn'));
    expect(screen.getByTestId('cohort-compare-panel')).toBeInTheDocument();

    // Reset restores defaults and clears persisted keys
    fireEvent.click(screen.getByTestId('reset-view-btn'));
    expect(screen.getByTestId('lens-btn-all')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('pulse-mode-snapshot')).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByTestId('cohort-compare-panel')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('usjp_population_lens')).toBe('all');
    expect(window.localStorage.getItem('usjp_pulse_mode')).toBe('snapshot');
  });

  it('renders persistent inline split-screen Micro Inspector on wide desktop viewports (1280px+)', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('1280px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);
    fireEvent.click(screen.getByTestId('metric-card-job_postings'));

    const inspector = screen.getByTestId('micro-drilldown-sheet');
    expect(inspector.tagName.toLowerCase()).toBe('aside');
    expect(inspector).toHaveAttribute('aria-label', 'Desktop Micro Breakdown Inspector');
    expect(screen.getByTestId('dashboard-workspace')).toHaveClass('xl:grid-cols-12');
  });

  it('opens the Data Proof & Methodology modal with series IDs and run-rate math', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('open-methodology-btn'));
    const modal = screen.getByTestId('methodology-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent(/JTSHIL/i);
    expect(modal).toHaveTextContent(/JTSJOL/i);
    expect(modal).toHaveTextContent(/2\.08 \/ sec/i);

    fireEvent.click(screen.getByTestId('close-methodology-btn'));
    expect(screen.queryByTestId('methodology-modal')).not.toBeInTheDocument();
  });
});
