import React, { Component } from 'react'
import { Text, View, } from 'react-native'
import { Navigation, } from 'react-native-navigation';
import { colors, styles } from "../theme";


interface Props {

}

export default class Profile extends Component<Props, {}> {
  state = {}

  static options(props: any) {
    return {
      topBar: {
        title: {
          text: 'Profile',
        },
      },
      bottomTab: {
        text: 'Profile',
        selectedTextColor: colors.green,
        selectedIconColor: colors.green,
        iconColor: colors.grey,
        textColor: colors.grey,
        icon: require("../assets/tabs/round_manage_accounts_black_24dp.png")
      },
    };
  }

  render() {
    return (
      <View style={styles.root}>
        <Text> Profile screen </Text>
      </View>
    )
  }
}



