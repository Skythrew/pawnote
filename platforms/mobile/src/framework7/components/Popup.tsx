import { f7, f7ready } from '../lib/f7';
import { colorClasses } from '../lib/mixins';
import { modalStateClasses } from '../lib/modal-state-classes';
import { useIsomorphicLayoutEffect } from '../lib/use-isomorphic-layout-effect';
import { classNames, emit, getExtraAttrs } from '../lib/utils';
import { watchProp } from '../lib/watch-prop';

import type { Popup } from 'framework7/types';
import type { ParentComponent, JSX } from 'solid-js';

const Popup: ParentComponent<{
  id?: string | number;
  class?: string;
  style?: JSX.CSSProperties;
  tabletFullscreen? : boolean
  opened? : boolean
  animate? : boolean
  backdrop? : boolean
  backdropEl? : string | object
  closeByBackdropClick? : boolean
  closeOnEscape? : boolean
  swipeToClose? : boolean | string
  swipeHandler? : string | object
  push? : boolean
  containerEl?: string | object
  onPopupSwipeStart? : (instance?: Popup.Popup) => void
  onPopupSwipeMove? : (instance?: Popup.Popup) => void
  onPopupSwipeEnd? : (instance?: Popup.Popup) => void
  onPopupSwipeClose? : (instance?: Popup.Popup) => void
  onPopupOpen? : (instance?: Popup.Popup) => void
  onPopupOpened? : (instance?: Popup.Popup) => void
  onPopupClose? : (instance?: Popup.Popup) => void
  onPopupClosed? : (instance?: Popup.Popup) => void

  ref?: {
    el: HTMLElement | null;
    f7Popup: () => Popup.Popup
  };
}> = (props) => {
  let f7Popup;

  const extraAttrs = getExtraAttrs(props);

  let elRef;

  let isOpened = props.opened;
  let isClosing = false;

  const onSwipeStart = (instance) => {
    emit(props, 'popupSwipeStart', instance);
  };
  const onSwipeMove = (instance) => {
    emit(props, 'popupSwipeMove', instance);
  };
  const onSwipeEnd = (instance) => {
    emit(props, 'popupSwipeEnd', instance);
  };
  const onSwipeClose = (instance) => {
    emit(props, 'popupSwipeClose', instance);
  };
  const onOpen = (instance) => {
    isOpened = true;
    isClosing = false;
    emit(props, 'popupOpen', instance);
  };
  const onOpened = (instance) => {
    emit(props, 'popupOpened', instance);
  };
  const onClose = (instance) => {
    isOpened = false;
    isClosing = true;
    emit(props, 'popupClose', instance);
  };
  const onClosed = (instance) => {
    isClosing = false;
    emit(props, 'popupClosed', instance);
  };

  useImperativeHandle(ref, () => ({
    el: elRef,
    f7Popup: () => f7Popup,
  }));

  watchProp(opened, (value) => {
    if (!f7Popup) return;
    if (value) {
      f7Popup.open();
    } else {
      f7Popup.close();
    }
  });

  const modalEvents = (method) => {
    if (!f7Popup) return;
    f7Popup[method]('swipeStart', onSwipeStart);
    f7Popup[method]('swipeMove', onSwipeMove);
    f7Popup[method]('swipeEnd', onSwipeEnd);
    f7Popup[method]('swipeClose', onSwipeClose);
    f7Popup[method]('open', onOpen);
    f7Popup[method]('opened', onOpened);
    f7Popup[method]('close', onClose);
    f7Popup[method]('closed', onClosed);
  };

  const onMount = () => {
    if (!elRef) return;
    const popupParams = {
      el: elRef,
    };

    if ('closeByBackdropClick' in props) popupParams.closeByBackdropClick = closeByBackdropClick;
    if ('closeOnEscape' in props) popupParams.closeOnEscape = closeOnEscape;
    if ('animate' in props) popupParams.animate = animate;
    if ('backdrop' in props) popupParams.backdrop = backdrop;
    if ('backdropEl' in props) popupParams.backdropEl = backdropEl;
    if ('swipeToClose' in props) popupParams.swipeToClose = swipeToClose;
    if ('swipeHandler' in props) popupParams.swipeHandler = swipeHandler;
    if ('containerEl' in props) popupParams.containerEl = containerEl;

    f7ready(() => {
      f7Popup = f7.popup.create(popupParams);
      modalEvents('on');
      if (opened) {
        f7Popup.open(false, true);
      }
    });
  };

  const onDestroy = () => {
    if (f7Popup) {
      f7Popup.destroy();
    }
    f7Popup = null;
  };

  useIsomorphicLayoutEffect(() => {
    modalEvents('on');
    return () => {
      modalEvents('off');
    };
  });

  useIsomorphicLayoutEffect(() => {
    onMount();
    return onDestroy;
  }, []);

  const classes = classNames(
    class,
    'popup',
    {
      'popup-tablet-fullscreen': tabletFullscreen,
      'popup-push': push,
    },
    modalStateClasses({ isOpened, isClosing }),
    colorClasses(props),
  );

  return (
    <div id={id} style={style} className={classes} ref={elRef} {...extraAttrs}>
      {children}
    </div>
  );
});

export default Popup;