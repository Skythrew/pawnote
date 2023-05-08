import type { Component, ComponentProps } from "solid-js";
import { createSignal } from "solid-js";

import TextInput from "./Text";

const PasswordInput: Component<Omit<ComponentProps<typeof TextInput>, "type">> = (props) => {
  const [showPassword, setShowPassword] = createSignal(false);

  return (
    <div class="group w-full flex">
      <TextInput
        type={showPassword() ? "text" : "password"}
        value={props.value}
        onInput={props.onInput}
        placeholder={props.placeholder}
        autocomplete={props.autocomplete}
        color={props.color}
        removeRightBorder
        removeLeftBorder={props.removeLeftBorder}
      />

      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        class="border-2 border-l-0 border-gray-300 px-3 py-2 text-lg text-gray-400 outline-none"
        classList={{
          "group-focus-within:border-latte-rosewater": !props.color || props.color === "latte-rosewater",
          "rounded-r-none border-r-0": props.removeRightBorder,
          "rounded-r-lg": !props.removeRightBorder
        }}
      >
        {showPassword() ? <IconMdiEyeOffOutline /> : <IconMdiEye />}
      </button>
    </div>
  );
};

export default PasswordInput;
