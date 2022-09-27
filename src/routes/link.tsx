import type { Component, JSX } from "solid-js";
import type { ApiGeolocation } from "@/types/api";

import {
  ApiError,
  apiPostGeolocation
} from "@/utils/api";

const LinkPronoteAccount: Component = () => {
  const [state, setState] = createStore<{
    geolocation_data: ApiGeolocation["response"] | null;

    pronote_url: string;
    school_informations_commun: string | null;
  }>({
    geolocation_data: null,

    pronote_url: "",
    school_informations_commun: null
  });

  const processNextStep: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (evt) => {
    evt.preventDefault();
    alert(state.pronote_url);
  };

  const handleGeolocation = async () => {
    try {
      setState("geolocation_data", null);

      // TODO: use real lat and long.
      const data = await apiPostGeolocation({ latitude: 42, longitude: 1 });
      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a ete trouvee.");
        return;
      }

      setState("geolocation_data", data);
      console.info(data);
    }
    catch (err) {
      if (err instanceof ApiError) {
        console.error(err.message);
      }
    }
  };

  return (
    <div>
      <header>
        <h1>Connexion à Pronote</h1>
        <p>Selectionnez l'instance Pronote de votre établissement.</p>
      </header>

      <main>
        <form onSubmit={processNextStep}>
          <div class="flex">
            <input
              type="url"
              value={state.pronote_url}
              onInput={event => setState("pronote_url", event.currentTarget.value)}
            />
            <button type="button" onClick={handleGeolocation}>
              <IconMdiMapMarkerRadius />
            </button>
          </div>

          <button type="submit">
            Prochaine étape
          </button>
        </form>
      </main>
    </div>
  );
};

export default LinkPronoteAccount;
