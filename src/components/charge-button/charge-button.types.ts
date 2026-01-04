/**
 * Types for virtual-charge-button component.
 */

export type ChargeButtonTheme = 'modern' | 'pixel-art' | 'custom';

export interface ChargeButtonOptions {
  /** Visual theme (default: 'modern') */
  theme?: ChargeButtonTheme;
  /** Size in pixels (default: 64) */
  size?: number;
  /** Time to fully charge in ms (default: 800) */
  chargeTime?: number;
  /** Show percentage text (default: false) */
  showPercentage?: boolean;
  /** Minimum charge to activate (default: 0) */
  minCharge?: number;
}

export interface ChargeStartData {
  /** Timestamp when charge started */
  timestamp: number;
}

export interface ChargeUpdateData {
  /** Charge percentage 0-100 */
  percent: number;
  /** Current color based on charge level */
  color: string;
  /** Timestamp */
  timestamp: number;
}

export interface ChargeReleaseData {
  /** Final charge percentage */
  percent: number;
  /** Whether charge was above minimum threshold */
  activated: boolean;
  /** Total charge duration in ms */
  duration: number;
  /** Timestamp */
  timestamp: number;
}

export type ChargeButtonEvents = {
  'charge-start': CustomEvent<ChargeStartData>;
  'charge-update': CustomEvent<ChargeUpdateData>;
  'charge-release': CustomEvent<ChargeReleaseData>;
};

declare global {
  interface HTMLElementEventMap extends ChargeButtonEvents {}
}
