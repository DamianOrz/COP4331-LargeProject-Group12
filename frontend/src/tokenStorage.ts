interface TokenResponse {
  accessToken: string;
}

export const storeToken = (token: TokenResponse | string): void => {
  const accessToken = typeof token === 'string' ? token : token.accessToken;
  localStorage.setItem('token_data', accessToken);
};

export const retrieveToken = (): string | null => localStorage.getItem('token_data');
