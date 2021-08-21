import Animated from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

export interface springConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  restSpeedThreshold?: number;
  restDisplacementThreshold?: number;
  toss?: number;
}

export interface BottomSheetInterface {
  _dragY: Animated.Value<number>;
}

export interface RNNBottomSheetProps {
  /**
   * Points for snapping of bottom sheet component. They define distance from bottom of the screen.
   * Might be number or percent (as string e.g. '20%') for points or percents of screen height from bottom.
   */
  snapPoints: (number | string)[];

  /**
   * Initial snap index. Defaults to 0.
   */
  initialSnapIndex?: number;

  /**
   * Method for rendering scrollable content of bottom sheet.
   */
  renderContent?: () => React.ReactNode;

  /**
   * Method for rendering non-scrollable header of bottom sheet.
   */
  renderHeader?: () => React.ReactNode;

  /**
   * Whether the drawer be dismissed when a click is registered outside. Defaults to true.
   */
  dismissWhenTouchOutside?: boolean;

  /**
   * Defines if bottom sheet content could be scrollable by gesture. Defaults to true.
   */
  enabledContentGestureInteraction?: boolean;

  /**
   * Opacity of the screen outside the bottm sheet. Defaults to 0.7.
   */
  fadeOpacity?: number;

  style?: Animated.AnimateStyle<
    Omit<
      ViewStyle,
      | 'flexDirection'
      | 'position'
      | 'top'
      | 'left'
      | 'bottom'
      | 'right'
      | 'opacity'
      | 'transform'
    >
  >;

  /**
   * Background color of the bottom sheet. Defaults to '#fff'.
   */
  backgroundColor?: string;

  /**
   * Border radius of the bottom sheet.
   */
  borderRadius?: number;

  /**
   * Callback when the sheet position changed.
   * @type (index: number) => void;
   */
  onChange?: (index: number) => void;
}

export interface IState {
  heightOfHeader: number;
  contentHeight: Animated.Value<number>;
  scrollEnabled: boolean;
  initialAnimationRunning: boolean;
  sideMenuOpenValue: any;
  sideMenuOverlayOpacity: any;
  sideMenuSwipingStarted: boolean;
  sideMenuIsDismissing: boolean;
  screenHeight: number;
}

