const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

export class BackendApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.data = data;
  }
}

function joinUrl(baseUrl, path) {
  const trimmedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

export async function backendRequest(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(joinUrl(BACKEND_API_URL, path), {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = data?.detail || data?.error || data?.message || response.statusText || 'Request failed';
    throw new BackendApiError(message, response.status, data);
  }

  return data;
}
