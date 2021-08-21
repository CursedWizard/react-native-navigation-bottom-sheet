import React, { Component } from 'react'
import { Text, View, } from 'react-native'
import { Navigation, } from 'react-native-navigation';
import { colors, styles } from "../theme";


interface Props {

}

export default class Practise extends Component<Props, {}> {
  state = {}

  static options(props: any) {
    return {
      topBar: {
        title: {
          text: 'Practise',
        },
      },
      bottomTab: {
        text: 'Practise',
        selectedTextColor: colors.green,
        selectedIconColor: colors.green,
        iconColor: colors.grey,
        textColor: colors.grey,
        icon: require("../assets/tabs/round_extension_black_24dp.png")
      },
    };
  }

  render() {
    return (
      <View style={styles.root}>
        <Text> Practise screen </Text>
      </View>
    )
  }
}



