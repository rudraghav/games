import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { authFailure, type AccountNotice } from '@/lib/account-auth';

export async function GET(request: NextRequest) {
  const finish = (confirmation: AccountNotice) => {
    // A relative Location preserves the browser origin behind local/Vercel proxies.
    const response = new NextResponse(null, {
      status: 307,
      headers: { Location: `/profile?confirmation=${confirmation}` },
    });
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  };
  const providerError = request.nextUrl.searchParams.get('error');
  if (providerError)
    return finish(
      authFailure(request.nextUrl.searchParams.get('error_code') || undefined, providerError),
    );
  const code = request.nextUrl.searchParams.get('code');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !code) return finish('failed');
  const jar = await cookies();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value, options }) => jar.set(name, value, options));
      },
    },
  });
  const { error } = await client.auth.exchangeCodeForSession(code);
  return finish(error ? authFailure(error.code) : 'connected');
}
