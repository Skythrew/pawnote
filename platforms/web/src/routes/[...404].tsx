import type { JSX } from "solid-js";
import { Navigate } from "@solidjs/router";

export default function Page (): JSX.Element {
  return <Navigate href="/" />;
}
