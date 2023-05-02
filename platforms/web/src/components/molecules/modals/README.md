# `components/molecules` - Modals

## `index.tsx`

Contains all the exports so we can import everything from `@/components/molecules/modals`.

## `*.tsx` - rest

Each file should contain two named exports, `NameModalContent` and `NameModal`, where `Name` is the name of the modal.

### Why this ?

For easier usage with `createModal` primitive from `@/primitives/modal`.

That allows us to only import the modal's content from `NameModalContent` and
use it in the primitive.

When we do not want to use the modal from the primitive, we just import `NameModal`
and put it in the component's JSX.

### Example usage of `NameModalContent` - with `createModal` primitive

```tsx
import { NameModalContent } from "@/components/molecules/modals";
import { createModal } from "@/primitives/modal";

const [show, hide] = createModal(NameModalContent);
```

### Example usage of `NameModal` - in component's JSX

```tsx
import type { Component } from "solid-js`;

import { createSignal } from "solid-js`;
import { NameModal } from "@/components/molecules/modals";

const MyComponent: Component = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <p>This is some component.</p>
      <NameModal open={open()} onOpenChange={setOpen} />
    </>
  );
};
```
