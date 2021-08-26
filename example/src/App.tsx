import { Navigation } from 'react-native-navigation';

import Home from "./screens/Home";
import Practise from "./screens/Practise";
import News from "./screens/News";
import Profile from "./screens/Profile";

Navigation.registerComponent('Practise', () => Practise);
Navigation.registerComponent('Home', () => Home);
Navigation.registerComponent('News', () => News);
Navigation.registerComponent('Profile', () => Profile);

function start() {
  Navigation.setDefaultOptions({
    bottomTab: {
      fontSize: 11,
      selectedFontSize: 11,
    },
  });

  Navigation.events().registerAppLaunchedListener(async () => {
    setRoot();
  });
}

function setRoot() {
    Navigation.setRoot({
      root: {
        bottomTabs: {
          id: 'BOTTOM_TABS_LAYOUT',
          children: [
            {
              component: {
                name: 'Home',
              },
            },

            {
              component: {
                name: 'Practise',
              },
            },

            {
              component: {
                name: 'News',
              },
            },

            {
              component: {
                name: 'Profile',
              },
            },
          ],
          options: {
            bottomTabs: {
              titleDisplayMode: 'alwaysShow',
            },
          },
        },
      },
    });
}

export { start };
