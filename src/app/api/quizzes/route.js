import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function getUserId(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub || null;
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        results: {
          where: { userId },
          orderBy: { score: 'desc' },
          take: 1,
        },
      },
    });

    const data = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      content: quiz.content,
      createdAt: quiz.createdAt,
      bestScore: quiz.results[0]?.score ?? null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not load quizzes.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const quiz = await prisma.quiz.create({
      data: {
        ownerId: userId,
        title: payload.title,
        description: payload.description || null,
        content: payload.content || '[]',
      },
    });

    return NextResponse.json({ ok: true, quizId: quiz.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not save quiz.' }, { status: 500 });
  }
}
