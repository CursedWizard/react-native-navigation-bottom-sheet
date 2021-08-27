
/** -------------------------------------------- */
/**          Utility functions                   */
/** -------------------------------------------- */

import Animated, { Easing } from "react-native-reanimated";

const magic = {
  damping: 50,
  mass: 0.3,
  stiffness: 121.6,
  overshootClamping: true,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3,
  deceleration: 0.999,
  bouncyFactor: 1,
  velocityFactor: 0.9,
  toss: 0.4,
  coefForTranslatingVelocities: 5,
}

const {
  damping,
  mass,
  stiffness,
  overshootClamping,
  restSpeedThreshold,
  restDisplacementThreshold,
} = magic


const {
  set,
  cond,
  multiply,
  decay,
  lessThan,
  timing,
  block,
  min,
  max,
  Value,
  spring,
  clockRunning,
  startClock,
  stopClock,
  greaterOrEq,
} = Animated

/**
 * Converts snap points with percentage to fixed numbers.
 */
export const normalizeSnapPoints = (
  snapPoints: ReadonlyArray<number | string>,
  containerHeight: number,
) =>
  snapPoints.map(snapPoint => {
    return typeof snapPoint === 'number'
      ? snapPoint
      : (Number(snapPoint.split('%')[0]) * containerHeight) / 100;
  });

export function runDecay(
  clock: Animated.Clock,
  value: Animated.Node<number>,
  velocity: Animated.Node<number>,
  positionToUpdate: any,
  wasStarted: Animated.Value<number>,
  contentHeight: Animated.Value<number>
) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  }

  const config = { deceleration: magic.deceleration }

  const resultScroll = max(min(state.position, 0), multiply(contentHeight, -1));
  return block([
    // cond(wasStarted, [stopClock(clock), set(wasStarted, 0)]),
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, multiply(velocity, magic.velocityFactor)),
      set(state.position, value),
      set(state.time, 0),
      startClock(clock),
    ]),
    cond(greaterOrEq(resultScroll, 0), [set(state.finished, 1), stopClock(clock)]),
    cond(lessThan(resultScroll, multiply(contentHeight, -1)), [set(state.finished, 1), stopClock(clock)]),
    cond(clockRunning(clock), [
      // positionToUpdate(state.position),
      cond(state.finished, 0, set(positionToUpdate, resultScroll)),
      cond(wasStarted, set(positionToUpdate, 0)),
      decay(clock, state, config),
    ]),
    cond(state.finished, [stopClock(clock)]),
    resultScroll,
  ]);
}

export function runTiming(
  clock: Animated.Clock,
  value: Animated.Node<number>,
  dest: Animated.Value<number>,
  flagFinished: Animated.Value<number>
) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: 200,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease),
  };

  return block([
    cond(
      clockRunning(clock),
      [
        // if the clock is already running we update the toValue, in case a new dest has been passed in
        set(config.toValue, dest),
      ],
      [
        // if the clock isn't running we reset all the animation params and start the clock
        set(state.finished, 0),
        set(state.time, 0),
        set(state.position, value),
        set(state.frameTime, 0),
        set(config.toValue, dest),
        startClock(clock),
      ],
    ),
    // we run the step here that is going to update position
    timing(clock, state, config),
    // if the animation is over we stop the clock
    cond(state.finished, [stopClock(clock), set(flagFinished, 1)]),
    // we made the block return the updated position
    state.position,
  ]);
}

export function runSpring(
  clock: Animated.Clock,
  start: Animated.Value<number>,
  end: Animated.Node<number>,
  velocity: Animated.Value<number>,
  updateWhenFinished: Animated.Node<number>,
  wasRun: Animated.Value<number>,
  valueToUpdate: Animated.Value<number>,
) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = {
    damping,
    mass,
    stiffness,
    overshootClamping,
    restSpeedThreshold,
    restDisplacementThreshold,
    toValue: new Value(0),
  };

  return block([
    cond(
      clockRunning(clock),
      [
        // if the clock is already running we update the toValue, in case a new dest has been passed in
        set(config.toValue, end),
      ],
      [
        // if the clock isn't running we reset all the animation params and start the clock
        // set(forcedFlag, 0),
        set(state.finished, 0),
        set(state.position, start),
        set(state.velocity, velocity),
        set(state.time, 0),
        set(config.toValue, end),
        startClock(clock),
      ],
    ),

    spring(clock, state, config),
    cond(state.finished, [stopClock(clock), set(wasRun, 0), updateWhenFinished]),
    set(valueToUpdate, state.position),
    state.position,
  ]);
}

