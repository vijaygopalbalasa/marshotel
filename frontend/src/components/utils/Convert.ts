import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { BN, Provider, fromTai64ToUnix } from 'fuels';

export function base58ToHex(base58String: string): string {
    const bytes = bs58.decode(base58String);
    return Buffer.from(bytes).toString('hex');
}

export function hexToBase58(hexString: string): string {
    const bytes = Buffer.from(hexString, 'hex');
    return bs58.encode(bytes);
}

export async function convertToTimestamp(date: string) {
    const dateData = new Date(date);
    const provider = await Provider.create('https://beta-5.fuel.network/graphql');
    const block = await provider.getBlock('latest');
    if (block) {
    console.log(fromTai64ToUnix(block.time));
    }

    return Math.floor((dateData.getTime())/1000);
  }

// Convert timestamp (BN) to formatted Date and Time string
export function convertBNToDate(timestampBN: BN | undefined): string | null {
  // Check if timestampBN is undefined
  if (timestampBN === undefined) {
    return null;
  }
  // Convert the BN to a numeric value 
  const numericValueInMilliseconds = (Number(timestampBN.toString(10))) * 1000;
  const dateObject = new Date(numericValueInMilliseconds); 
  // Format the date and time using toLocaleString with appropriate options
  return dateObject.toLocaleString('en-US');
  } 
