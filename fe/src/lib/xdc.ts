// src/lib/xdc.ts
// Helper utilities for interacting with the XDC network using xdc3 (Web3-compatible)
// Usage is server-side only to avoid bundling Node polyfills in the client.

// We import with require to avoid potential ESM/CJS interop issues in Next server runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XDC3 = require('xdc3');

export type XdcConnectionInfo = {
  rpcUrl: string;
  chainId: number;
  network: 'mainnet' | 'apothem';
};

export function getXdcConnection(): XdcConnectionInfo {
  const envUrl = process.env.XDC_RPC_URL?.trim();
  const chainIdEnv = process.env.XDC_CHAIN_ID?.trim();

  // Defaults to Apothem testnet if not provided
  const defaultUrl = 'https://erpc.apothem.network';
  const rpcUrl = envUrl && envUrl.length > 0 ? envUrl : defaultUrl;

  // chainId 50 = mainnet, 51 = apothem
  const chainId = chainIdEnv ? Number(chainIdEnv) : 51;
  const network = chainId === 50 ? 'mainnet' : 'apothem';

  return { rpcUrl, chainId, network };
}

export function getXdcWeb3() {
  const { rpcUrl } = getXdcConnection();
  const web3 = new XDC3(rpcUrl);
  return web3;
}

export async function getCurrentBlockNumber(): Promise<number> {
  const web3 = getXdcWeb3();
  const blockNumber = await web3.eth.getBlockNumber();
  return Number(blockNumber);
}
