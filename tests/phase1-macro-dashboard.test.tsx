import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacroDashboard } from '../src/components/MacroDashboard';
import { MetricCard } from '../src/components/MetricCard';
import { US_LABOR_BASELINE } from '../src/data/usLaborBaseline';
import App from '../src/App';

describe('Phase 1 - Macro Dashboard & Metrics', () => {
  it('renders all 6 required US macro metrics on the dashboard', () => {
    const handleSelect = vi.fn();
    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={handleSelect}
        activeLens="all"
        onLensChange={vi.fn()}
      />
    );

    // Verify 6 macro titles exist
    expect(screen.getByText('US Total Population')).toBeInTheDocument();
    expect(screen.getByText('Employed Workforce')).toBeInTheDocument();
    expect(screen.getByText('Unemployed Population')).toBeInTheDocument();
    expect(screen.getByText('US Job Postings & Openings')).toBeInTheDocument();
    expect(screen.getByText('US Monthly Hires')).toBeInTheDocument();
    expect(screen.getByText('Layoffs & Discharges')).toBeInTheDocument();

    // Verify key headline values
    expect(screen.getAllByText('341.2M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('161.5M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('6.9M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('7.74M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5.42M').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1.61M').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Full-Time and Part-Time split correctly inside the Employed metric card', () => {
    const handleSelect = vi.fn();
    render(
      <MetricCard
        metric={US_LABOR_BASELINE.metrics.employed}
        onSelect={handleSelect}
      />
    );

    // Full-Time and Part-Time sub-segments
    expect(screen.getByText(/Full-Time: 134.8M \(83.5%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Part-Time: 26.7M \(16.5%\)/i)).toBeInTheDocument();
  });

  it('triggers onSelect callback when clicking a macro metric card', () => {
    const handleSelect = vi.fn();
    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={handleSelect}
        activeLens="all"
        onLensChange={vi.fn()}
      />
    );

    const layoffsCard = screen.getByTestId('metric-card-layoffs');
    fireEvent.click(layoffsCard);
    expect(handleSelect).toHaveBeenCalledWith('layoffs');
  });

  it('renders full App shell cleanly', () => {
    render(<App />);
    expect(screen.getByText('US Job Pulse')).toBeInTheDocument();
    expect(screen.getByText(/Macro Metrics Dashboard/i)).toBeInTheDocument();
  });
});
