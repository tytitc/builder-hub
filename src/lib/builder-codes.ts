import { encodePacked, keccak256, toHex } from "viem";

/**
 * Generates a Builder Code based on an app name or ID.
 * Following the Base Builder Code specification (ERC-8021 or legacy).
 * For simplicity in this demo, we'll use a consistent hash-based code.
 */
import { stringToHex } from "viem";

/**
 * Your Base Builder Code: bc_kyt7kkbw
 * The suffix is 'kyt7kkbw'
 * In hex, 'kyt7kkbw' becomes '6b7974376b6b6277'
 */
export const APP_BUILDER_CODE_SUFFIX = "kyt7kkbw";
export const APP_BUILDER_CODE_HEX = stringToHex(APP_BUILDER_CODE_SUFFIX).slice(2); // removes '0x'

/**
 * Appends the hex-encoded builder code to the end of transaction data.
 * This is the standard way to attribute activity on Base.
 */
export function appendBuilderCode(data: string): string {
  const cleanData = data.startsWith("0x") ? data : "0x" + data;
  return cleanData + APP_BUILDER_CODE_HEX;
}
