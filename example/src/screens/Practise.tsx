import React, { Component } from 'react'
import { Text, View, Button, StyleSheet } from 'react-native'
import { Navigation, } from 'react-native-navigation';
import { colors } from "../theme";
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import { LoremIpsum } from "../components/Lorem";

RNNBottomSheet.init();

interface Props {

}

/**
 * Scrolling test
 */

export default class Practise extends Component<Props, {}> {
  state = {};

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  renderContent = () => {
    return (
      <View style={{height: 2000}}>
        <LoremIpsum />
        <LoremIpsum />
      </View>
    );
  };
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
        icon: require('../assets/tabs/round_extension_black_24dp.png'),
      },
    };
  }

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
              style: {
                backgroundColor: '#5d95c9',
              },
              // animationConfig: { deceleration: 0.999 },
              renderContent: this.renderContent,
              renderHeader: this.renderHeader,
              snapPoints: [0, '20%', '70%'],
              borderRadius: 16,
              onChange: (index: number) => console.log('Snapped to ' + index),
            })
          }
          title="Show bottom sheet"
        />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  item: {
    paddingLeft: 10,
    marginBottom: 5,
    fontSize: 18,
    height: 54,
  },
  header: {
    backgroundColor: '#5d95c9',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
});

