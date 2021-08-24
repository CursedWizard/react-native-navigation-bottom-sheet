import React, { Component, createRef } from 'react'
import { Text, View, Button, StyleSheet } from 'react-native';
import { RNNBottomSheet, FlatList } from 'react-native-navigation-bottom-sheet';
import Card from '../components/Card'

RNNBottomSheet.init();

export default class News extends Component {
  flatListRef = createRef<FlatList>();
  renderContent = () => (
    <View>
      <Text style={{ fontSize: 22 }}> Here's a flatlist</Text>
      <FlatList
        getItemLayout={(data, index) => ({
          length: 44,
          offset: 44 * index,
          index,
        })}
        data={[
          { key: 'Devin' },
          { key: 'Dan' },
          { key: 'Dominic' },
          { key: 'Jackson' },
          { key: 'James' },
          // { key: 'Joel' },
          // { key: 'John' },
          // { key: 'Jillian' },
          // { key: 'Jimmy' },
          // { key: 'Julie' },
          // { key: 'Color' },
          // { key: 'Kellor' },
          // { key: 'Kiker' },
          // { key: 'Skfjsj' },
        ]}
        renderItem={({ item }) => <Text style={styles.item}>{item.key}</Text>}
      />
      <FlatList
        gestureRef={this.flatListRef}
        height={300}
        horizontal={true}
        data={[
          { key: 'Devin' },
          { key: 'Dan' },
          { key: 'Dominic' },
          { key: 'Jackson' },
          { key: 'James' },
        ]}
        renderItem={({ item }) => <Card />}
      />
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
              scrollableObjects: [this.flatListRef],
              style: {
                backgroundColor: '#5d95c9',
              },
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
