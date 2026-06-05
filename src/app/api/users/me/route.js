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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, image: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not load profile.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.full_name ?? payload.name ?? null,
        image: payload.avatar ?? payload.image ?? null,
      },
      select: { id: true, email: true, name: true, image: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.name,
      avatar: user.image,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not update profile.' }, { status: 500 });
  }
}
