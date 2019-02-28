import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser, MapView, Location, Permissions, Icon } from 'expo';
import { getDistance } from 'geolib';

import { MonoText } from '../components/StyledText';

import mapStyle from '../constants/mapstyle';

const ACCURACY_THRESHOLD = 10; // 10 meters
const DISTANCE_THRESHOLD = 6; // 6 meters

export default class MapScreen extends React.Component {
  state = {
    mapRegion: {
      latitude: 55.8536939,
      longitude: -4.2424968,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    hasLocationPermissions: false,
    locationResult: null,
    currentMapRegion: null,
    currentUserLocation: null,
    currentRoute: [],
    currentTravelDistance: 0,
    lastValidCoord:  null,
    recordingRoute: false,
    startLocation: null,
    marginBottom: 1,
  };

  componentDidMount() {
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }
    console.log("got location");
    let location = await Location.getCurrentPositionAsync({});
    let mRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

    this.setState({ locationResult: JSON.stringify(location) });
    this.setState({ currentMapRegion: mRegion });
    this.setState({ currentUserLocation: mRegion });

    console.log(this.state.locationResult);
    console.log(this.state.currentMapRegion);

    // Center the map on the location we just fetched.
    // this.setState({mapRegion: mRegion}); // uncomment to 'snap' to current location
    this._mapView.animateToRegion(mRegion, 2000);
  };

  _onMapReady = () => this.setState({marginBottom: 0});

  _onStartRoute = async () => {
    this.setState({
      startLocation: this.state.currentMapRegion,
    });
    (this.state.recordingRoute) ? console.log("finished route") : console.log("started route");
    this.setState({
      recordingRoute: !this.state.recordingRoute,
    });
  };

  _onUserLocationChange = async (event) => {
    let coords = event.nativeEvent.coordinate;
    this.setState({ currentUserLocation: coords });
    if (this.state.recordingRoute) {
      this.state.currentRoute.push(coords);
      let route = this.state.currentRoute;
      if (route.length > 1) {
        if (coords.accuracy < ACCURACY_THRESHOLD) {
          if (this.state.lastValidCoord == null) {
            this.setState({ lastValidCoord: coords });
          } else {
            let distanceTravelled = getDistance(this.state.lastValidCoord, coords, 0.1, 3);
            if (distanceTravelled > DISTANCE_THRESHOLD) {
              console.log(distanceTravelled);
              this.setState({ lastValidCoord: coords });
              this.state.currentTravelDistance += distanceTravelled;
            }
          }
        }
        console.log("Distance:", this.state.currentTravelDistance);
      }
    }
  };

  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          ref = {(mapView) => { this._mapView = mapView; }}
          style={{ flex: 1, marginBottom: this.state.marginBottom}}
          initialRegion={this.state.mapRegion}
          provider={"google"}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
          onMapReady={this._onMapReady}
          onUserLocationChange={this._onUserLocationChange}
        />
        <View
          style={styles.distanceValue}
        >
          <Text color="#ffffff">{this.state.currentTravelDistance} meters</Text>
        </View>
        <TouchableOpacity
          onPress={this._onStartRoute}
          style={styles.startButton}
        >
          <Icon.Ionicons name={'ios-play'}  size={50} color="#ffffff" style={styles.playIcon}/>
        </TouchableOpacity>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  startButton: {
    borderWidth: 1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    width: 70,
    height: 70,
    backgroundColor:'#01a699',
    borderRadius: 100,
    position: 'absolute',
    top: '88%',
    alignSelf: 'flex-end',
    right: '4%',
    shadowColor: 'black',
    shadowOffset: {
      weight: 6,
      height: 3
    },
    shadowRadius: 2,
    shadowOpacity: 0.6,
    elevation: 6,
  },
  playIcon: {
    height: 50,
    width: 50,
    paddingLeft: 5,
    textAlign: 'center'
  },
  distanceValue: {
    elevation: 6,
  }
});
