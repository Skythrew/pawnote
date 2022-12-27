import type { ParentComponent } from "solid-js";

const Button: ParentComponent = (props) => {
  return (
    <button class="bg-dark-300 text-brand-light px-4 py-1 rounded-md">
      {props.children}
    </button>
  );
};

export default Button;

