import { type Component } from "solid-js";
import { useParams, useNavigate, A } from "solid-start";

import { sessions } from "@pawnote/client";

const Page: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const slug = () => params.slug as string;

  onMount(async () => {
    if (!slug()) {
      console.error("no slug found in params");
      navigate("/app");
      return;
    }

    const session = await sessions.select(slug());
    console.log(session);
  });

  return (
    <div class="p-4">
      <A href="/app">Go back to account selection</A>
    </div>
  );
};

export default Page;
