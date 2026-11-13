import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { CitizenCheckInModal } from '../src/components/CitizenCheckInModal';

vi.mock('../src/lib/supabase', async () => {
  const actual = await vi.importActual<typeof import('../src/lib/supabase')>('../src/lib/supabase');
  return {
    ...actual,
    isSupabaseConfigured: false,
    getCurrentUser: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn().mockReturnValue(() => {}),
    fetchLiveCitizenTally: vi.fn().mockImplementation(async () => {
      const { INITIAL_CITIZEN_TALLY } = await import('../src/data/citizenBaseline');
      return INITIAL_CITIZEN_TALLY;
    }),
    submitCitizenCheckInToDb: vi.fn().mockResolvedValue({ success: true }),
    signInWithEmailMagicLink: vi.fn().mockResolvedValue({ error: null }),
    signInWithGoogleOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOutUser: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Phase 5 - Live Citizen Check-In & Benchmark Barometer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the Live Citizen Labor Barometer on the front dashboard', () => {
    render(<App />);

    expect(screen.getByTestId('citizen-pulse-bar')).toBeInTheDocument();
    expect(screen.getByText(/Live Citizen Labor Barometer/i)).toBeInTheDocument();
    expect(screen.getByText(/Crowdsourced Sample/i)).toBeInTheDocument();
    expect(screen.getByTestId('log-citizen-status-btn')).toHaveTextContent('Log Your Status');
  });

  it('opens CitizenCheckInModal and supports the check-in flow when verified/offline', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('log-citizen-status-btn'));
    expect(screen.getByTestId('citizen-checkin-modal')).toBeInTheDocument();

    // Select Not Working (Looking)
    fireEvent.click(screen.getByTestId('status-opt-looking'));
    // Select duration < 5 weeks
    expect(screen.getByTestId('duration-opt-<5w')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('duration-opt-<5w'));

    // Move to Step 2
    fireEvent.click(screen.getByTestId('checkin-next-btn'));

    // Select target industry and optional state
    fireEvent.change(screen.getByTestId('select-target-industry'), { target: { value: 'tech' } });
    fireEvent.change(screen.getByTestId('select-state'), { target: { value: 'TX' } });

    // Simulate 1-tap Google/Apple verification
    fireEvent.click(screen.getByTestId('simulate-verify-btn'));
    expect(screen.getByText(/Verified Human/i)).toBeInTheDocument();

    // Submit check-in
    fireEvent.click(screen.getByTestId('checkin-submit-btn'));
    expect(screen.queryByTestId('citizen-checkin-modal')).not.toBeInTheDocument();

    // Check user active status badge
    expect(screen.getByTestId('user-active-badge')).toHaveTextContent('You: Searching');
    expect(screen.getByTestId('log-citizen-status-btn')).toHaveTextContent('Update My Status');

    // Stored in localStorage
    const saved = JSON.parse(window.localStorage.getItem('usjp_citizen_record') || '{}');
    expect(saved.status).toBe('not_working_looking');
    expect(saved.state).toBe('TX');
    expect(saved.targetIndustry).toBe('tech');
    expect(saved.verificationTier).toBe('verified_citizen');
  });

  it('renders verified user email badge when authenticated with Supabase User', () => {
    const mockUser = {
      id: 'user-123',
      email: 'citizen@usjobpulse.dev',
    } as import('@supabase/supabase-js').User;

    render(
      <CitizenCheckInModal
        isOpen={true}
        onClose={() => {}}
        currentRecord={null}
        authUser={mockUser}
        onSignOut={() => {}}
        onSubmitCheckIn={() => {}}
      />
    );

    expect(screen.getByText(/Verified: citizen@usjobpulse.dev/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-opt-looking')).toBeInTheDocument();
  });

  it('toggles the Citizen Desire vs BLS Openings Mismatch comparison panel', () => {
    render(<App />);

    expect(screen.queryByTestId('mismatch-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('toggle-mismatch-btn'));
    const mismatchPanel = screen.getByTestId('mismatch-panel');
    expect(mismatchPanel).toBeInTheDocument();
    expect(mismatchPanel).toHaveTextContent(/Technology & Information/i);
    expect(mismatchPanel).toHaveTextContent(/Citizen Desire/i);
    expect(mismatchPanel).toHaveTextContent(/BLS Openings Supply/i);

    // Toggle back to collapse
    fireEvent.click(screen.getByTestId('toggle-mismatch-btn'));
    expect(screen.queryByTestId('mismatch-panel')).not.toBeInTheDocument();
  });
});
