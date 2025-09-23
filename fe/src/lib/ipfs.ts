export async function uploadToIPFS(file: File): Promise<string> {
  // Web3.Storage temporarily disabled; always route via Pinata-backed API
  // const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  // if (token) { /* ... web3.storage upload here ... */ }

  return await uploadViaPinata(file);
}

async function uploadViaPinata(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await fetch('/api/ipfs', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IPFS upload (Pinata) failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.url as string;
}
