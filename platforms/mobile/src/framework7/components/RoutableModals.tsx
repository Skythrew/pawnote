import type { ParentComponent } from 'solid-js';
import { f7events, f7routers } from '@/framework7/lib/f7';

import { createSignal, createEffect, For, onCleanup } from 'solid-js';

const RoutableModals: ParentComponent<{
  ref?: HTMLDivElement
}> = (props) => {
  const [modals, setModals] = createSignal<any[]>([]);

  createEffect(() => {
    const routerData: typeof f7routers["modals"] = {
      get modals() {
        return modals();
      },
      setModals(newModals) {
        setModals([...newModals]);
      },

      el: props.ref
    };
    
    f7routers.modals = routerData;
    // @ts-expect-error
    f7events.emit("modalsRouterDidUpdate", routerData);
    
    onCleanup(() => {
      if (!routerData) return;
      f7routers.modals = null;
    })
  })

  return (
    <div ref={props.ref} class="framework7-modals">
      <For each={modals()}>
        {modal => (
          <modal.component {...modal.props} />
        )}
      </For>
    </div>
  );
};

export default RoutableModals;