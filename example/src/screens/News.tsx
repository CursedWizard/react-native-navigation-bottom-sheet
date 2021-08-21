import React, { Component } from 'react'
import { Text, View, } from 'react-native'
import { Navigation, } from 'react-native-navigation';
import { colors, styles } from "../theme";


interface Props {

}

export default class News extends Component<Props, {}> {
  state = {}

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
        icon: require("../assets/tabs/round_feed_black_24dp.png")
      },
    };
  }

  render() {
    return (
      <View style={styles.root}>
        <Text> News screen </Text>
      </View>
    )
  }
}



