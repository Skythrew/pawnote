import Popup from '../components/Popup';
import View from '../components/View';
import LoginScreen from '../components/LoginScreen';
import Sheet from '../components/Sheet';
import Popover from '../components/Popover';
import Panel from '../components/Panel';

export const routerOpenIn = (router, url, options) => {
  const navigateOptions = {
    url,
    route: {
      path: url,
      options: {
        ...options,
        openIn: undefined,
      },
    },
  };
  const params = {
    ...options,
  };

  if (options.openIn === 'popup') {
    params.component = function DynamicPopup() {
      return (
        <Popup class="popup-router-open-in" data-url={url}>
          <View linksView={router.view.selector} url={url} ignoreOpenIn />
        </Popup>
      );
    };
    navigateOptions.route.popup = params;
  }
  if (options.openIn === 'loginScreen') {
    params.component = function DynamicPopover() {
      return (
        <LoginScreen class="login-screen-router-open-in" data-url={url}>
          <View linksView={router.view.selector} url={url} ignoreOpenIn />
        </LoginScreen>
      );
    };
    navigateOptions.route.loginScreen = params;
  }
  if (options.openIn === 'sheet') {
    params.component = function DynamicSheet() {
      return (
        <Sheet class="sheet-modal-router-open-in" data-url={url}>
          <View linksView={router.view.selector} url={url} ignoreOpenIn />
        </Sheet>
      );
    };
    navigateOptions.route.sheet = params;
  }
  if (options.openIn === 'popover') {
    params.targetEl = options.clickedEl || options.targetEl;
    params.component = function DynamicPopover() {
      return (
        <Popover
          class="popover-router-open-in"
          targetEl={options.clickedEl || options.targetEl}
          data-url={url}
        >
          <View linksView={router.view.selector} url={url} ignoreOpenIn />
        </Popover>
      );
    };
    navigateOptions.route.popover = params;
  }
  if (options.openIn.indexOf('panel') >= 0) {
    const parts = options.openIn.split(':');
    const side = parts[1] || 'left';
    const effect = parts[2] || 'cover';
    params.component = function DynamicPanel() {
      return (
        <Panel side={side} effect={effect} class="panel-router-open-in" data-url={url}>
          <View linksView={router.view.selector} url={url} ignoreOpenIn />
        </Panel>
      );
    };
    navigateOptions.route.panel = params;
  }
  return router.navigate(navigateOptions);
};