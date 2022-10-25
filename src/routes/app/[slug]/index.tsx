import type { Component } from "solid-js";

const AppHome: Component = () => {
  const params = useParams();
  const slug = params.slug;

  return (
    <>
      <Title>{slug} - Pornote</Title>

      <div>
        <h1>Te revoilà, {slug}!</h1>
      </div>
    </>
  );
};

export default AppHome;
