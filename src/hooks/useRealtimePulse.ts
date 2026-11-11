import { useState, useEffect, useCallback, useMemo } from 'react';
import { LivePulseMode, USLaborMarketSnapshot } from '../types/labor';

export interface RealtimePulseState {
  mode: LivePulseMode;
  elapsedSessionSeconds: number;
  hiresDelta: number;
  layoffsDelta: number;
  postingsDelta: number;
  netWorkforceFlow: number;
  resetSession: () => void;
}

function getSecondsSinceMidnight(now: Date): number {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((now.getTime() - startOfDay.getTime()) / 1000));
}

/**
 * Computes real-time US labor flow counts from verified per-second BLS/JOLTS run-rates.
 */
export function useRealtimePulse(
  runRates: USLaborMarketSnapshot['runRatesPerSecond'],
  mode: LivePulseMode,
  tickIntervalMs = 500
): RealtimePulseState {
  const [sessionStartMs, setSessionStartMs] = useState<number>(() => Date.now());
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (mode === 'snapshot') return;

    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, tickIntervalMs);

    return () => window.clearInterval(timer);
  }, [mode, tickIntervalMs]);

  const resetSession = useCallback(() => {
    const now = Date.now();
    setSessionStartMs(now);
    setNowMs(now);
  }, []);

  return useMemo(() => {
    const elapsedSessionSeconds = Math.max(0, (nowMs - sessionStartMs) / 1000);

    if (mode === 'snapshot') {
      return {
        mode,
        elapsedSessionSeconds: 0,
        hiresDelta: 0,
        layoffsDelta: 0,
        postingsDelta: 0,
        netWorkforceFlow: 0,
        resetSession,
      };
    }

    const activeSeconds =
      mode === 'today'
        ? getSecondsSinceMidnight(new Date(nowMs))
        : elapsedSessionSeconds;

    const hiresDelta = Math.floor(activeSeconds * runRates.hires);
    const layoffsDelta = Math.floor(activeSeconds * runRates.layoffs);
    const postingsDelta = Math.floor(activeSeconds * runRates.postingsAdded);
    const netWorkforceFlow = hiresDelta - layoffsDelta;

    return {
      mode,
      elapsedSessionSeconds: Math.floor(elapsedSessionSeconds),
      hiresDelta,
      layoffsDelta,
      postingsDelta,
      netWorkforceFlow,
      resetSession,
    };
  }, [mode, nowMs, sessionStartMs, runRates, resetSession]);
}
