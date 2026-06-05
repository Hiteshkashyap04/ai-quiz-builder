import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function getUserId(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub || null;
}

export async function POST(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const score = Number(payload.score || 0);

    const quiz = await prisma.quiz.findFirst({
      where: { id: params.quizId, ownerId: userId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.quizResult.create({
      data: {
        quizId: quiz.id,
        userId,
        score,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not save score.' }, { status: 500 });
  }
}
