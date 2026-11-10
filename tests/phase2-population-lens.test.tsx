import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacroDashboard } from '../src/components/MacroDashboard';
import { US_LABOR_BASELINE } from '../src/data/usLaborBaseline';
import App from '../src/App';

describe('Phase 2 - Realtime Employed / Unemployed Population Lens', () => {
  it('renders the 3-way Population Lens segmented control on the front dashboard', () => {
    const handleSelect = vi.fn();
    const handleLensChange = vi.fn();

    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={handleSelect}
        activeLens="all"
        onLensChange={handleLensChange}
      />
    );

    expect(screen.getByTestId('lens-btn-all')).toBeInTheDocument();
    expect(screen.getByTestId('lens-btn-employed')).toBeInTheDocument();
    expect(screen.getByTestId('lens-btn-unemployed')).toBeInTheDocument();
  });

  it('triggers onLensChange when switching to Employed or Unemployed', () => {
    const handleSelect = vi.fn();
    const handleLensChange = vi.fn();

    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={handleSelect}
        activeLens="all"
        onLensChange={handleLensChange}
      />
    );

    fireEvent.click(screen.getByTestId('lens-btn-employed'));
    expect(handleLensChange).toHaveBeenCalledWith('employed');

    fireEvent.click(screen.getByTestId('lens-btn-unemployed'));
    expect(handleLensChange).toHaveBeenCalledWith('unemployed');
  });

  it('updates contextual ratios and headlines dynamically when in Employed lens', () => {
    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={vi.fn()}
        activeLens="employed"
        onLensChange={vi.fn()}
      />
    );

    // Employed headline and ratios
    expect(screen.getByText(/Active US Employed Workforce Cohort/i)).toBeInTheDocument();
    expect(screen.getByText(/Full-Time Employment Share/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Hiring Turnover Rate/i)).toBeInTheDocument();
  });

  it('updates contextual ratios and headlines dynamically when in Unemployed lens', () => {
    render(
      <MacroDashboard
        data={US_LABOR_BASELINE}
        selectedMetricId={null}
        onSelectMetric={vi.fn()}
        activeLens="unemployed"
        onLensChange={vi.fn()}
      />
    );

    // Unemployed headline and ratios
    expect(screen.getByText(/Active Job Seekers & Unemployed Cohort/i)).toBeInTheDocument();
    expect(screen.getByText(/Postings per Job Seeker/i)).toBeInTheDocument();
    expect(screen.getByText(/1.12x/i)).toBeInTheDocument();
  });

  it('allows clicking quick-filter lens directly on Employed and Unemployed cards in App', () => {
    render(<App />);

    const quickEmployedBtn = screen.getByTestId('quick-lens-employed');
    expect(quickEmployedBtn).toBeInTheDocument();

    fireEvent.click(quickEmployedBtn);
    expect(screen.getByText(/Active US Employed Workforce Cohort/i)).toBeInTheDocument();

    const quickUnemployedBtn = screen.getByTestId('quick-lens-unemployed');
    fireEvent.click(quickUnemployedBtn);
    expect(screen.getByText(/Active Job Seekers & Unemployed Cohort/i)).toBeInTheDocument();
  });
});
