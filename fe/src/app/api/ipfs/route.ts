import { NextRequest, NextResponse } from 'next/server';

// POST /api/ipfs
// - multipart/form-data with field "file" -> pinFileToIPFS
// - application/json with body { data: any } -> pinJSONToIPFS
export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ error: 'Missing server env PINATA_JWT' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (typeof body !== 'object' || body === null || typeof body.data === 'undefined') {
        return NextResponse.json({ error: 'Invalid JSON body. Expected { data: ... }' }, { status: 400 });
      }
      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pinataContent: body.data }),
      });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: `Pinata error: ${res.status} ${text}` }, { status: 502 });
      }
      const data = await res.json();
      const hash = data.IpfsHash as string;
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      return NextResponse.json({ cid: hash, url });
    }

    // Default: assume multipart/form-data for file upload
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const forward = new FormData();
    forward.append('file', file, (file as any).name || 'upload');
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: forward,
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Pinata error: ${res.status} ${text}` }, { status: 502 });
    }
    const data = await res.json();
    const hash = data.IpfsHash as string; // Pinata returns IpfsHash
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    return NextResponse.json({ cid: hash, url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
