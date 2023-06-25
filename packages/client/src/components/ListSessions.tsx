import { type Component, createSignal, onMount, Show, type JSX, type Accessor } from "solid-js";

import type { ApiUserData } from "@pawnote/api";

import * as sessions from "@/stores/sessions";
import * as endpoints from "@/stores/endpoints";

interface AvailableSession {
  slug: string
  user_name: string
  instance_name: string
}

export const ListSessions: Component<{
  loading?: JSX.Element
  onDone?: (sessions: AvailableSession[]) => unknown
  children: (sessions: Accessor<AvailableSession[]>) => JSX.Element
}> = (props) => {
  const [availableSessions, setAvailableSessions] = createSignal<AvailableSession[] | null>(null);

  onMount(async () => {
    const available_sessions: AvailableSession[] = [];
    const slugs = await sessions.keys();

    // We gather most useful informations for each session.
    for (const slug of slugs) {
      const user_data = await endpoints.select<ApiUserData>(slug, "/user/data");
      if (user_data == null) continue;

      const user_name = user_data.data.donnees.ressource.L;
      const instance_name = user_data.data.donnees.listeInformationsEtablissements.V[0].L;

      available_sessions.push({ slug, user_name, instance_name });
    }

    // Send the ready event if was given by props.
    if (typeof props.onDone === "function") {
      props.onDone(available_sessions);
    }

    setAvailableSessions(available_sessions);
  });

  return (
    <Show when={availableSessions()} fallback={props.loading}>
      {props.children}
    </Show>
  );
};
