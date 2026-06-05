import { NextResponse } from 'next/server';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

function buildFallbackQuiz(topic, maxQuestions) {
  return Array.from({ length: maxQuestions }, (_, index) => ({
    question: `${topic} - sample question ${index + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 0,
  }));
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const topic = payload.topic || payload.prompt || payload.title || 'General knowledge';
    const maxQuestions = Number(payload.num_questions || payload.max_questions || 5);
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ok: true, data: buildFallbackQuiz(topic, maxQuestions) });
    }

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content:
              'You are a quiz generator. Reply ONLY with a JSON array of objects. Each object must contain: question (string), options (array of 4 strings), answer (0-3 index).',
          },
          {
            role: 'user',
            content: `Create ${maxQuestions} multiple-choice questions about: ${topic}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'AI generation failed.');
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return NextResponse.json({ ok: true, data: parsed });
      }
    } catch {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          const parsed = JSON.parse(text.slice(start, end + 1));
          if (Array.isArray(parsed)) {
            return NextResponse.json({ ok: true, data: parsed });
          }
        } catch {
          // fall through
        }
      }
    }

    return NextResponse.json({
      ok: false,
      raw: text,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: true, data: buildFallbackQuiz(payload?.topic || 'General knowledge', Number(payload?.max_questions || 5)) },
      { status: 200 }
    );
  }
}
