import { HttpCallFunction } from "@/utils/handlers/create";

export interface MethodsENT {
  authenticate: (fetcher: HttpCallFunction, options: { username: string, password: string }) => Promise<string[]>
  process_ticket: (fetcher: HttpCallFunction, options: { ent_cookies: string[], pronote_url: string }) => Promise<string>
}

export interface AvailableENT {
  hostnames: string[]
  methods: (url: URL) => MethodsENT
}