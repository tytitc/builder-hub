import { stringToHex, keccak256, toHex } from "viem";

/**
 * Your Base Builder Code: bc_kyt7kkbw
 * The suffix is 'kyt7kkbw'
 */
export const APP_BUILDER_CODE = "kyt7kkbw";
export const APP_BUILDER_CODE_HEX = stringToHex(APP_BUILDER_CODE).slice(2);

/**
 * Generates a Builder Code based on an app name or ID.
 */
export function generateBuilderCode(appId: string): string {
  const hash = keccak256(toHex(appId));
  return hash.slice(2, 10);
}

/**
 * Appends the hex-encoded builder code to the end of transaction data.
 */
export function appendBuilderCode(data: string): string {
  const cleanData = data.startsWith("0x") ? data : "0x" + data;
  return cleanData + APP_BUILDER_CODE_HEX;
}
