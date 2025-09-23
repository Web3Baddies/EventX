import { NextResponse } from 'next/server'
import { getCurrentBlockNumber, getXdcConnection } from '@/lib/xdc'

export async function GET() {
  try {
    const { network, chainId, rpcUrl } = getXdcConnection()
    const height = await getCurrentBlockNumber()

    return NextResponse.json({
      ok: true,
      network,
      chainId,
      rpcUrl,
      height,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
