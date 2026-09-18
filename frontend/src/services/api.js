const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const configuredApiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL);

if (!configuredApiUrl) {
  throw new Error('VITE_API_URL is not configured.');
}

const parsedApiUrl = new URL(configuredApiUrl);
if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error('VITE_API_URL must use HTTP or HTTPS.');
}

export const API_BASE_URL = configuredApiUrl;

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const buildUrl = (path, query) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const parseJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const {
    token,
    query,
    headers,
    body,
    method = 'GET',
  } = options;

  const requestHeaders = new Headers(headers || {});

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload;
};

