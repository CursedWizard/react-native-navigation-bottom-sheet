import * as React from 'react';
import {
  View,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
  LayoutChangeEvent,
  EmitterSubscription,
} from 'react-native';
import {
  Navigation,
  EventSubscription,
  NavigationButtonPressedEvent,
} from 'react-native-navigation';
import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

import { listen, dispatch } from './events';
import type { State, RNNBottomSheetProps } from './types';
import { runSpring, normalizeSnapPoints, overrideConfig } from './utility';

import { AnimatedStoreScrolling as ASS } from "./AnimatedStoreScrolling";
import { AnimatedStoreSheet as ASBS } from './AnimatedStoreSheet';

const {
  call,
  cond,
  greaterThan,
  lessThan,
  neq,
  clockRunning,
  abs,
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
} = Animated;

const {
  interpolate: interpolateDeprecated,
  // @ts-ignore: this property is only present in Reanimated 2
  interpolateNode,
} = Animated;

// @ts-ignore
const interpolate: typeof interpolateDeprecated =
  interpolateNode ?? interpolateDeprecated;

const screenHeight = Dimensions.get('window').height;

type Props = RNNBottomSheetProps & { componentId: any };

class BottomSheet extends React.Component<Props, State> {
  static defaultProps: RNNBottomSheetProps = {
    snapPoints: [0, 100, 300, 500],
    backgroundColor: '#FFF',
    dismissWhenTouchOutside: true,
    fadeOpacity: 0.7,
    borderRadius: 0,
    enabledContentGestureInteraction: true,
  };

  /* BottomSheet state */
  state: State = {
    heightOfHeader: 0,
    contentHeight: new Animated.Value(0),
    screenHeight: screenHeight,
  };

  /** -------------------------------------------- */
  /**          Declaration of variables            */
  /** -------------------------------------------- */

  /* Numerical values of snap points which are provided in props */
  snapPoints: number[] = normalizeSnapPoints(
    this.props.snapPoints,
    screenHeight
  );
  topSnap: number = this.snapPoints[this.snapPoints.length - 1];

  /* Flag indicating that a command to close the bottom sheet was initiated. */
  closed: boolean = false;

  /* Animated value responsible for an animation of the bottom sheet */
  private _masterTranslateY: Animated.Node<number>;

  /* Clock used for snapping animations of the bottom sheet */
  _clock = new Animated.Clock();

  /* Snap points mapped to Animated values */
  _snapPoints: Animated.Value<number>[] = [];

  /* Value of a current dragging postion */
  _dragY: Animated.Value<number> = new Animated.Value(0);

  /* Value of a current speed of dragging */
  _velocityY: Animated.Value<number> = new Animated.Value(0);

  /* State of a gesture */
  _panState: Animated.Value<number> = new Animated.Value(GestureState.END);

  /* Basically last snap point */
  _lastBottomSheetHeight: Animated.Value<number> = new Animated.Value(
    this.snapPoints[
      this.props.initialSnapIndex
        ? this.props.initialSnapIndex
        : this.snapPoints.length - 1
    ]
  );

  /* A flag forcing an animation to run; variables below define the animation */
  _forcedSet: Animated.Value<number> = new Animated.Value(1);

  /* Forcefully set starting point of a spring animation */
  _startSnapPoint = new Animated.Value(screenHeight - this.snapPoints[0]);

  /* Forcefully set destination point of a spring animation */
  _endSnapPoint = new Animated.Value(
    screenHeight -
      this.snapPoints[
        this.props.initialSnapIndex
          ? this.props.initialSnapIndex
          : this.snapPoints.length - 1
      ]
  );

  _resetValues: Animated.Value<number> = new Animated.Value(1);

  /* Gesture mapping */
  _onGestureEvent = Animated.event([
    {
      nativeEvent: {
        translationY: this._dragY,
        velocityY: this._velocityY,
        state: this._panState,
      },
    },
  ]);

  /* Opacity of the view outside of the bottom sheet */
  _masterOpacity: Animated.Node<number>;

  /* @ts-ignore Dragging animation for bottom sheet, calculated as offset + dragging value */
  _draggingAnimation = interpolate(
    Animated.add(
      Animated.sub(screenHeight, this._lastBottomSheetHeight),
      add(this._dragY, ASBS._scrollToDragVal)
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

  handleTapEvent = ({ event }: any) => {
    // if (!this.props.enabledContentGestureInteraction) {
    //   this._velocityScrollY.setValue(0);
    //   this._velocityY.setValue(0);
    // }
    // console.log('Tapped');
  };

  unsubscribeDismissBottomSheet: any;
  unsubscribeSnapTo: any;
  unsubscribeNavigationListener: EventSubscription;
  unsubscribeNavigationBackButtonListener: EmitterSubscription;

  constructor(props: Props) {
    super(props);

    for (let i = 0; i < this.snapPoints.length; i++) {
      this._snapPoints.push(new Animated.Value(this.snapPoints[i]));
    }

    if (props.animationConfig)
      overrideConfig(props.animationConfig);

    ASS.init(this.props.enabledContentGestureInteraction ?? true, this.snapPoints);

    // animated_scroll_store._wasStarted.setValue(1);

    const distance = Animated.proc(
      (
        bottomPoint: Animated.Value<number>,
        upperPoint: Animated.Value<number>
      ) => abs(sub(bottomPoint, upperPoint))
    );

    const toss =
      props.animationConfig && props.animationConfig.toss !== undefined
        ? props.animationConfig.toss
        : 0.28;

    const actualVelocity = cond(eq(ASS._lastState, 2), add(ASBS._velocityY, this._velocityY), this._velocityY);
    const currentPoint = sub(
      this._lastBottomSheetHeight,
      add(this._dragY, ASBS._scrollToDragVal),
      multiply(toss, actualVelocity)
    ) as Animated.Value<number>;

    const rememberAndReturn = Animated.proc((value: Animated.Node<number>) =>
      block([set(this._lastBottomSheetHeight, value), value])
    );
    /**
     * Recursive function finding closest snap point.
     */
    const getClosestSnapPoint = (index: number = 0): Animated.Node<number> => {
      return index === this._snapPoints.length - 1
        ? rememberAndReturn(this._snapPoints[index])
        : // left is top, right is bottom
          (cond(
            greaterThan(
              distance(this._snapPoints[index + 1], currentPoint),
              distance(currentPoint, this._snapPoints[index])
            ),
            rememberAndReturn(this._snapPoints[index]),
            getClosestSnapPoint(index + 1)
          ) as Animated.Value<number>);
    };

    // Does not let the bottom sheet to go higher the highest snap point
    // and below the lowest snap point
    const limitedAnimatedValue = (value: any) => {
      return cond(
        eq(this._lastBottomSheetHeight, this._snapPoints[0]),
        min(value, sub(screenHeight, this.snapPoints[0])),
        max(
          value,
          sub(
            screenHeight,
            this.snapPoints[this.snapPoints.length - 1]
          )
        )
      );
    };

    const generalDebug = (val: readonly number[], msg: string) => {
      console.log(msg);
      console.log(val[0]);
    };

    const snapPointUpdated = (snapPoint: readonly number[]) => {

      if (this.props.onChange) {
        for (let i = 0; i < this.snapPoints.length; i++)
          if (this.snapPoints[i] === snapPoint[0]) {
            this.props.onChange(i);
            break;
          }
      }

      if (snapPoint[0] === 0) this.closeBottomSheet();

    };

    const isRun = new Animated.Value(0);
    const storedResult: Animated.Value<number> = new Animated.Value(0);

    /**
     * Run a function finding a snap point only once. Save result in storedResult variable.
     */
    const runOnce = (func: Animated.Value<number>) => {
      return cond(isRun, storedResult, [
        set(storedResult, func),
        set(isRun, 1),
        set(this._dragY, 0),
        cond(
          eq(ASS._lastState, 2),
          set(this._velocityY, 0),
        ),
        set(ASBS._scrollToDragVal, 0),
        set(ASBS._velocityY, 0),
        storedResult,
      ]);
    };

    const updateWhenFinished: Animated.Node<number> = block([
      cond(this._forcedSet, [
        set(this._lastBottomSheetHeight, sub(screenHeight, this._endSnapPoint)),
        set(this._forcedSet, 0),
      ]),
    ]);

    const currentMovingPoint: Animated.Value<number> = new Animated.Value(0);
    /**
     * Stop the spring animation and reset some values.
     */
    const __stopClock = block([
      set(this._lastBottomSheetHeight, sub(screenHeight, currentMovingPoint)),
      updateWhenFinished,
      set(this._velocityY, 0),
      set(ASS._velocityScrollY, 0),
      set(isRun, 0),
      Animated.stopClock(this._clock),
    ]);

    const runSpringAnimation: Animated.Value<number> = new Animated.Value(0);


    this._masterTranslateY = Animated.block([
      /**
       * Debugging section.
       */
      onChange(
        this._lastBottomSheetHeight,
        call([this._lastBottomSheetHeight], snapPointUpdated)
      ),
      // onChange(
      //   ASBS._scrollToDragVal,
      //   call([ASBS._scrollToDragVal], (snapPoints: readonly number[]) =>
      //     console.log('Changed scrollToDrag: ' + snapPoints[0])
      //   )
      // ),

      // onChange(
      //   this._velocityY,
      //   call([this._velocityY], (val: any) => generalDebug(val ,"Velocity: ")),
      // ),

      /**
       * Main code section.
       */

      cond(this._resetValues, [
        set(ASBS._scrollToDragVal, 0),
        set(ASS._panScrollState, GestureState.END),
        set(ASS._scrollY, 0),
        set(ASS._velocityScrollY, 0),
        set(ASS._prevTransY, 0),
        set(ASS._transY, 0),
        set(this._resetValues, 0),
      ]),

      /**
       * Some values do not get reset for some reason, TODO: investigate why
       * so we reset at the beginning stage when gesture has not
       * been identified yet.
       */
      cond(
        or(
          eq(ASS._panScrollState, GestureState.BEGAN),
          eq(this._panState, GestureState.BEGAN)
        ),
        [
          set(this._velocityY, 0),
          set(ASS._velocityScrollY, 0),
          set(ASBS._scrollToDragVal, 0),
        ]
      ),

      /**
       * Run spring animation when there are no gestures active or
       * when there is a forced call to run the animation.
       */
      set(
        runSpringAnimation,
        or(
          and(
            or(
              eq(this._panState, GestureState.END),
              eq(this._panState, GestureState.CANCELLED),
              eq(this._panState, GestureState.FAILED)
            ),
            or(
              eq(ASS._panScrollState, GestureState.END),
              eq(ASS._panScrollState, GestureState.CANCELLED),
              eq(ASS._panScrollState, GestureState.FAILED)
            )
          ),
          and(
            greaterThan(this._forcedSet, 0),
            neq(this._panState, GestureState.ACTIVE)
          )
        )
      ),

      /**
       * Determines the current state: whether we need to scroll content or
       * drag the sheet.
       */
      cond(
        lessThan(
          sub(
            this._snapPoints[this._snapPoints.length - 1],
            sub(this._lastBottomSheetHeight, ASBS._scrollToDragVal, this._dragY)
          ),
          0.1
        ),
        cond(
          and(greaterThan(ASS._velocityScrollY, 0), eq(ASS._transY, 0)),
          [set(ASS._lastState, 2)],
          set(ASS._lastState, 1)
        ),
        set(ASS._lastState, 2)
      ),

      /**
       * We are always at dragging state when dragging the header.
       */
      cond(
        or(
          eq(this._panState, GestureState.ACTIVE),
          eq(this._panState, GestureState.BEGAN)
        ),
        [ set(ASS._lastState, 2), stopClock(ASS._scrollingClock) ]
      ),

      /**
       * To cover the special case (when starting dragging at the point that is not at the top),
       * we update utility variable ASS._startedAtTheTop.
       */
      cond(
        eq(this._lastBottomSheetHeight, this.topSnap),
        set(ASS._startedAtTheTop, 1),
        set(ASS._startedAtTheTop, 0)
      ),

      cond(
        runSpringAnimation,
        [
          runSpring(
            this._clock,
            limitedAnimatedValue(
              cond(
                this._forcedSet,
                this._startSnapPoint,
                add(
                  sub(screenHeight, this._lastBottomSheetHeight),
                  add(this._dragY, ASBS._scrollToDragVal)
                )
              )
            ) as Animated.Value<number>,
            cond(
              this._forcedSet,
              this._endSnapPoint,
              sub(
                screenHeight,
                runOnce(getClosestSnapPoint() as Animated.Value<number>)
              )
            ),
            actualVelocity as Animated.Value<number>,
            updateWhenFinished,
            isRun,
            currentMovingPoint
          ),
        ],
        [cond(clockRunning(this._clock), __stopClock), this._draggingAnimation]
      ),
    ]);

    // @ts-ignore
    this._masterOpacity = interpolate(this._masterTranslateY, {
      inputRange: [
        screenHeight - this.snapPoints[this.snapPoints.length - 1],
        screenHeight - this.snapPoints[0],
      ],
      outputRange: [this.props.fadeOpacity!, 0],
      extrapolate: Animated.Extrapolate.CLAMP,
    });

    this.unsubscribeNavigationListener =
      Navigation.events().bindComponent(this);

    this.unsubscribeNavigationBackButtonListener =
      Navigation.events().registerNavigationButtonPressedListener(
        (event: NavigationButtonPressedEvent) => {
          if (
            event.buttonId === 'RNN.hardwareBackButton' ||
            event.buttonId === 'RNN.hardwareBack'
          ) {
            this.closeBottomSheet();
          }
        }
      );

    this.unsubscribeSnapTo = listen('BOTTOM_SHEET_SNAP_TO', (index: number) => {
      this.snapTo(screenHeight - this.snapPoints[index]);
    });

    // Executes when the drawer needs to be dismissed
    this.unsubscribeDismissBottomSheet = listen('DISMISS_BOTTOM_SHEET', () => {
      this.closeBottomSheet();
    });
  }

  /** -------------------------------------------- */
  /**               Class methods                  */
  /** -------------------------------------------- */

  /**
   * [ react-native-navigation method. ]
   *
   * Executed when the component is navigated to view.
   */
  componentDidAppear() {
    // this.registerListeners();
  }

  /**
   * [ react-native-navigation method. ]
   *
   * Executed when the component is navigated away from view.
   */
  componentDidDisappear() {}

  componentWillUnmount() {
    this.removeListeners();
  }

  /**
   * Registers all the listenrs for this component
   */
  registerListeners = () => {
    this.unsubscribeSnapTo = listen('BOTTOM_SHEET_SNAP_TO', (index: number) => {
      this.snapTo(screenHeight - this.snapPoints[index]);
    });

    // Executes when the drawer needs to be dismissed
    this.unsubscribeDismissBottomSheet = listen('DISMISS_BOTTOM_SHEET', () => {
      this.closeBottomSheet();
    });
  };

  /**
   * Removes all the listenrs from this component
   */
  removeListeners = () => {
    if (this.unsubscribeNavigationListener)
      this.unsubscribeNavigationListener.remove();
    if (this.unsubscribeNavigationBackButtonListener)
      this.unsubscribeNavigationBackButtonListener.remove();

    if (this.unsubscribeSnapTo) this.unsubscribeSnapTo();
    if (this.unsubscribeDismissBottomSheet)
      this.unsubscribeDismissBottomSheet();
  };

  /**
   * Touched outside drawer
   */
  touchedOutside = () => {
    const { dismissWhenTouchOutside } = this.props;

    if (dismissWhenTouchOutside) {
      this.closeBottomSheet();
    }
  };

  snapTo = (endPoint: number | Animated.Node<number>) => {
    this._endSnapPoint.setValue(endPoint);
    this._startSnapPoint.setValue(
      Animated.add(
        Animated.sub(screenHeight, this._lastBottomSheetHeight),
        this._dragY
      ) as Animated.Value<number>
    );

    this._forcedSet.setValue(1);
  };

  /**
   * Closes the bottom sheet.
   */
  closeBottomSheet = () => {
    if (this.closed) return;

    this.closed = true;

    this.snapTo(screenHeight - this.snapPoints[0]);


    dispatch('MARK_CLOSED');
    setTimeout(() => {
      Navigation.dismissModal(this.props.componentId);
    }, 250);
  };

  render() {
    /** Props */
    const { style, snapPoints } = this.props;

    return (
      <>
        <TapGestureHandler
          maxDurationMs={100000}
          onHandlerStateChange={this.handleTapEvent}
        >
          {/** Screen wrapper **/}
          <View style={styles.containerStyle}>
            {/** Background overlay with dynamic opacity **/}
            <TouchableWithoutFeedback onPress={this.touchedOutside}>
              <Animated.View
                style={[styles.overlayStyle, { opacity: this._masterOpacity }]}
              />
            </TouchableWithoutFeedback>
            {/** Modal wrapper **/}
            <Animated.View
              style={[
                {
                  backgroundColor: this.props.backgroundColor,
                  borderTopLeftRadius: this.props.borderRadius,
                  borderTopRightRadius: this.props.borderRadius,
                  transform: [
                    {
                      translateY: this._masterTranslateY,
                    },
                  ],
                  height: this.topSnap,
                  width: '100%',
                },
                style,
              ]}
            >
              <PanGestureHandler
                onGestureEvent={this._onGestureEvent}
                onHandlerStateChange={this._onGestureEvent}
              >
                {/** Header wrapper **/}
                <Animated.View
                  onLayout={ASS.handleLayoutHeader}
                  style={{
                    zIndex: 101,
                  }}
                >
                  {this.props.renderHeader && this.props.renderHeader()}
                </Animated.View>
              </PanGestureHandler>
              {/** Scroll view wrapper **/}
              <Animated.View
                style={{
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%',
                  borderTopLeftRadius: this.props.borderRadius,
                  borderTopRightRadius: this.props.borderRadius,
                }}
              >
                <PanGestureHandler
                  onGestureEvent={ASS._onGestureEventScrolling}
                  onHandlerStateChange={ASS._onGestureEventScrolling}
                >
                  <Animated.View
                    style={{
                      height: '100%',
                    }}
                  >
                    <Animated.View
                      onLayout={ASS.handleLayoutContent}
                      style={[
                        {
                          transform: [
                            {
                              translateY: ASS._masterScrollY,
                            },
                          ],
                        },
                      ]}
                    >
                      {this.props.renderContent && this.props.renderContent()}
                    </Animated.View>
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </Animated.View>
          </View>
        </TapGestureHandler>
      </>
    );
  }
}

export default gestureHandlerRootHOC(BottomSheet);

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "center",
  },
  overlayStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});

