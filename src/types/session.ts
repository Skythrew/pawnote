import type { PronoteApiAccountId } from "@/types/pronote";

export interface SessionData {
  session_id: number;
  account_type_id: PronoteApiAccountId;

  ent_username?: string;
  ent_password?: string;

  skip_encryption: boolean;
  skip_compression: boolean;
}

export interface SessionEncryption {
  aes: {
    iv?: string;
    key?: string;
  }

  rsa: {
    modulus: string;
    exponent: string;
  }
}

export interface SessionInstance {
  pronote_url: string;

  ent_cookies: string[];
  ent_url: string | null;
  use_ent: boolean;

  order: number;
}

export interface SessionExported {
  data: SessionData;
  instance: SessionInstance;
  encryption: SessionEncryption;
}
