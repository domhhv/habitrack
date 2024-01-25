const { API_BASE_URL } = process.env;

export const fetch = async (path: string, options?: RequestInit) => {
  const response = await window.fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();

  return data;
};

export const get = <T extends object>(
  path: string,
  headers: HeadersInit = {},
  options: RequestInit = {}
): Promise<T> => {
  return fetch(path, { method: 'GET', ...options, headers });
};

export const post = <T extends object>(
  path: string,
  body: unknown,
  headers: HeadersInit = {},
  options: RequestInit = {}
): Promise<T> => {
  return fetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

export const patch = <T extends object>(
  path: string,
  body: Partial<T>,
  headers: HeadersInit = {},
  options: RequestInit = {}
): Promise<T> => {
  return fetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

export const destroy = <T extends object>(
  path: string,
  headers: HeadersInit = {},
  options: RequestInit = {}
): Promise<T> => {
  return fetch(path, { method: 'DELETE', ...options, headers });
};

export const composeAuthorizationHeader = (
  accessToken: string
): HeadersInit => ({
  Authorization: `Bearer ${accessToken}`,
});
