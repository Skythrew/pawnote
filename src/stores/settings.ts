/** Helper to get the mode stored in localStorage. */
const localStorageGlobalThemeMode = () => {
  if (isServer) return "light";

  const value = localStorage.getItem("theme");
  if (!value || !(value === "dark" || value === "light")) {
    localStorage.setItem("theme", "light");
    return "light";
  }

  return value;
};

const [globalThemeMode, _setGlobalThemeMode] = createSignal<"dark" | "light">(
  localStorageGlobalThemeMode()
);

const setGlobalThemeMode = (mode: "dark" | "light") => {
  localStorage.setItem("theme", mode);
  return _setGlobalThemeMode(mode);
};

const toggleGlobalThemeMode = () => globalThemeMode() === "dark"
  ? setGlobalThemeMode("light")
  : setGlobalThemeMode("dark");

// const database = localforage.createInstance({
//   name: "internals",
//   storeName: "settings"
// });

// TODO: Apply a theme/configuration specific to each user.

export default {
  globalThemeMode, setGlobalThemeMode, toggleGlobalThemeMode
};
