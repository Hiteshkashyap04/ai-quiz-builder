import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { backendRequest, BackendApiError } from '@/lib/backend';

async function getBackendToken(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.backendAccessToken || null;
}

export async function GET(request, { params }) {
  try {
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await backendRequest(`/quizzes/${params.quizId}`, {
      token: backendToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 500;
    return NextResponse.json({ error: error.message || 'Could not load quiz.' }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await backendRequest(`/quizzes/${params.quizId}`, {
      method: 'DELETE',
      token: backendToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 500;
    return NextResponse.json({ error: error.message || 'Could not delete quiz.' }, { status });
  }
}
