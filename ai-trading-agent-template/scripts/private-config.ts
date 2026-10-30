import { getAddress, Wallet } from "ethers";

/** Read deployment configuration without logging secret values. */
export function requiredAddress(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} for your deployment`);
  try {
    return getAddress(value);
  } catch {
    throw new Error(`${name} must be a valid contract address`);
  }
}

export function requiredPrivateKey(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} to a privately generated wallet key`);
  try {
    // Validate both encoding and curve range, without revealing the input.
    new Wallet(value);
    return value;
  } catch {
    throw new Error(`${name} must be a valid wallet private key`);
  }
}
