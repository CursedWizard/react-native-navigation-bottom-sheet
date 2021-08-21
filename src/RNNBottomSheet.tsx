import {
  Navigation,
  Layout,
  OptionsModalPresentationStyle,
} from 'react-native-navigation';

import { listen, dispatch } from './events';
import type { RNNBottomSheetProps } from './types';

import BottomSheet from './BottomSheet';
const notInitialized = 'You have not initialized RNNBottomSheet component.';
const openedInstance =
  'You already have running instance of the component. Aborting...';

export default class RNNBottomSheet {
  private static modalOpened = false;
  private static registered = false;
  private static bottomSheetName = '__initBottomSheet__';

  static getComponentName() {
    return this.bottomSheetName;
  }

  static isOpened() {
    return this.modalOpened;
  }

  static init() {
    if (!this.registered) {
      Navigation.registerComponent(this.bottomSheetName, () => BottomSheet);
      this.registered = true;
    }

    listen('MARK_CLOSED', () => {
      this.modalOpened = false;
    });
  }

  /**
   * Used only to showcase a support for multuple snap points.
   * Probably useless in practise.
   */
  static snapTo(index: number) {
    dispatch('BOTTOM_SHEET_SNAP_TO', index);
  }

  static openBottomSheet(props: RNNBottomSheetProps) {
    if (!this.registered) {
      console.error(notInitialized);
      return;
    }

    if (this.modalOpened) {
      console.error(openedInstance);
      return;
    }

    this.modalOpened = true;

    const layout: Layout<RNNBottomSheetProps> = {
      component: {
        passProps: props,
        name: this.bottomSheetName,
        options: {
          animations: {
            showModal: {
              enabled: false,
            },
            dismissModal: {
              enabled: false,
            },
          },
          layout: {
            backgroundColor: 'transparent',
          },
          hardwareBackButton: {
            dismissModalOnPress: false,
          },
          modal: {
            // IOS specific  TODO: test it
            swipeToDismiss: false,
          },
          popGesture: false,
          modalPresentationStyle:
            'overCurrentContext' as OptionsModalPresentationStyle,
        },
      },
    };
    Navigation.showModal(layout);
  }

  static closeBottomSheet() {
    if (!this.registered) {
      console.error(notInitialized);
      return;
    }

    dispatch('DISMISS_BOTTOM_SHEET');
  }
}

