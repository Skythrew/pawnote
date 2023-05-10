import type { Component } from "solid-js";

const TextInput: Component<{
  type?: "text" | "url" | "password";

  value?: string | undefined;
  onInput?: (value: string) => unknown;

  /** Label and placeholder of the text input. */
  placeholder?: string;

  /** Defaults to `latte-rosewater` on light mode. */
  color?: "latte-rosewater";

  /** Removes the rounding and the border at the right. */
  removeRightBorder?: boolean;
  /** Removes the rounding and the border at the left. */
  removeLeftBorder?: boolean;

  // Other interesting metas.
  autocomplete?: string;
}> = (props) => {
  const id = `_input_${crypto.randomUUID()}`;

  return (
    <div class="relative w-full">
      <input
        id={id}
        placeholder=" "

        value={props.value}
        onInput={event => props.onInput && props.onInput(event.currentTarget.value)}

        type={props.type ?? "text"}
        autocomplete={props.autocomplete}

        class="peer block w-full appearance-none border-2 border-gray-300 rounded-lg bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-latteText focus:outline-none focus:ring-0"
        classList={{
          "focus:border-latte-rosewater group-focus-within:border-latte-rosewater": !props.color || props.color === "latte-rosewater",
          "rounded-r-none border-r-0": props.removeRightBorder,
          "rounded-l-none border-l-0": props.removeLeftBorder
        }}
      />
      <label for={id}
        class="text-latte-subtext0 pointer-events-none absolute left-2 top-2 z-[1] origin-[0] scale-75 transform rounded-md bg-latte-base px-2 text-sm duration-150 peer-focus:top-2 peer-placeholder-shown:top-1/2 -translate-y-4 peer-focus:scale-75 peer-placeholder-shown:scale-100 peer-focus:px-2 peer-focus:text-latte-base peer-focus:-translate-y-4 peer-placeholder-shown:-translate-y-1/2"
        classList={{
          "peer-focus:bg-latte-rosewater": !props.color || props.color === "latte-rosewater"
        }}
      >
        {props.placeholder}
      </label>
    </div>
  );
};

export default TextInput;
