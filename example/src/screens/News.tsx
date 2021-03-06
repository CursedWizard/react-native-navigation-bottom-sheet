import React, { Component } from 'react'
import { Text, StyleSheet, View, Button } from 'react-native';
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import { colors } from "../theme";


RNNBottomSheet.init();

export default class News extends Component {

  renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        height: 250,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
      }}
    >
      <Text>
        In order to close the modal, you can swipe it down, touch the area
        outside it or press the back button.
      </Text>
    </View>
  );

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'whitesmoke',
        }}
      >
        <Button
          onPress={() =>
            RNNBottomSheet.openBottomSheet({
              renderContent: this.renderContent,
              snapPoints: [0, '20%', '40%', '70%'],
              borderRadius: 16,
              onChange: (index: number) => console.log('Snapped to ' + index),
            })
          }
          title="Show bottom sheet"
        />
      </View>
    );
  }
  static options(props: any) {
    return {
      topBar: {
        title: {
          text: 'News',
        },
      },
      bottomTab: {
        text: 'News',
        selectedTextColor: colors.green,
        selectedIconColor: colors.green,
        iconColor: colors.grey,
        textColor: colors.grey,
        icon: require('../assets/tabs/round_feed_black_24dp.png'),
      },
    };
  }
}


const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    paddingLeft: 10,
    marginBottom: 5,
    fontSize: 18,
    height: 54,
  },
});
