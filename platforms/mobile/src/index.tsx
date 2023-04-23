/* @refresh reload */
import "framework7/css/bundle"
import { SplashScreen } from '@capacitor/splash-screen';
import { render } from 'solid-js/web';

import Framework7 from "framework7";
import Framework7Solid from "@/framework7/lib/plugin";
Framework7.use(Framework7Solid);

import App from "@/framework7/components/App";

const root = document.getElementById('root') as HTMLDivElement;

render(() => {
  SplashScreen.hide();
  
  return (
    <App theme="auto" name="Pawnote">
      <div>Hello World</div>
    </App>
  )
}, root);