import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../src/App';
import { MacroMetricId } from '../src/types/labor';

describe('Phase 3 - Macro-to-Micro Interactive Bar Chart Drill-Downs', () => {
  const metricExpectations: Array<{
    id: MacroMetricId;
    title: string;
    sectorSample: string;
    demoSample: string;
  }> = [
    {
      id: 'us_population',
      title: 'US Total Population',
      sectorSample: 'Civilian Labor Force',
      demoSample: 'Prime Age (25–54 yrs)',
    },
    {
      id: 'employed',
      title: 'Employed Workforce',
      sectorSample: 'Health Care & Social Assistance',
      demoSample: 'Full-Time Workers (>=35 hrs/wk)',
    },
    {
      id: 'unemployed',
      title: 'Unemployed Population',
      sectorSample: 'Service & Hospitality',
      demoSample: 'Less than 5 Weeks (Frictionally unemployed)',
    },
    {
      id: 'job_postings',
      title: 'US Job Postings & Openings',
      sectorSample: 'Healthcare & Social Assistance',
      demoSample: 'Bachelor’s Degree & Higher',
    },
    {
      id: 'hires',
      title: 'US Monthly Hires',
      sectorSample: 'Accommodations & Food Services',
      demoSample: 'Hired into Full-Time Positions',
    },
    {
      id: 'layoffs',
      title: 'Layoffs & Discharges',
      sectorSample: 'Professional & Business Services',
      demoSample: 'Operational Restructuring & Downsizing',
    },
  ];

  it('opens the micro bar chart view for each of the 6 macro metrics and switches across all 3 dimensions', () => {
    render(<App />);

    for (const item of metricExpectations) {
      // Click the macro metric card
      fireEvent.click(screen.getByTestId(`metric-card-${item.id}`));

      const sheet = screen.getByTestId('micro-drilldown-sheet');
      expect(sheet).toBeInTheDocument();
      expect(within(sheet).getByRole('heading', { name: item.title })).toBeInTheDocument();

      // Dimension 1: By Industry Sector (default)
      expect(within(sheet).getByTestId('micro-barchart-sector')).toBeInTheDocument();
      expect(within(sheet).getByText(item.sectorSample)).toBeInTheDocument();

      // Dimension 2: Demographics & Work Type
      fireEvent.click(within(sheet).getByTestId('tab-demographics'));
      expect(within(sheet).getByTestId('micro-barchart-demographics')).toBeInTheDocument();
      expect(within(sheet).getByText(item.demoSample)).toBeInTheDocument();

      // Dimension 3: 12-Month Trend
      fireEvent.click(within(sheet).getByTestId('tab-trend12m'));
      expect(within(sheet).getByTestId('micro-barchart-trend12m')).toBeInTheDocument();
      expect(within(sheet).getByRole('img', { name: /12-month historical bar chart/i })).toBeInTheDocument();

      // Reset tab back to sector before next iteration & close sheet
      fireEvent.click(within(sheet).getByTestId('tab-sector'));
      fireEvent.click(within(sheet).getByTestId('close-micro-sheet'));
      expect(screen.queryByTestId('micro-drilldown-sheet')).not.toBeInTheDocument();
    }
  });

  it('reflects the active Employed / Unemployed population lens inside the micro drill-down view', () => {
    render(<App />);

    // Activate Employed lens
    fireEvent.click(screen.getByTestId('lens-btn-employed'));
    fireEvent.click(screen.getByTestId('metric-card-employed'));

    const sheet = screen.getByTestId('micro-drilldown-sheet');
    expect(within(sheet).getByTestId('micro-lens-context')).toHaveTextContent(/Employed Lens Active/i);
    expect(within(sheet).getAllByText(/Employed Focus/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Unemployed lens while closing and opening job postings
    fireEvent.click(within(sheet).getByTestId('close-micro-sheet'));
    fireEvent.click(screen.getByTestId('lens-btn-unemployed'));
    fireEvent.click(screen.getByTestId('metric-card-job_postings'));

    const postingsSheet = screen.getByTestId('micro-drilldown-sheet');
    expect(within(postingsSheet).getByTestId('micro-lens-context')).toHaveTextContent(
      /1\.12 open roles available per active job seeker/i
    );
    expect(within(postingsSheet).getAllByText(/Seeker Focus/i).length).toBeGreaterThanOrEqual(1);
  });

  it('supports switching macro metrics directly inside the micro sheet and closing via Escape or backdrop', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('metric-card-hires'));
    const sheet = screen.getByTestId('micro-drilldown-sheet');
    expect(within(sheet).getByRole('heading', { name: 'US Monthly Hires' })).toBeInTheDocument();

    // Switch to Layoffs from inside the sheet footer
    fireEvent.click(within(sheet).getByTestId('switch-metric-layoffs'));
    expect(within(sheet).getByRole('heading', { name: 'Layoffs & Discharges' })).toBeInTheDocument();

    // Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('micro-drilldown-sheet')).not.toBeInTheDocument();

    // Reopen and close via backdrop click
    fireEvent.click(screen.getByTestId('metric-card-us_population'));
    expect(screen.getByTestId('micro-drilldown-sheet')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('micro-sheet-backdrop'));
    expect(screen.queryByTestId('micro-drilldown-sheet')).not.toBeInTheDocument();
  });
});
