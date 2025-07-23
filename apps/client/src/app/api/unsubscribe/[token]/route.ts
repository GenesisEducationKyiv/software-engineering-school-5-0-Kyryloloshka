import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${backendUrl}/api/unsubscribe/${token}`);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Proxy error', details: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 