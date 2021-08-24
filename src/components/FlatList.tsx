
import React, { Component, useRef, createRef } from 'react'

import {
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  LayoutChangeEvent,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
  View
} from 'react-native';
import Animated from 'react-native-reanimated';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

const AnimatedFlatList = Animated.createAnimatedComponent(
  RNFlatList
) as React.ComponentClass<
  Animated.AnimateProps<ViewStyle, RNFlatListProps<any>>,
  any
>;

type Props<T> = Omit<
  RNFlatListProps<T>,
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
  scrollableRef: any = createRef();

  handleLayoutChange = (event: LayoutChangeEvent) => {
    console.log('Height: ');
    console.log(event.nativeEvent.layout.height);
  };

  handleScrollSizeChange = (w: number, h: number) => {
    console.log('Height: ');
    console.log(h);
    this.setState({
      scrollContentHeight: h,
    });
  };

  render() {
    const { ...rest } = this.props;

    return (
      <View style={{ height: rest.height ? rest.height : this.state.scrollContentHeight }}>
        <NativeViewGestureHandler ref={this.props.gestureRef ? this.props.gestureRef : this.nativeGestureRef}>
          <AnimatedFlatList
            {...rest}
            contentContainerStyle={{ paddingBottom: 0 }}
            onContentSizeChange={this.handleScrollSizeChange}
            // ref={this.scrollableRef}
            showsVerticalScrollIndicator={false}
            initialNumToRender={7}
            overScrollMode="never"
            bounces={false}
            scrollEventThrottle={16}
          />
        </NativeViewGestureHandler>
      </View>
    );
  }
}

