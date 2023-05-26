import type { ApiLoginEntCookies } from "./types";
import { ApiLoginEntCookiesRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { credentials } from "@/utils/credentials";
import { findENT } from "@/ent";

export default createApiFunction<ApiLoginEntCookies>(ApiLoginEntCookiesRequestSchema, async (req, res) => {
  const { username, password } = credentials.decode(req.body.credentials);

  const service = findENT(req.body.ent_url);
  const cookies = await service.authenticate(req.fetch, { username, password });

  return res.success({ ent_cookies: cookies });
});
