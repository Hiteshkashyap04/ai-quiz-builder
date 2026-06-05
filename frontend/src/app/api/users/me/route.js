import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { backendRequest, BackendApiError } from '@/lib/backend';

async function getBackendToken(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.backendAccessToken || null;
}

export async function GET(request) {
  try {
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await backendRequest('/users/me', {
      token: backendToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 500;
    return NextResponse.json({ error: error.message || 'Could not load profile.' }, { status });
  }
}

export async function PUT(request) {
  try {
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const data = await backendRequest('/users/me', {
      method: 'PUT',
      token: backendToken,
      body: payload,
    });

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 500;
    return NextResponse.json({ error: error.message || 'Could not update profile.' }, { status });
  }
}
