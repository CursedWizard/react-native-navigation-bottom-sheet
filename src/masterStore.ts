

import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

import { runSpring, normalizeSnapPoints } from './utility';
import {Dimensions, LayoutChangeEvent} from 'react-native';

const {
  call,
  cond,
  greaterThan,
  lessThan,
  neq,
  clockRunning,
  not,
  and,
  set,
  sub,
  or,
  stopClock,
  lessOrEq,
  proc,
  add,
  max,
  min,
  eq,
  multiply,
  block,
  onChange,
  Value
} = Animated;

const screenHeight = Dimensions.get('window').height;

import { AnimatedStoreScrolling as ASS } from "./AnimatedStoreScrolling";
import { AnimatedStoreSheet as ASBS } from "./animatedStoreSheet";

class MasterStore {
  static snapPointUpdated: any = () => null;

  /* Animated value mapped to _dragY from _scrollY */
  static _scrollToDragVal: Animated.Value<number> = new Animated.Value(0);

    /* Value of a current speed of dragging */
  static _velocityY: Animated.Value<number> = new Animated.Value(0);

  static _snappedToTop: Animated.Value<number> = new Animated.Value(0);

  static init(snapPointUpdatedCallback: any) {
    this.snapPointUpdated = snapPointUpdatedCallback;
  }

}

export { MasterStore };
