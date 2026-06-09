/**
 * Utility functions for currency calculations and Arabic formatting
 * supporting the Al-Muthanna real estate platform.
 */

/**
 * Formats millions of IQD into Arabic locale string representation.
 * @param millionsIQD Value in millions of Iraqi Dinars (e.g., 250 means 250,000,000 IQD)
 */
export function formatIQD(millionsIQD: number): string {
  if (!millionsIQD || millionsIQD <= 0) return 'خاضع للتفاوض';
  const localized = millionsIQD.toLocaleString('ar-IQ');
  return `${localized} مليون د.ع`;
}

/**
 * Formats USD value into localized US format with dollar sign.
 * @param usdValue Value in US Dollars (e.g., 150000)
 */
export function formatUSD(usdValue: number): string {
  if (!usdValue || usdValue <= 0) return 'خاضع للتفاوض';
  const localized = usdValue.toLocaleString('en-US');
  return `$${localized}`;
}

/**
 * Converts dynamic millions IQD valuation back to USD based on regional exchange rate.
 * @param millionsIQD Iraqi Dinars in Millions
 * @param exchangeRate Exchange rate (default: 1530)
 */
export function convertIQDToUSD(millionsIQD: number, exchangeRate: number = 1530): number {
  if (!millionsIQD || millionsIQD <= 0) return 0;
  const rawIQD = millionsIQD * 1000000;
  return Math.round(rawIQD / exchangeRate);
}

/**
 * Converts USD value to Iraqi Dinar equivalent in Millions.
 * @param usdValue US Dollars value
 * @param exchangeRate Exchange rate (default: 1530)
 */
export function convertUSDToIQD(usdValue: number, exchangeRate: number = 1530): number {
  if (!usdValue || usdValue <= 0) return 0;
  const rawIQD = usdValue * exchangeRate;
  return Math.round(rawIQD / 1000000); // returns in millions
}
