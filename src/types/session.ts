import type { PronoteApiAccountId } from "@/types/pronote";

export interface SessionInstance {
  pronote_url: string;
  ent_url: string | null;

  session_id: number;
  account_type_id: PronoteApiAccountId;

  ent_cookies: string[];
  pronote_cookies: string[];

  skip_encryption: boolean;
  skip_compression: boolean;

  use_ent: boolean;
  order: number;
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

export interface SessionExported {
  instance: SessionInstance;
  encryption: SessionEncryption;
}

