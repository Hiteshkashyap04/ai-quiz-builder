const rawUrl = process.env.NEXTAUTH_URL?.trim();
const rawInternalUrl = process.env.NEXTAUTH_URL_INTERNAL?.trim();

if (!rawUrl) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }
}

if (!rawInternalUrl) {
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL;
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'development-secret';
}
