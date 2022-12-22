import type { PronoteApiAccountId } from "@/types/pronote_api";

export interface PronoteApiInstance {
  request: Record<string, never>;

  response: {
    version: number[];
    date: string;
    CAS: { actif: boolean, casURL: string };
    espaces: { nom: string, URL: string }[];
    nomEtab: string;
  };
}

export interface ApiInstance {
  request: {
    pronote_url: string;
  }

  response: {
    school_name: string;

    accounts: {
      name: string;
      id: PronoteApiAccountId;
    }[];

    pronote_url: string;
    ent_url?: string;
  }

  path: "/instance";
}
