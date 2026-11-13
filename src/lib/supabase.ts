import { createClient, type User } from '@supabase/supabase-js';
import type { CitizenCheckInRecord, CitizenTallySummary, UnemploymentDurationBracket } from '../types/labor';
import { INITIAL_CITIZEN_TALLY } from '../data/citizenBaseline';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Ensure base URL without trailing slash or /rest/v1 path
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get the currently authenticated Supabase user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Subscribe to Supabase auth state changes (e.g. OAuth redirect or magic link return)
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => {
    data.subscription.unsubscribe();
  };
}

/**
 * Send a passwordless Email Magic Link via Supabase Auth
 */
export async function signInWithEmailMagicLink(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Database not configured.' };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  return { error: error ? error.message : null };
}

/**
 * Sign in with Google OAuth via Supabase Auth
 */
export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Database not configured.' };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { error: error ? error.message : null };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Record a citizen check-in in Supabase (requires authenticated user when Supabase is active)
 */
export async function submitCitizenCheckInToDb(
  record: CitizenCheckInRecord,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const payload: Record<string, unknown> = {
      status: record.status,
      industry: record.targetIndustry || null,
      duration: record.duration || null,
      state: record.state || null,
    };

    if (userId) {
      // Try upsert on user_id first (1 verified check-in per account)
      const { error: upsertErr } = await supabase
        .from('check_ins')
        .upsert({ ...payload, user_id: userId }, { onConflict: 'user_id' });

      if (!upsertErr) {
        return { success: true };
      }

      // If user_id column doesn't exist yet in table, fall back to standard insert
      if (upsertErr.message.includes('user_id')) {
        const { error: insertErr } = await supabase.from('check_ins').insert([payload]);
        if (insertErr) {
          console.warn('[Supabase] Insert check-in failed:', insertErr.message);
          return { success: false, error: insertErr.message };
        }
        return { success: true };
      }

      console.warn('[Supabase] Upsert check-in failed:', upsertErr.message);
      return { success: false, error: upsertErr.message };
    }

    const { error } = await supabase.from('check_ins').insert([payload]);
    if (error) {
      console.warn('[Supabase] Insert check-in failed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Network/submission error:', err);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Fetch live crowdsourced check-in counts from Supabase
 * Merges with the base representative sample pool for high-fidelity percentages
 */
export async function fetchLiveCitizenTally(): Promise<CitizenTallySummary> {
  if (!supabase) return INITIAL_CITIZEN_TALLY;

  try {
    // 1. Fetch total count
    const { count: dbTotal, error: countErr } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true });

    if (countErr || dbTotal === null || dbTotal === 0) {
      return INITIAL_CITIZEN_TALLY;
    }

    // 2. Fetch all rows (for aggregates)
    const { data: rows, error: rowsErr } = await supabase
      .from('check_ins')
      .select('status, industry, duration');

    if (rowsErr || !rows || rows.length === 0) {
      return INITIAL_CITIZEN_TALLY;
    }

    // Calculate aggregated counts on top of base sample
    let dbWorkingFt = 0;
    let dbWorkingPt = 0;
    let dbLooking = 0;

    const durationCounts: Record<UnemploymentDurationBracket, number> = {
      '< 5w': 0,
      '5-14w': 0,
      '15-26w': 0,
      '27+w': 0,
    };

    const industryCounts: Record<string, number> = {};

    rows.forEach((row) => {
      if (row.status === 'working_fulltime') dbWorkingFt++;
      else if (row.status === 'working_parttime') dbWorkingPt++;
      else if (row.status === 'not_working_looking') dbLooking++;

      if (row.duration && durationCounts[row.duration as UnemploymentDurationBracket] !== undefined) {
        durationCounts[row.duration as UnemploymentDurationBracket]++;
      }

      if (row.industry) {
        industryCounts[row.industry] = (industryCounts[row.industry] || 0) + 1;
      }
    });

    const combinedTotal = INITIAL_CITIZEN_TALLY.totalCheckIns + rows.length;
    const combinedFt = INITIAL_CITIZEN_TALLY.fullTimeCount + dbWorkingFt;
    const combinedPt = INITIAL_CITIZEN_TALLY.partTimeCount + dbWorkingPt;
    const combinedWorking = combinedFt + combinedPt;
    const combinedLooking = INITIAL_CITIZEN_TALLY.lookingCount + dbLooking;

    const combinedDuration: Record<UnemploymentDurationBracket, number> = {
      '< 5w': INITIAL_CITIZEN_TALLY.durationBreakdown['< 5w'] + durationCounts['< 5w'],
      '5-14w': INITIAL_CITIZEN_TALLY.durationBreakdown['5-14w'] + durationCounts['5-14w'],
      '15-26w': INITIAL_CITIZEN_TALLY.durationBreakdown['15-26w'] + durationCounts['15-26w'],
      '27+w': INITIAL_CITIZEN_TALLY.durationBreakdown['27+w'] + durationCounts['27+w'],
    };

    // Recalculate industry demand with live submissions
    const combinedIndustryDemand = INITIAL_CITIZEN_TALLY.industryDemand.map((ind) => {
      const dbIndCount = industryCounts[ind.industryId] || 0;
      const newCount = ind.count + dbIndCount;
      return {
        ...ind,
        count: newCount,
        demandPercentage: combinedLooking > 0 ? (newCount / combinedLooking) * 100 : ind.demandPercentage,
      };
    });

    return {
      totalCheckIns: combinedTotal,
      workingCount: combinedWorking,
      workingPercentage: (combinedWorking / combinedTotal) * 100,
      fullTimeCount: combinedFt,
      partTimeCount: combinedPt,
      lookingCount: combinedLooking,
      lookingPercentage: (combinedLooking / combinedTotal) * 100,
      durationBreakdown: combinedDuration,
      industryDemand: combinedIndustryDemand,
    };
  } catch (err) {
    console.warn('[Supabase] Failed to fetch live tally:', err);
    return INITIAL_CITIZEN_TALLY;
  }
}
