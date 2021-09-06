import React, { Component, createRef } from 'react'

import {
  SectionList as RNSectionList,
  SectionListProps as RNSectionListProps,
  StyleProp,
  ViewStyle,
  View
} from 'react-native';
import Animated from 'react-native-reanimated';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

const AnimatedSectionList = Animated.createAnimatedComponent(
  RNSectionList
) as React.ComponentClass<
  Animated.AnimateProps<ViewStyle, RNSectionListProps<any>>,
  any
>;

type Props<T> = Omit<
  RNSectionListProps<T>,
  | 'overScrollMode'
  | 'bounces'
  | 'decelerationRate'
  | 'onScrollBeginDrag'
  | 'scrollEventThrottle'
  | 'style'
> & {
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  height?: number;
  gestureRef?: any;
};


export default class FlatList extends Component<Props<any>, {}> {
  state = {
    scrollContentHeight: 0,
  };
  nativeGestureRef = createRef<NativeViewGestureHandler>();

  handleScrollSizeChange = (w: number, h: number) => {
    this.setState({
      scrollContentHeight: h,
    });
  };

  render() {
    const { ...props } = this.props;

    return (
      <View style={{ height: props.height ? props.height : this.state.scrollContentHeight }}>
        <NativeViewGestureHandler ref={props.gestureRef ? props.gestureRef : this.nativeGestureRef}>
          <AnimatedSectionList
            {...props}
            onContentSizeChange={this.handleScrollSizeChange}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
            scrollEventThrottle={16}
          />
        </NativeViewGestureHandler>
      </View>
    );
  }
}

