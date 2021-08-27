import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

import { runDecay, normalizeSnapPoints } from './utility';
import type {LayoutChangeEvent} from 'react-native';

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

import { AnimatedStoreSheet as ASBS } from "./AnimatedStoreSheet";

/**
  * Namespace for animated values associated with the scrolling content.
  */
class AnimatedStoreScrolling {
  /* Clock used for an animation of a scrolling view (not implemented yet) */
  static _scrollingClock = new Animated.Clock();

  /* Value of a current dragging postion of content in the scroll view */
  static _scrollY: Animated.Value<number> = new Animated.Value(0);

  /* Value of a current speed of content dragging in the scroll view  */
  static _velocityScrollY: Animated.Value<number> = new Animated.Value(0);

  /* State of a gesture for a scroll view */
  static _panScrollState: Animated.Value<number> = new Animated.Value(
    GestureState.END
  );

  static _onGestureEventScrolling = Animated.event([
    {
      nativeEvent: {
        translationY: this._scrollY,
        velocityY: this._velocityScrollY,
        state: this._panScrollState,
      },
    },
  ]);

  static enabledContentGestureInteraction: boolean = true;
  static contentHeight: Animated.Value<number> = new Animated.Value(0);
  static headerHeight: number = 0;
  static snapPoints: readonly number[] = [];

  static _wasStarted: Animated.Value<number> = new Animated.Value(0);

  static init = (
    enabledContentGestureInteraction: boolean,
    snapPoints: readonly number[]
  ) => {
    this.snapPoints = snapPoints;
    this.enabledContentGestureInteraction = enabledContentGestureInteraction;
  };

  static handleLayoutHeader = ({
    nativeEvent: {
      layout: { height: heightOfHeader },
    },
  }: LayoutChangeEvent) => {
    this.headerHeight = heightOfHeader;
  };

  static handleLayoutContent = ({
    nativeEvent: {
      layout: { height },
    },
  }: LayoutChangeEvent) => {
    const resultHeight = this.enabledContentGestureInteraction
      ? height + this.headerHeight - this.snapPoints[this.snapPoints.length - 1]
      : 0;

    this.contentHeight.setValue(resultHeight);
  };

  static limitedScroll = proc((val: Animated.Value<number>) =>
    max(min(val, 0), multiply(this.contentHeight, -1))
  );

  static _prevTransY: Animated.Value<number> = new Animated.Value(0);
  static _transY: Animated.Value<number> = new Animated.Value(0);

  static _startedAtTheTop: Animated.Value<number> = new Animated.Value(0);

  /**
   * 1 - scrolling content
   * 2 - sheet dragging
   */
  static _lastState: Animated.Value<number> = new Animated.Value(0);
  static scrollOffset: Animated.Value<number> = new Animated.Value(0);
  static scrollOffsetWhileSnapped: Animated.Value<number> = new Animated.Value(
    0
  );

  static distanceTest: Animated.Value<number> = new Animated.Value(0);

  static _masterScrollY = block([

    /** 
      * Debugging section.
      */

    /* onChange(
      this._prevTransY,
      call([this._prevTransY], (snapPoints: readonly number[]) =>
        console.log('Changed prevTransY: ' + snapPoints[0])
      )
    ),
    onChange(
      this.scrollOffsetWhileSnapped,
      call([this.scrollOffsetWhileSnapped], (snapPoints: readonly number[]) =>
        console.log('Changed scrollOffsetWhileSnapped: ' + snapPoints[0])
      )
    ),
    onChange(
      this._transY,
      call([this._transY], (snapPoints: readonly number[]) =>
        console.log('Changed scrollOffset: ' + snapPoints[0])
      )
    ),
    onChange(
      this._lastState,
      call([this._lastState], (snapPoints: readonly number[]) =>
        console.log('Changed state: ' + snapPoints[0])
      )
    ), */


    cond(eq(this._lastState, 2), [
      set(
        ASBS._scrollToDragVal,
        sub(this._scrollY, this.scrollOffsetWhileSnapped)
      ),

      /** 
        * Setting scrollOffset is not required if the bottom sheet is
        * at the very top.
        *  TODO: describe different cases this solution solves
        */
      cond(not(this._startedAtTheTop), [
        set(
          this.scrollOffset,
          sub(this._scrollY, this.scrollOffsetWhileSnapped)
        ),
      ]),

      set(ASBS._velocityY, this._velocityScrollY),
    ]),

    cond(eq(this._lastState, 1), [
      /** 
        * During scrolling we need to record content offset and then use it when
        * calculating ASBS._scrollToDragVal value, so that dragging doesn't 
        * include unnecessary scrolling position.
        */
      set(this.scrollOffsetWhileSnapped, this._scrollY),

      /** 
        * Contrary to the previous line of code this one covers the special case
        * when we started dragging the bottom sheet not from the top. Here we need to
        * include this._prevTransY as an offset.
        */
      cond(
        not(this._startedAtTheTop),
        set(this.scrollOffsetWhileSnapped, multiply(-1, this._prevTransY))
      ),
    ]),

    cond(
      or(
        eq(this._panScrollState, GestureState.ACTIVE),
        eq(this._panScrollState, GestureState.BEGAN)
      ),
      [
        // TODO: stop draggin sheet clock
        set(this._wasStarted, 0),
        stopClock(this._scrollingClock),
        set(
          this._transY,
          this.limitedScroll(
            add(
              this._scrollY,
              this._prevTransY,
              multiply(-1, this.scrollOffset)
            ) as Animated.Value<number>
          )
        ),
        this._transY,
      ],
      [
        set(this.scrollOffset, 0),
        set(this.scrollOffsetWhileSnapped, 0),
        set(this._scrollY, 0),
        cond(
          eq(this._lastState, 1),
          runDecay(
            this._scrollingClock,
            this._transY,
            this._velocityScrollY,
            this._transY,
            this._wasStarted,
            this.contentHeight
          )
        ),
        set(this._velocityScrollY, 0),
        set(this._prevTransY, this._transY),
        this._transY,
      ]
    ),
    this._transY,
  ]);
}


export { AnimatedStoreScrolling };

