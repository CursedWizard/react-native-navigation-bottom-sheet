
import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

import { runDecay, normalizeSnapPoints } from './utility';
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

/** 
  * Namespace for animated values associated with the bottom sheet.
  */
class AnimatedStoreSheet {
  /* Snap points mapped to Animated values */
  static _snapPoints: readonly Animated.Value<number>[] = [];

  static snapPoints: readonly number[] = [];

  /* Clock used for snapping animations of the bottom sheet */
  static _clock = new Animated.Clock();

  /* Value of a current dragging postion */
  static _dragY: Animated.Value<number> = new Animated.Value(0);

  /* Value of a current speed of dragging */
  static _velocityY: Animated.Value<number> = new Animated.Value(0);

  /* State of a gesture */
  static _panState: Animated.Value<number> = new Animated.Value(
    GestureState.END
  );
  static initialSnapIndex: number | undefined = 0;

  static _onGestureEvent = Animated.event([
    {
      nativeEvent: {
        translationY: this._dragY,
        velocityY: this._velocityY,
        state: this._panState,
      },
    },
  ]);

  /* A flag forcing an animation to run; variables below define the animation */
  static _forcedSet: Animated.Value<number> = new Animated.Value(1);

  /* Forcefully set starting point of a spring animation */
  static _startSnapPoint: Animated.Value<number> = new Animated.Value(0);

  /* Forcefully set destination point of a spring animation */
  static _endSnapPoint: Animated.Value<number> = new Animated.Value(0);

  /* Basically last snap point */
  static _lastBottomSheetHeight: Animated.Value<number> =
    this._snapPoints[
      this.initialSnapIndex
        ? this.initialSnapIndex
        : this._snapPoints.length - 1
    ];

  /* Animated value mapped to _dragY from _scrollY */
  static _scrollToDragVal: Animated.Value<number> = new Animated.Value(0);

  static _draggingAnimation: Animated.Node<number> = new Animated.Value(0);

  // static _endSnapPoint: Animated.Value<number> = new Animated.Value(0);
  static init = (
    _snapPoints: readonly Animated.Value<number>[],
    snapPoints: readonly number[],
    lastBottomSheetHeight: Animated.Value<number>,
    initialSnapIndex: number | undefined
  ) => {
    this._snapPoints = _snapPoints;
    this.snapPoints = snapPoints;
    this._lastBottomSheetHeight = lastBottomSheetHeight;
    this.initialSnapIndex = initialSnapIndex;

    this._endSnapPoint = sub(
      screenHeight,
      this._snapPoints[
        this.initialSnapIndex
          ? this.initialSnapIndex
          : this._snapPoints.length - 1
      ]
    ) as Animated.Value<number>;

    this._startSnapPoint = sub(
      screenHeight,
      this._snapPoints[0]
    ) as Animated.Value<number>;

    this._forcedSet.setValue(1);

    this._draggingAnimation = Animated.interpolate(
      Animated.add(
        Animated.sub(screenHeight, this._lastBottomSheetHeight),
        add(this._dragY, this._scrollToDragVal)
      ),
      {
        inputRange: [
          screenHeight - this.snapPoints[this.snapPoints.length - 1],
          screenHeight - this.snapPoints[0],
        ],
        outputRange: [
          screenHeight - this.snapPoints[this.snapPoints.length - 1],
          screenHeight - this.snapPoints[0],
        ],
        extrapolate: Animated.Extrapolate.CLAMP,
      }
    );
  };
}

export { AnimatedStoreSheet };
