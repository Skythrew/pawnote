import localforage from "localforage";

const database = localforage.createInstance({
  name: "internals",
  storeName: "settings"
});

// TODO: Apply a theme/configuration specific to each user.

export { database };
