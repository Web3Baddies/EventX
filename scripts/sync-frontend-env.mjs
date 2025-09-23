#!/usr/bin/env node
/*
Sync fe/.env.local with latest XDC Apothem deployment
- Reads smart-contract/ignition/deployments/chain-51/deployed_addresses.json
- Falls back to deployments/ticket-xdc-apothem.json if present
- Writes/updates fe/.env.local with:
  NEXT_PUBLIC_CONTRACT_ADDRESS
  NEXT_PUBLIC_CHAIN_ID=51
  NEXT_PUBLIC_RPC_URL=https://erpc.apothem.network
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = dirname(__dirname);
const ignitionPath = join(repoRoot, 'smart-contract', 'ignition', 'deployments', 'chain-51', 'deployed_addresses.json');
const altDeployPath = join(repoRoot, 'smart-contract', 'deployments', 'ticket-xdc-apothem.json');
const envPath = join(repoRoot, 'fe', '.env.local');

function readAddress() {
  try {
    if (existsSync(ignitionPath)) {
      const j = JSON.parse(readFileSync(ignitionPath, 'utf8'));
      if (j && j['TicketModule#Ticket']) return j['TicketModule#Ticket'];
    }
  } catch {}
  try {
    if (existsSync(altDeployPath)) {
      const j = JSON.parse(readFileSync(altDeployPath, 'utf8'));
      if (j?.contracts?.Ticket?.address) return j.contracts.Ticket.address;
    }
  } catch {}
  return null;
}

function upsertEnv(lines, key, value) {
  const idx = lines.findIndex(l => l.trim().startsWith(`${key}=`));
  const line = `${key}=${value}`;
  if (idx >= 0) lines[idx] = line; else lines.push(line);
}

function main() {
  const address = readAddress();
  if (!address) {
    console.error('Could not find deployed address. Run the deployment first.');
    process.exit(1);
  }

  let lines = [];
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    lines = content.split(/\r?\n/).filter(Boolean);
  }

  upsertEnv(lines, 'NEXT_PUBLIC_CONTRACT_ADDRESS', address);
  upsertEnv(lines, 'NEXT_PUBLIC_CHAIN_ID', '51');
  upsertEnv(lines, 'NEXT_PUBLIC_RPC_URL', 'https://erpc.apothem.network');

  // Ensure fe directory exists (it should)
  try { mkdirSync(dirname(envPath), { recursive: true }); } catch {}
  writeFileSync(envPath, lines.join('\n') + '\n');

  console.log('Updated fe/.env.local with:');
  console.log('  NEXT_PUBLIC_CONTRACT_ADDRESS=', address);
  console.log('  NEXT_PUBLIC_CHAIN_ID=51');
  console.log('  NEXT_PUBLIC_RPC_URL=https://erpc.apothem.network');
}

main();
