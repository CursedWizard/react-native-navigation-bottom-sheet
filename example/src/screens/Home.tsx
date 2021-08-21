import React, { Component } from 'react'
import { Text, View, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import { Navigation, } from 'react-native-navigation';
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import { colors, styles } from "../theme";

RNNBottomSheet.init();

const DescriptionAfricanCat = () => (
  <View>
    <Text>
      The African wildcat is a small wildcat species native to Africa, West
      and Central Asia up to Rajasthan in India and Xinjiang in China.
    </Text>
  </View>
);

const DescriptionSandCat = () => (
  <View >
    <Text>
      The sand cat, also known as the sand dune cat, is a small wild cat that
      inhabits sandy and stony deserts far from water sources. With its sandy to
      light grey fur, it is well camouflaged in a desert environment.
    </Text>
  </View>
);

const renderContent = () => (
  <>
    <View style={localStyles.panel}>
      <Text style={localStyles.mainTitle}>Sand cat</Text>
      <Image
        source={require('../assets/images/sand_cat.png')}
        style={localStyles.image}
      />
      <DescriptionSandCat />
      <TouchableOpacity style={localStyles.panelButton}>
        <Text style={localStyles.panelButtonTitle}>More</Text>
      </TouchableOpacity>
      <Text style={localStyles.mainTitle}>African wildcat</Text>
      <Image
        source={require('../assets/images/african_cat.png')}
        style={localStyles.image}
      />
      <DescriptionAfricanCat />
      <TouchableOpacity style={localStyles.panelButton}>
        <Text style={localStyles.panelButtonTitle}>More</Text>
      </TouchableOpacity>
    </View>
  </>
);

const renderRowButtons = () => (
  <View style={localStyles.rowButtons}>
    <Button color={colors.green} onPress={() => RNNBottomSheet.snapTo(1)} title="1"></Button>
    <Button color={colors.green} onPress={() => RNNBottomSheet.snapTo(2)} title="2"></Button>
    <Button color={colors.green} onPress={() => RNNBottomSheet.snapTo(3)} title="3"></Button>
    <Button color={colors.green} onPress={() => RNNBottomSheet.snapTo(4)} title="4"></Button>
  </View>
)

const renderHeader = () => (
  <View style={localStyles.header}>
    <View style={localStyles.panelHeader}>
      <View style={localStyles.panelHandle} />
    </View>
  </View>
);

interface Props {

}

export default class Home extends Component<Props, {}> {
  state = {}

  static options(props: any) {
    return {
      topBar: {
        title: {
          text: 'Home',
        },
      },
      bottomTab: {
        text: 'Home',
        selectedTextColor: colors.green,
        selectedIconColor: colors.green,
        iconColor: colors.grey,
        textColor: colors.grey,
        icon: require("../assets/tabs/round_home_black_24dp.png"),
      },
    };
  }

  render() {
    return (
      <>
        <View style={styles.root}>
          <Button
            onPress={() =>
              RNNBottomSheet.openBottomSheet({
                renderContent: renderContent,
                renderHeader: renderHeader,
                snapPoints: [0, '30%', '50%', '70%', '90%'],
                borderRadius: 16,
                onChange: (index: number) => console.log(index),
                enabledContentGestureInteraction: true,
                style: {
                  backgroundColor: 'white',
                },
              })
            }
            title="Show modal"
          />
        </View>
      </>
    );
  }
}


const localStyles = StyleSheet.create({
  panel: {
    // height: 800,
    padding: 20,
    backgroundColor: 'white',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panelButton: {
    padding: 13,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: 'center',
    marginVertical: 7,
  },
  numberButton: {
    padding: 10,
    backgroundColor: colors.green,
  },
  image: {
    marginVertical: 10,
    alignItems: 'center',
    width: 300,
    height: 200,
    borderRadius: 6,
  },

  mainTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.slate,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  header: {
    backgroundColor: '#fff',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  panelHeader: {
    alignItems: 'center',
  },

  rowButtons: {
    height: 100,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
});
