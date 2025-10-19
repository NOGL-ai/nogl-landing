/**
 * Chart Scaling Utilities
 * 
 * Best practices for calculating chart dimensions to prevent overflow
 * and ensure proper data visualization in stacked bar charts.
 * 
 * @module chart-scaling
 * @see docs/design-system/CHART_IMPLEMENTATION_GUIDE.md
 */

/**
 * Generic stacked bar data point with numeric values.
 * Allows any object structure with string or number values.
 */
export type StackedBarData = Record<string, number | string>;

/**
 * Configuration options for chart scaling calculations
 */
export interface ScalingOptions {
	/**
	 * Fixed maximum value for the scale (optional).
	 * If provided with 'fixed' strategy, this value is used regardless of data.
	 */
	maxValue?: number;
	
	/**
	 * Padding multiplier to add breathing room at the top of charts.
	 * Default: 1.0 (no padding)
	 * Example: 1.1 = 10% padding above max value
	 */
	padding?: number;
	
	/**
	 * Minimum scale value to ensure small values are visible.
	 * Default: 0
	 */
	minScale?: number;
	
	/**
	 * Scaling strategy to use:
	 * - 'dynamic': Adapts to data range (recommended for unknown ranges)
	 * - 'fixed': Uses predefined maxValue (best for consistent scales)
	 * - 'hybrid': Combines both approaches (production recommended)
	 * 
	 * Default: 'dynamic'
	 */
	strategy?: 'dynamic' | 'fixed' | 'hybrid';
}

/**
 * Calculates the maximum value for stacked bar charts.
 * 
 * This function prevents the common overflow bug where individual segment
 * maximums are used instead of stacked totals, causing bars to exceed
 * their container height.
 * 
 * @example
 * ```typescript
 * // Correct usage for stacked bars
 * const data = [
 *   { month: 'Jan', low: 48, mid: 97, high: 145 },
 *   { month: 'Feb', low: 57, mid: 116, high: 177 }
 * ];
 * 
 * const maxValue = calculateStackedMaxValue(
 *   data,
 *   ['low', 'mid', 'high'],
 *   { strategy: 'dynamic', padding: 1.05 }
 * );
 * // Result: 365.75 (350 * 1.05)
 * // Prevents overflow: max total (350) + 5% padding
 * ```
 * 
 * @example
 * ```typescript
 * // ❌ WRONG - causes overflow
 * const maxValue = Math.max(...data.flatMap(d => [d.low, d.mid, d.high]));
 * // Result: 177 (just the largest segment)
 * // Problem: Total can be 350, causing 197% overflow!
 * ```
 * 
 * @param data Array of data points containing numeric values
 * @param valueKeys Array of keys representing the values to stack
 * @param options Scaling configuration options
 * @returns Safe maximum value that prevents overflow
 * 
 * @throws {Error} If data array is empty
 * @throws {Error} If valueKeys array is empty
 */
export function calculateStackedMaxValue<T extends Record<string, unknown>>(
	data: T[],
	valueKeys: (keyof T)[],
	options: ScalingOptions = {}
): number {
	// Validation
	if (!data || data.length === 0) {
		throw new Error('calculateStackedMaxValue: data array cannot be empty');
	}
	
	if (!valueKeys || valueKeys.length === 0) {
		throw new Error('calculateStackedMaxValue: valueKeys array cannot be empty');
	}
	
	// Calculate totals for each data point
	const totals = data.map(item => {
		return valueKeys.reduce((sum, key) => {
			const value = item[key];
			// Only sum numeric values
			return sum + (typeof value === 'number' ? value : 0);
		}, 0);
	});
	
	// Find maximum total across all data points
	const dataMax = Math.max(...totals, 0);
	
	// Apply selected strategy
	const strategy = options.strategy ?? 'dynamic';
	
	let calculatedMax: number;
	
	switch (strategy) {
		case 'fixed': {
			// Use fixed maxValue if provided, otherwise fall back to data max
			calculatedMax = options.maxValue ?? dataMax;
			break;
		}
		
		case 'hybrid': {
			// Take the larger of fixed max and data max, then apply padding
			const baseMax = options.maxValue 
				? Math.max(dataMax, options.maxValue)
				: dataMax;
			calculatedMax = baseMax * (options.padding ?? 1.1);
			break;
		}
		
		case 'dynamic':
		default: {
			// Use data max with optional padding
			calculatedMax = dataMax * (options.padding ?? 1);
			break;
		}
	}
	
	// Ensure minimum scale if specified
	const finalMax = Math.max(calculatedMax, options.minScale ?? 0);
	
	return finalMax;
}

/**
 * Calculates safe height percentage for a stacked bar segment.
 * 
 * This function ensures the calculated height never exceeds 100%,
 * preventing overflow even with edge cases or floating point errors.
 * 
 * @example
 * ```typescript
 * const maxValue = 350;
 * const cumulativeValue = 145; // Just premium segment
 * 
 * const height = calculateBarHeight(cumulativeValue, maxValue);
 * // Result: 41.43% (safe, no overflow)
 * ```
 * 
 * @example
 * ```typescript
 * // Edge case: value equals max
 * const height = calculateBarHeight(350, 350);
 * // Result: 100% (capped, safe)
 * ```
 * 
 * @param value The cumulative value up to and including this segment
 * @param maxValue The maximum scale value (from calculateStackedMaxValue)
 * @returns Height as percentage (0-100), safe for CSS
 */
export function calculateBarHeight(
	value: number,
	maxValue: number
): number {
	// Handle edge cases
	if (maxValue === 0) return 0;
	if (value <= 0) return 0;
	
	// Calculate percentage and cap at 100%
	const percentage = (value / maxValue) * 100;
	return Math.min(percentage, 100);
}

/**
 * Type guard to check if a value is a valid number for charting.
 * 
 * @param value Value to check
 * @returns True if value is a finite number
 */
export function isValidChartNumber(value: unknown): value is number {
	return typeof value === 'number' && isFinite(value);
}

/**
 * Safely extracts numeric values from data for charting.
 * Filters out non-numeric values and returns only valid numbers.
 * 
 * @param data Array of data points
 * @param keys Keys to extract values from
 * @returns Array of numeric values
 */
export function extractNumericValues<T extends Record<string, unknown>>(
	data: T[],
	keys: (keyof T)[]
): number[] {
	const values: number[] = [];
	
	data.forEach(item => {
		keys.forEach(key => {
			const value = item[key];
			if (isValidChartNumber(value)) {
				values.push(value);
			}
		});
	});
	
	return values;
}

