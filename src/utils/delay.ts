/**
 * Delays execution for a given number of milliseconds.
 * @param ms Milliseconds to delay.
 * @returns Promise that resolves after the specified delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
