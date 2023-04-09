import { defineConfig } from 'vite';

import solid from 'vite-plugin-solid';
import windi from 'vite-plugin-windicss';

export default defineConfig({
  plugins: [
    solid(),
    windi()
  ]
});
