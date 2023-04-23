import { ParentComponent, JSX, createEffect } from 'solid-js';

import type { Framework7Parameters } from 'framework7/types';
import RoutableModals from '@/framework7/components/RoutableModals';

import { classNames, getExtraAttrs } from "@/framework7/lib/utils";
import { colorClasses } from '@/framework7/lib/mixins';
import { f7init, f7 } from '@/framework7/lib/f7';

import { onMount, splitProps } from 'solid-js';

const App: ParentComponent<Framework7Parameters & {
  ref: HTMLDivElement,
  style?: JSX.CSSProperties,
  class?: string
}> = (props) => {
  const [local, params] = splitProps(props, ["ref", "class", "style", "class"]);

  const classes = () => classNames(local.class, 'framework7-root', colorClasses(props));
  const extraAttrs = () => getExtraAttrs(props);

  onMount(() => {
    if (f7) return;
    f7init(props.ref, params, false);
  });

  createEffect(() => {
    const parentEl = props.ref.parentNode;

    if (parentEl && parentEl !== document.body && parentEl.parentNode === document.body) {
      (parentEl as HTMLElement).style.height = '100%';
    }
    
    if (f7) {
      // @ts-expect-error
      f7.init(props.ref);
      return;
    }

    f7init(props.ref, params, true);
  });

  return (
    <div id="framework7-root" style={local.style} class={classes()} ref={props.ref} {...extraAttrs()}>
      {props.children}
      <RoutableModals />
    </div>
  );
};

export default App;