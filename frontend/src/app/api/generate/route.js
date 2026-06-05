import { NextResponse } from 'next/server';
import { backendRequest, BackendApiError } from '@/lib/backend';

export async function POST(request) {
  try {
    const payload = await request.json();
    const data = await backendRequest('/generate-quiz', {
      method: 'POST',
      body: {
        title: payload.topic || payload.title || '',
        prompt: payload.topic || payload.prompt || payload.title || '',
        max_questions: Number(payload.num_questions || payload.max_questions || 5),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 500;
    return NextResponse.json({ error: error.message || 'Could not generate quiz.' }, { status });
  }
}
