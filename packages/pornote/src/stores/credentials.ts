import localforage from "localforage";
import { credentials } from "@/utils/globals";

const database = localforage.createInstance({
  name: "internals",
  storeName: "credentials"
});

const get = async (slug: string) => {
  const encoded_credentials = await database.getItem<string>(slug);
  if (!encoded_credentials) return null;

  const decoded_credentials = credentials.decode(encoded_credentials);
  return decoded_credentials;
};

const upsert = async (slug: string, decoded_credentials: {
  username: string;
  password: string;
}) => {
  const encoded_credentials = credentials.encode(decoded_credentials);
  await database.setItem<string>(slug, encoded_credentials);
};

const remove = (slug: string) => database.removeItem(slug);

export default { get, upsert, remove };
