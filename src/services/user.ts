import { User } from '@context';

type LoginResponse = {
  loggedIn: boolean;
  signedUp: boolean;
  access_token: string;
  user: User;
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();

  return data;
}
