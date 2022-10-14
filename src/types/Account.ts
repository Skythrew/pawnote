export interface AccountSaved {
  username: string;
  instance: AccountInstance;
}

export interface AccountInstance {
  pronote_url: string;
  ent_url?: string;

  cookies: AccountInstanceCookies
}

export interface AccountInstanceCookies {
  pronote: string;
  ent?: string;
}
