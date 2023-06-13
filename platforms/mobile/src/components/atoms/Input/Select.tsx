import type { JSX } from "solid-js";
import { Select } from "@kobalte/core";

interface SelectInputOption<T> {
  label: string
  value: T
}

const COLORS = {
  "latte-rosewater": {
    trigger_open: "ui-expanded:border-latte-rosewater focus:border-latte-rosewater",
    label_open: "bg-latte-rosewater text-latte-base",
    label_value_selected: "peer-focus:bg-latte-rosewater peer-focus:text-latte-base"
  }
};

const SelectInput = <T,>(props: {
  options: Array<SelectInputOption<T>>
  triggerAriaLabel?: string

  value?: SelectInputOption<T> | undefined
  onChange?: (value: SelectInputOption<T>) => unknown

  /** Label and placeholder of the text input. */
  placeholder?: string

  /** Defaults to `latte-rosewater` on light mode. */
  color?: keyof typeof COLORS

  /** Removes the rounding and the border at the right. */
  removeRightBorder?: boolean
  /** Removes the rounding and the border at the left. */
  removeLeftBorder?: boolean
}): JSX.Element => {
  const id = `_select_${crypto.randomUUID()}`;
  const [isOpen, setIsOpen] = createSignal(false);
  const [valueSelected, setValueSelected] = createSignal(false);

  return (
    <Select.Root
      onOpenChange={setIsOpen}
      class="relative w-full"
      options={props.options}
      optionValue="value"
      optionTextValue="label"
      placeholder={" "}
      value={props.value}
      onChange={(value) => {
        if (props.onChange != null) props.onChange(value);
        setValueSelected(true);
      }}
      itemComponent={props => (
        <Select.Item item={props.item} class="relative h-[32px] w-full flex cursor-pointer items-center justify-between rounded-md ui-selected:(bg-latte-rosewater text-latte-base) px-2 text-latte-text outline-none transition-colors hover:(bg-latte-rosewater/10 text-latte-rosewater) ui-selected:hover:(bg-latte-rosewater/40 text-latte-rosewater)">
          <Select.ItemLabel>{props.item.textValue}</Select.ItemLabel>
          <Select.ItemIndicator class="h-[20px] w-[20px] inline-flex items-center justify-center">
            <IconMdiCheck/>
          </Select.ItemIndicator>
        </Select.Item>
      )}
    >
      <Select.Trigger
        id={id}
        class={`peer block w-full inline-flex appearance-none items-center justify-between border-2 border-gray-300 rounded-lg bg-transparent pb-2.5 pl-[16px] pr-[10px] pt-4 text-sm text-latte-text focus:outline-none focus:ring-0 ${COLORS[props.color ?? "latte-rosewater"].trigger_open}`}
        classList={{
          "rounded-r-none border-r-0": props.removeRightBorder,
          "rounded-l-none border-l-0": props.removeLeftBorder
        }}
        aria-label={props.triggerAriaLabel}>
        <Select.Value<SelectInputOption<T>> class="overflow-hidden text-ellipsis whitespace-nowrap">
          {state => state.selectedOption().label}
        </Select.Value>
        <Select.Icon class="h-[20px] w-[20px] flex-[0_0_20px]">
          <IconMdiChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <label
        for={id}
        class="pointer-events-none absolute left-2 z-[1] origin-[0] transform rounded-md px-2 text-sm text-latte-subtext0 duration-150"
        classList={{
          "bg-latte-base": !isOpen(),
          "top-1/2 scale-100 -translate-y-1/2": !isOpen() && !valueSelected(),
          [`top-2 scale-75 -translate-y-4 ${COLORS[props.color ?? "latte-rosewater"].label_open}`]: isOpen(),
          [`top-2 scale-75 -translate-y-4 ${COLORS[props.color ?? "latte-rosewater"].label_value_selected}`]: !isOpen() && valueSelected()
        }}
      >
        {props.placeholder}
      </label>
      <Select.Portal>
        <Select.Content class="z-100 transform-origin-[var(--kb-select-content-transform-origin)] border rounded-lg bg-white shadow-md">
          <Select.Listbox class="max-h-[360px] overflow-y-auto p-2 space-y-[2px]" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default SelectInput;
