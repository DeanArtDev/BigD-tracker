/** Provides wall-clock and monotonic time to the logger. */
interface ObservabilityClock {
  /** Current wall-clock time used for the log timestamp. */
  now(): Date;

  /** Monotonic milliseconds used to measure operation duration. */
  monotonicNow(): number;
}

const systemObservabilityClock: ObservabilityClock = {
  now: () => new Date(),
  monotonicNow: () => performance.now(),
};

export { type ObservabilityClock, systemObservabilityClock };
