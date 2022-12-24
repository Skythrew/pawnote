import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "virtual:windi.css";

import type { Component } from "solid-js"

import Button from "@/components/Button";

export const HelloWorld: Component = () => {
  return (
    <>
      <p>Hello World!</p>
      <Button />
    </>
  );
};
