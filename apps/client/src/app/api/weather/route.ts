import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'Kyiv';

  const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/weather?city=${encodeURIComponent(city)}`;

  const res = await fetch(backendUrl);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
