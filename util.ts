import {
    decodeCashAddressFormat,
    decodeCashAddressFormatWithoutPrefix,
  } from "@bitauth/libauth";

/**
 * Helper function to convert an address to a public key hash
 *
 * @param address   Address to convert to a hash
 *
 * @returns a public key hash corresponding to the passed address
 */
 export function derivePublicKeyHash(address: string): Uint8Array {
    let result;
  
    // If the address has a prefix decode it as is
    if (address.includes(":")) {
      result = decodeCashAddressFormat(address);
    }
    // otherwise, derive the network from the address without prefix
    else {
      result = decodeCashAddressFormatWithoutPrefix(address);
    }
  
    if (typeof result === "string") throw new Error(result);
  
    // return the public key hash
    return result.hash;
  }