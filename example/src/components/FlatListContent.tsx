import React, { Component } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, TouchableRipple, Text } from 'react-native-paper';
import { FlatList, SectionList } from 'react-native-navigation-bottom-sheet';
// import { Card } from 'react-native-ui-lib';

const DATA: any = [];

for (let i = 0; i < 16; i++) {
  DATA.push({
    id: `${i}`,
    title: `${i} Title`,
    text: `${i} Item`,
  });
}

const Item = ({ item }: any) => (
    <Card style={{ width: '95%', alignSelf: 'center', marginBottom: 36 }} >
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.text}</Paragraph>
      </Card.Content>
    </Card>
);

const FlatListContent = () => (
  <View style={{ padding: 16 }}>
    <FlatList data={DATA} renderItem={Item} />
  </View>
);
const sectionData = [
  {
    title: "Main dishes",
    data: ["Pizza", "Burger", "Risotto"]
  },
  {
    title: "Sides",
    data: ["French Fries", "Onion Rings", "Fried Shrimps"]
  },
  {
    title: "Drinks",
    data: ["Water", "Coke", "Beer"]
  },
  {
    title: "Desserts",
    data: ["Cheese Cake", "Ice Cream"]
  }
];

const SectionItem = ({ title }: any) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const SectionListContent = () => (
  <View style={{ padding: 16 }}>
    <SectionList
      sections={sectionData}
      renderItem={({ item }) => <SectionItem title={item} />}
      keyExtractor={(item, index) => item + index}
      renderSectionHeader={({ section: { title } }) => <Text style={styles.header}>{title}</Text>}
    />
  </View>
);

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24
  }
});

export { FlatListContent, SectionListContent };
