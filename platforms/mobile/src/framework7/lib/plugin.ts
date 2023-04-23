import type { Framework7Plugin } from 'framework7/types';

import Framework7 from 'framework7/lite';
import componentsRouter from './components-router';
import { f7, f7ready, theme, f7initEvents, setTheme } from './f7';

const Framework7Solid = {
  name: 'solidPlugin',
  installed: false,
  
  install (params: {
    theme?: "md" | "ios" | "auto",
    userAgent?: string
  } = {}) {
    // @ts-expect-error
    if (Framework7Solid.installed) return;
    // @ts-expect-error
    Framework7Solid.installed = true;

    f7initEvents();

    const { theme: paramsTheme, userAgent } = params;

    if (paramsTheme && paramsTheme === 'md')
      theme.md = true;
    if (paramsTheme && paramsTheme === 'ios')
      theme.ios = true;

    const needThemeCalc = typeof window === 'undefined' ? !!userAgent : true;
    if (needThemeCalc && (!paramsTheme || paramsTheme === 'auto')) {
      const device = Framework7.getDevice({ userAgent }, true);
      theme.ios = !!device.ios;
      theme.md = !theme.ios;
    }
    f7ready(() => {
      setTheme();
    });

    // @ts-expect-error
    Framework7.Router.use(componentsRouter);
  },
} as unknown as Framework7Plugin;

export { f7ready, f7, theme };
export default Framework7Solid;