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
import { runSpring, normalizeSnapPoints } from './utility';
import { AnimatedStoreScrolling as ASS } from "./animatedStore";
// import { AnimatedStoreSheet as ASBS } from "./animatedStoreSheet";
import { MasterStore as ASBS } from './masterStore';

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
} = Animated;

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

  /* Clock used for an animation of a scrolling view (not implemented yet) */
  _scrollingClock = new Animated.Clock();

  /* Snap points mapped to Animated values */
  _snapPoints: Animated.Value<number>[] = [];

  /* Value of a current dragging postion */
  _dragY: Animated.Value<number> = new Animated.Value(0);

  /* Value of a current speed of dragging */
  _velocityY: Animated.Value<number> = new Animated.Value(0);

  /* State of a gesture */
  _panState: Animated.Value<number> = new Animated.Value(GestureState.END);

  /* Position of a last tap */
  _absoluteY: Animated.Value<number> = new Animated.Value(0);

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

  /* Value of a current dragging postion of content in the scroll view */
  _scrollY: Animated.Value<number> = new Animated.Value(0);

  _lastScrollY: Animated.Value<number> = new Animated.Value(0);

  _masterScrollY: Animated.Value<number> = new Animated.Value(0);

  /* Value of a current speed of content dragging in the scroll view  */
  _velocityScrollY: Animated.Value<number> = new Animated.Value(0);

  /* State of a gesture for a scroll view */
  _panScrollState: Animated.Value<number> = new Animated.Value(GestureState.END);

  _onGestureEventScrolling = Animated.event([
    {
      nativeEvent: {
        translationY: this._scrollY,
        velocityY: this._velocityScrollY,
        state: this._panScrollState,
      },
    },
  ]);

  /* Animated value mapped to _dragY from _scrollY */
  _scrollToDragVal: Animated.Value<number> = new Animated.Value(0);

  _masterOpacity: Animated.Node<number>;

  /* Dragging animation for bottom sheet, calculated as offset + dragging value */
  _draggingAnimation = Animated.interpolate(
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

  handleLayoutHeader = ({
    nativeEvent: {
      layout: { height: heightOfHeader },
    },
  }: LayoutChangeEvent) => {
    this.setState({ heightOfHeader });
  };

  handleLayoutContent = ({
    nativeEvent: {
      layout: { height },
    },
  }: LayoutChangeEvent) => {
    const resultHeight = this.props.enabledContentGestureInteraction
      ? height +
        this.state.heightOfHeader -
        this.snapPoints[this.snapPoints.length - 1]
      : 0;

    console.log(height + this.state.heightOfHeader - this.snapPoints[this.snapPoints.length - 1]);
    this.state.contentHeight.setValue(Math.max(resultHeight, 0));
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

    ASS.init(this.props.enabledContentGestureInteraction ?? true, this.snapPoints);

    // animated_scroll_store._wasStarted.setValue(1);

    const distance = Animated.proc(
      (
        bottomPoint: Animated.Value<number>,
        upperPoint: Animated.Value<number>
      ) => Animated.abs(Animated.sub(bottomPoint, upperPoint))
    );

    const currentPoint = Animated.sub(
      this._lastBottomSheetHeight,
      add(this._dragY, ASBS._scrollToDragVal),
      Animated.multiply(0.25, this._velocityY)
    ) as Animated.Value<number>;

    const rememberAndReturn = Animated.proc((value: Animated.Node<number>) =>
      Animated.block([Animated.set(this._lastBottomSheetHeight, value), value])
    );
    /**
     * Recursive function finding closest snap point.
     */
    const getClosestSnapPoint = (index: number = 0): Animated.Node<number> => {
      return index === this._snapPoints.length - 1
        ? rememberAndReturn(this._snapPoints[index])
        : // left is top, right is bottom
          (Animated.cond(
            Animated.greaterThan(
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
      return Animated.cond(
        Animated.eq(this._lastBottomSheetHeight, this._snapPoints[0]),
        Animated.min(value, Animated.sub(screenHeight, this.snapPoints[0])),
        Animated.max(
          value,
          Animated.sub(
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

    // MS.init(snapPointUpdated);

    const curScroll: Animated.Value<number> = new Animated.Value(0);
    const resultScroll = max(
      min(add(this._lastScrollY, curScroll), 0),
      multiply(this.state.contentHeight, -1)
    );

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
        set(this._velocityY, 0),
        set(this._lastScrollY, resultScroll),
        set(this._scrollY, 0),
        set(ASBS._scrollToDragVal, 0),
        set(this._velocityScrollY, 0),
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
      set(this._velocityScrollY, 0),
      set(this._velocityY, 0),
      set(isRun, 0),
      Animated.stopClock(this._clock),
    ]);

    this._masterScrollY = block([
      cond(
        lessThan(
          sub(
            this._snapPoints[this._snapPoints.length - 1],
            this._lastBottomSheetHeight
          ),
          10
        ),
        // if the bottom sheet is snapped to the very top
        [
          set(
            ASBS._scrollToDragVal,
            max(add(this._scrollY, this._lastScrollY), 0)
          ),
          set(curScroll, this._scrollY),
          cond(
            greaterThan(add(this._scrollY, this._lastScrollY), -1),
            set(this._velocityY, this._velocityScrollY)
          ),
        ],
        [
          set(this._velocityY, this._velocityScrollY),
          set(ASBS._scrollToDragVal, this._scrollY),
          set(
            curScroll,
            min(
              add(
                sub(
                  this._snapPoints[this._snapPoints.length - 1],
                  this._lastBottomSheetHeight
                ),
                this._scrollY
              ),
              0
            )
          ),
        ]
      ),
      cond(eq(this._panScrollState, GestureState.BEGAN), set(this._velocityY, 0)),
      cond(
        or(
          Animated.eq(this._panScrollState, GestureState.END),
          Animated.eq(this._panScrollState, GestureState.CANCELLED),
          Animated.eq(this._panScrollState, GestureState.FAILED)
        ),
        [set(this._lastScrollY, resultScroll)],
        [cond(clockRunning(this._clock), __stopClock)]
      ),
      resultScroll,
    ]) as Animated.Value<number>;

    const runSpringAnimation: Animated.Value<number> = new Animated.Value(0);

    this._masterTranslateY = Animated.block([
      onChange(
        this._lastBottomSheetHeight,
        call([this._lastBottomSheetHeight], snapPointUpdated)
      ),
      // onChange(
      //   this._scrollToDragVal,
      //   call([this._scrollToDragVal], (val: any) => generalDebug(val ,"ScrollTodrag: ")),
      // ),

      cond(
        lessThan(
          sub(
            this._snapPoints[this._snapPoints.length - 1],
            add(this._lastBottomSheetHeight, ASBS._scrollToDragVal, this._dragY)
          ),
          10
        ),
        set(ASBS._snappedToTop, 1),
        set(ASBS._snappedToTop, 0)
      ),
      set(
        runSpringAnimation,
        or(
          and(
            or(
              Animated.eq(this._panState, GestureState.END),
              Animated.eq(this._panState, GestureState.CANCELLED),
              Animated.eq(this._panState, GestureState.FAILED)
            ),
            or(
              Animated.eq(ASS._panScrollState, GestureState.END),
              Animated.eq(ASS._panScrollState, GestureState.CANCELLED),
              Animated.eq(ASS._panScrollState, GestureState.FAILED)
            )
            // not(eq(add(this._lastBottomSheetHeight, this._dragY), 500)),
          ),
          and(
            greaterThan(this._forcedSet, 0),
            neq(this._panState, GestureState.ACTIVE)
          )
        )
      ),
      Animated.cond(
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
            this._velocityY,
            updateWhenFinished,
            isRun,
            currentMovingPoint
          ),
        ],
        [
          cond(Animated.clockRunning(this._clock), __stopClock),
          // Animated.stopClock(this.clock),
          this._draggingAnimation,
        ]
      ),
    ]);

    this._masterOpacity = Animated.interpolate(this._masterTranslateY, {
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
    console.log('Registering listeners...');
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
    console.log('Touched outsied');
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

    console.log('Closing bottom sheet');
    this.closed = true;

    this.snapTo(screenHeight - this.snapPoints[0]);


    dispatch('MARK_CLOSED');
    setTimeout(() => {
      ASS._scrollY.setValue(0);
      ASS._velocityScrollY.setValue(0);
      ASS._panScrollState.setValue(0);
      ASS._prevTransY.setValue(0);
      ASS._transY.setValue(0);
      ASS._wasStarted.setValue(1);
      Navigation.dismissModal(this.props.componentId);
    }, 250);
    // setTimeout(() => Navigation.dismissOverlay(this.props.componentId), 250);
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
                },
                style,
                {
                  height: this.topSnap,
                  width: '100%',
                  transform: [
                    {
                      translateY: this._masterTranslateY,
                    },
                  ],
                },
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
                  borderTopLeftRadius: this.props.borderRadius,
                  borderTopRightRadius: this.props.borderRadius,
                }}
              >
                <PanGestureHandler
                  onGestureEvent={ASS._onGestureEventScrolling}
                  onHandlerStateChange={ASS._onGestureEventScrolling}
                  // waitFor={this.props.scrollableObjects ? this.props.scrollableObjects[0] : null}
                  // simultaneousHandlers={this.props.scrollableObjects ? this.props.scrollableObjects[0] : null}
                >
                  <Animated.View
                    style={{
                      height: this.topSnap,
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
  },
  overlayStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});

