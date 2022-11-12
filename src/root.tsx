// @refresh reload
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "virtual:windi.css";

import {
  Html,
  Head,
  Body,
  Routes,
  Scripts,
  FileRoutes
} from "solid-start";

import settings from "@/stores/settings";

export default function Root () {
  createEffect(() => {
    document.body.classList.toggle("dark", settings.globalThemeMode() === "dark");
  });

  return (
    <Html>
      <Head />
      <Body>
        <Routes>
          <FileRoutes />
        </Routes>
        <Scripts />
      </Body>
    </Html>
  );
}
