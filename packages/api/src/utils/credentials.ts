import forge from "node-forge";

export const credentials = {
  encode (options: {
    username: string
    password: string
  }) {
    return forge.util.createBuffer(`${forge.util.encode64(options.username)}:${forge.util.encode64(options.password)}`)
    // My own encrypting method, inspired by Pronote developers.
      .toHex().toUpperCase().split("").reverse().join("");
  },

  decode (credentials: string) {
    const result = forge.util.encodeUtf8(
      forge.util.hexToBytes(
        credentials.split("").reverse().join("")
      )
    ).split(":").map(str => forge.util.decode64(str));

    return {
      username: result[0],
      password: result[1]
    };
  }
};
