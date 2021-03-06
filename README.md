#  :page_with_curl: ​React Native Navigation Bottom Sheet Extension

A performant customizable bottom sheet component made on top of wix react-native-navigation library. The component is built using [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler) and [react-native-reanimated](https://github.com/kmagiera/react-native-reanimated). This solution uses `showModal` under the hood to display the bottom sheet. Default animations and hardware back button press are overridden and properly adjusted for seamless integration with react-native-navigation library.

| ![](assets/scrolling_view.gif) | ![](assets/snapping_points.gif) | ![](assets/dialog.gif) |
| :----------------------------: | :-----------------------------: | :--------------------: |

To replicate the behavior of the bottom sheet as showcased in gifs above check out the `example/` folder.

## ✨ Features

* Smooth interactions & snapping animations
* Customizable
* Supports multiple snapping points
* Seamless integration with react-native-navigation
* Scrollable content

## 📦 Installation

Below I listed commands using yarn but you also can use npm to install the package.

```sh
yarn add react-native-navigation-bottom-sheet
```

You also need to install `react-native-gesture-handler` and `react-native-reanimated`
dependecies. Since the latest release (1.3.0) the bottom sheet is compatible with
both versions of `react-native-reanimated` library. If you are developing for Android
and don't want to do any additional configuration besides installing the package, you might want to install version 1. For more info on installation of reanimated version 2 check out their [official documentation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation).

Reanimated version 1:
```sh
yarn add react-native-gesture-handler react-native-reanimated@1.13.2
```
Reanimated version 2 (latest version):
```sh
yarn add react-native-gesture-handler react-native-reanimated
```

## 🚀 Usage

You should initialize RNNBottomSheet first by calling init() method.

Then you can open the bottom sheet using the openBottomSheet() method. This function accepts object with props described in the section below.

```js
import React, { Component } from 'react'
import { Text, View, Button } from 'react-native';
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';

RNNBottomSheet.init();

export default class App extends Component {
renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        height: 350,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
      }}
    >
      <Text>
        In order to close the modal, you can swipe it down, touch the area outside
        it or press the back button.
      </Text>
    </View>
  );


  render() {
    return (
        <View style={{
            flex: 1,
    		alignItems: 'center',
    		justifyContent: 'center',
    		backgroundColor: 'whitesmoke',
        }}>
          <Button
            onPress={() =>
              RNNBottomSheet.openBottomSheet({
                renderContent: this.renderContent,
                snapPoints: [0, '20%', '40%', '70%'],
                borderRadius: 16,
                onChange: (index: number) => console.log("Snapped to " + index),
              })
            }
            title="Show modal"
          />
        </View>
    );
  }
}
```

## ⚙️ Props

|               name               | required |          type           | description                                                  |
| :------------------------------: | :------: | :---------------------: | :----------------------------------------------------------- |
|            snapPoints            |   yes    |  (number \| string)[]   | Points for snapping of the bottom sheet component. They define distance from bottom of the screen. Might be number or percent (as string e.g. '20%'). Example: [0, 100, 500]. |
|         initialSnapIndex         |    no    |         number          | Index of a point the bottom sheet should snap to when the component mounts. Defaults to the last point specified in the snapPoints array. |
|          renderContent           |    no    |        ReactNode        | Method for rendering scrollable content of the bottom sheet. |
|           renderHeader           |    no    |        ReactNode        | Method for rendering non-scrollable header of the bottom sheet. |
|     dismissWhenTouchOutside      |    no    |         boolean         | Should the bottom sheet be dismissed when touched outside. Default true. |
| enabledContentGestureInteraction |    no    |         boolean         | Defines if the bottom sheet content could be scrollable by gesture. Default true. |
|           fadeOpacity            |    no    |         number          | Opacity of the screen outside the bottom sheet. Default 0.7. |
|           borderRadius           |    no    |         number          | Border radius of the bottom sheet. Note if you have header rendered, header should have border radius too. |
|         backgroundColor          |    no    |         string          | Background color of the bottom sheet. Default '#fff'.        |
|             onChange             |    no    | (index: number) => void | Callback when the sheet position changed.                    |
|              style               |    no    |        StyleProp        | Any valid style properties.                                  |
|         animationConfig          |    no    |     AnimationConfig     | Object consisting of several options defining behavior of animations. See the list of options below. |

## `AnimationConfig` options

|          option           | description                                                  |
| :-----------------------: | ------------------------------------------------------------ |
|       deceleration        | Deceleration rate of content scrolling or rate of decay. Accepts values from 0 to 1. Default 0.997. |
|         stiffness         | The spring stiffness coefficient. Default 121.6              |
|          damping          | Defines how the spring’s motion should be damped due to the forces of friction. Default 50. |
|           mass            | The mass of the object attached to the end of the spring. Default 0.3. |
|      velocityFactor       | Scrolling velocity amplifier. Resulting velocity of the scroll is calculated as `origianlVelocity *  velocityFactor`. Default 0.9. |
|    restSpeedThreshold     | The speed at which the spring should be considered at rest in pixels per second. Default 0.3. |
| restDisplacementThreshold | The threshold of displacement from rest below which the spring should be considered at rest. Default 0.3. |

## :wrench: Methods

`init()`

A wrapper around _Navigation.registerComponent()_ function. Name assigned to the component can be received later by calling _getComponentName()_ method.

`openBottomSheet(props)`

Opens the bottom sheet and snaps it to the point either specified in props or to the top one otherwise. A wrapper function around _Navigation.showModal()_, that passes the props along with other options.

`closeBottomSheet()`

Closes the bottom sheet.

`getComponentName()`

Returns a name of the component that is used when calling registerComponent() method.

`isOpened()`

Returns a boolean indicating whether the bottom sheet is opened or not.

## :warning: Take into account

I developed and tested the component primarily on Android devices and even though, theoretically, it should also work on iOS, I can't test it and thus vouch that it will function the same way.

## :clipboard: Roadmap

The project is still in development and here's a list of features / fixes i am planning to address:

- [x] add decay animation for scrolling (29.08.2021)
- [ ] add better support for FlatList and SectionList (for now there are only wrappers)
- [ ] add more options for customization
- [ ] add an option to automatically adjust bottom sheet height based on scrolling content
- [ ] add an option to dynamically change opacity of the bottom sheet
- [ ] add dedicated support for horizontal scrolling inside the bottom sheet
- [ ] explore new ways to optimize animations and loading of the bottom sheet

Feel free to suggest your own ideas.

## :bug: ​Something doesn't work?

Don't hesitate to file an issue about any kind of malfunction you experienced. You can also DM me by my email imaginary.loyalist@gmail.com

## :book: License

MIT
