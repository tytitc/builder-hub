import { encodePacked, keccak256, toHex } from "viem";

/**
 * Generates a Builder Code based on an app name or ID.
 * Following the Base Builder Code specification (ERC-8021 or legacy).
 * For simplicity in this demo, we'll use a consistent hash-based code.
 */
export function generateBuilderCode(appId: string): string {
  // Simple deterministic 8-character hex code from appId
  const hash = keccak256(toHex(appId));
  return hash.slice(2, 10); // 8 hex chars
}

/**
 * Appends a builder code to transaction data.
 * @param data The original transaction data hex
 * @param builderCode The 8-character hex builder code
 */
export function appendBuilderCode(data: string, builderCode: string): string {
  // Ensure data starts with 0x
  const cleanData = data.startsWith("0x") ? data : "0x" + data;
  return cleanData + builderCode;
}

export const APP_BUILDER_CODE = generateBuilderCode("base-builder-hub");
