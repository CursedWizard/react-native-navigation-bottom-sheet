

import Animated from 'react-native-reanimated';

/**
  * Namespace for animated values associated with the bottom sheet.
  */
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
