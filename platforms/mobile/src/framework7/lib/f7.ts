import Framework7 from 'framework7/lite';
import { extend, unsetRouterIds } from './utils.js';

import type Router from "framework7/modules/router/router";

let f7: Framework7 & { Router: typeof Router };
let f7events: typeof Framework7.Events;

const theme: {
  ios: boolean;
  md: boolean;
} = {};

const f7routers: {
  views: any[],
  tabs: any[],
  modals: (
    | {
      modals: any[];
      el?: HTMLDivElement;
      setModals: (newModals: any[]) => void;
    }
    | null
  )
} = {
  views: [],
  tabs: [],
  modals: null,
};

const setTheme = () => {
  if (!f7) return;
  theme.ios = f7.theme === 'ios';
  theme.md = f7.theme === 'md';
};

const cleanup = () => {
  unsetRouterIds();
  delete theme.ios;
  delete theme.md;
  f7routers.views = [];
  f7routers.tabs = [];
  f7routers.modals = null;
};

const f7initEvents = () => {
  f7events = new Framework7.Events();
};

const f7init = (rootEl: HTMLElement, params = {}, init = true) => {
  const f7Params = extend({}, params, {
    el: rootEl,
    init,
  });
  if (typeof params.store !== 'undefined') f7Params.store = params.store;
  if (!f7Params.routes) f7Params.routes = [];

  if (f7Params.userAgent && (f7Params.theme === 'auto' || !f7Params.theme)) {
    const device = Framework7.getDevice({ userAgent: f7Params.userAgent }, true);
    theme.ios = !!device.ios;
    theme.md = !theme.ios;
  }
  // eslint-disable-next-line
  if (f7 && typeof window !== 'undefined') return;
  // eslint-disable-next-line
  if (typeof window === 'undefined') cleanup();

  const instance = new Framework7(f7Params);
  f7 = instance;
  setTheme();

  if (instance.initialized) {
    f7 = instance;
    f7events.emit('ready', f7);
  } else {
    instance.on('init', () => {
      f7 = instance;
      f7events.emit('ready', f7);
    });
  }
};

const f7ready = (callback) => {
  if (!callback) return;
  if (f7 && f7.initialized) callback(f7);
  else {
    f7events.once('ready', callback);
  }
};

export { f7, theme, f7ready, f7events, f7init, f7routers, f7initEvents, setTheme };