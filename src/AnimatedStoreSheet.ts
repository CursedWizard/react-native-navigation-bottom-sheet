

import Animated from 'react-native-reanimated';

import { Dimensions } from 'react-native';

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

class AnimatedStoreSheet {

  /* Animated value mapped to _dragY from _scrollY */
  static _scrollToDragVal: Animated.Value<number> = new Animated.Value(0);

    /* Value of a current speed of dragging */
  static _velocityY: Animated.Value<number> = new Animated.Value(0);

  static _snappedToTop: Animated.Value<number> = new Animated.Value(0);

  static init() {
  }

}

export { AnimatedStoreSheet };
