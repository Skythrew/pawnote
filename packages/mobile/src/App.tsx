import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';

import { callGeolocationAPI } from "./utils/api";

const App: Component = () => {
  const [data, setData] = createSignal<Record<string, unknown>>({});

  return (
    <>
      <p class="text-4xl text-green-100 text-center py-20">Pornote - Experimentations</p>
      
      <button
        onClick={() => setData({})}
      >
        remove any stored data
      </button>
      <button
        onClick={async () => {
          const api = await callGeolocationAPI();
          setData(api);
        }}
      >
        call geolocation api
      </button>

      <pre>
        {JSON.stringify(data())}
      </pre>
    </>
  );
};

export default App;
