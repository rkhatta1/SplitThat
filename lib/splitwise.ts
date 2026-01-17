import { Client, OAuth2User } from "splitwise-ts";

// Create a simple auth client that just holds the token
class TokenAuthClient {
  private token: string;

  constructor(accessToken: string) {
    this.token = accessToken;
  }

  get accessToken(): string | null {
    return this.token;
  }

  async requestAccessToken(): Promise<any> {
    // We already have the token, just return it
    return { access_token: this.token };
  }
}

export const getSplitwiseClient = (token: string) => {
  return new Client(new TokenAuthClient(token) as any);
};
