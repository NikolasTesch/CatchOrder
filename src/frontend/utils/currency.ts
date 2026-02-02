/**
 * Currency Conversion Utilities
 * Backend stores values in cents (1 BRL = 100 cents)
 */

/**
 * Convert cents to reais (display format)
 * @param cents - Value in cents (e.g., 500)
 * @returns Formatted string (e.g., "5.00")
 */
export function centsToReais(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Convert cents to currency display with R$ symbol
 * @param cents - Value in cents (e.g., 500)
 * @returns Formatted currency (e.g., "R$ 5,00")
 */
export function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Convert reais to cents (for API requests)
 * @param reais - Value in reais (e.g., 5.00)
 * @returns Value in cents (e.g., 500)
 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Parse user input (string) to cents
 * @param input - User input string (e.g., "5.00" or "5,00")
 * @returns Value in cents (e.g., 500)
 */
export function parseInputToCents(input: string): number {
  const normalized = input.replace(',', '.');
  const reais = parseFloat(normalized);
  return isNaN(reais) ? 0 : Math.round(reais * 100);
}
