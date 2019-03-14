import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
} from 'react-native';
import { WebBrowser, MapView, Location, Permissions, Icon } from 'expo';
import { NavigationEvents } from 'react-navigation';

import { getDistance } from 'geolib';
import AnimateNumber from '@bankify/react-native-animate-number';

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
    currentTravelScore: 0,
    currentBicycle: true,
    currentScooter: false,
    transportMultiplier: 1.5,
    lastValidCoord:  null,
    recordingRoute: false,
    startLocation: null,
    marginBottom: 1,
  };

  componentDidMount() {
    this._getLocationAsync();
    this._getLastScore();
    this._getCurrentTransport();
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
    let location = await Location.getCurrentPositionAsync({});
    let mRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

    this.setState({ locationResult: JSON.stringify(location) });
    this.setState({ currentMapRegion: mRegion });
    this.setState({ currentUserLocation: mRegion });

    // Center the map on the location we just fetched.
    // this.setState({mapRegion: mRegion}); // uncomment to 'snap' to current location
    this._mapView.animateToRegion(mRegion, 2000);
  };

  _getLastScore = async () => {
    try {
      const score = await AsyncStorage.getItem('@xPlore_Store:currScore');
      if (score !== null) {
        this.setState({
          currentTravelScore: parseFloat(score),
        });
        console.info("Updated score from storage");
      }
    } catch (error) {
      console.error("Error with retrieving score: ", error);
    }
  };

  _getCurrentTransport = async () => {
    try {
      const transport = await AsyncStorage.getItem('@xPlore_Store:currTransport');
      if (transport !== null) {
        if (transport === 'scooter') {
          this.setState({
            currentBicycle: false,
            currentScooter: true,
            transportMultiplier: 3,
          });
        } else {
          this.setState({
            currentBicycle: true,
            currentScooter: false,
            transportMultiplier: 1.5,
          });
        }
        console.info("Updated transport from storage");
      }
    } catch (error) {
      console.error("Error with retrieving transport: ", error);
    }
  };

  _onMapReady = () => this.setState({marginBottom: 0});

  _onStartRoute = async () => {
    this.setState({
      startLocation: this.state.currentMapRegion,
    });
    (this.state.recordingRoute) ? console.info("finished route") : console.info("started route");
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
              this.setState({ lastValidCoord: coords });
              this.state.currentTravelDistance += distanceTravelled;
              let currScore = this.state.currentTravelScore + (distanceTravelled * this.state.transportMultiplier);
              try {
                this.state.currentTravelScore = currScore;
                await AsyncStorage.setItem('@xPlore_Store:currScore', currScore.toFixed(1));
              } catch (error) {
                console.error("Error with storing: ", error);
              }
            }
          }
        }
      }
    }
  };

  _toggleTransportType = async (event) => {
    let newTransport = "scooter";
    if (this.state.currentScooter === true) {
      newTransport = "bicycle";
    }
    try {
      this.setState({
        currentBicycle: !this.state.currentBicycle,
        currentScooter: !this.state.currentScooter,
        transportMultiplier: (this.state.transportMultiplier === 3) ? 1.5 : 3,
      });
      await AsyncStorage.setItem('@xPlore_Store:currTransport', newTransport);
    } catch (error) {
      console.error("Error with storing transport: ", error);
    }
  };

  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={payload => {
            this._getLastScore();
            this._getCurrentTransport();
          }}
        />
        <MapView
          ref = {(mapView) => { this._mapView = mapView; }}
          style={{ flex: 1, marginBottom: this.state.marginBottom}}
          initialRegion={this.state.mapRegion}
          provider={"google"}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}
          loadingEnabled={true}
          onMapReady={this._onMapReady}
          onUserLocationChange={this._onUserLocationChange}
        />
        <View
          style={styles.distanceValue}
        >
          <AnimateNumber
            value={this.state.currentTravelDistance}
            timing="easeOut"
            renderContent={(value: number) => (
              <View style={{flexDirection:'row'}}>
                <Text style={styles.distanceText}>{value}</Text>
                <Icon.Ionicons name={'ios-compass'}  size={40} color={(this.state.recordingRoute) ? "#3bcd91" : "#777777"} style={{marginTop: "auto", marginBottom: "auto", marginLeft: "4%"}}/>
              </View>
            )}
            formatter={(val) => {
              if (val > 1000) {
                return (parseFloat(val)/1000).toFixed(2) + ' km'
              } else {
                return parseFloat(val).toFixed(1) + ' m'
              }
            }}
          />
          <AnimateNumber
            value={parseFloat(this.state.currentTravelScore)}
            timing="easeOut"
            renderContent={(value: number) => (
              <Text style={styles.scoreText}>{value} (<Text style={{fontStyle: 'italic', fontSize: 20}}>x{this.state.transportMultiplier}</Text>)</Text>
            )}
            formatter={(val) => {
              return parseFloat(val).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }}
          />
        </View>
        {this.state.currentBicycle && this.state.recordingRoute &&
          <TouchableOpacity
            onPress={this._toggleTransportType}
            style={styles.transportButton}
          >
            <Image
              source={require('../assets/images/bicycleLogo.png')}
              style={styles.transportIcon}
            />
          </TouchableOpacity>
        }
        {this.state.currentScooter && this.state.recordingRoute &&
          <TouchableOpacity
            onPress={this._toggleTransportType}
            style={styles.transportButton}
          >
            <Image
              source={require('../assets/images/scooterLogo.png')}
              style={styles.transportIcon}
            />
          </TouchableOpacity>
        }
        <TouchableOpacity
          onPress={this._onStartRoute}
          style={styles.startButton}
        >
          <Icon.Ionicons name={(this.state.recordingRoute) ? 'ios-pause' : 'ios-play'}  size={50} color="#ffffff" style={(this.state.recordingRoute) ? styles.pauseIcon : styles.playIcon}/>
        </TouchableOpacity>
      </View>
    );
  }
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
  startButton: {
    borderWidth: 1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#3bcd91',
    borderRadius: 100,
    position: 'absolute',
    alignSelf: 'flex-end',
    shadowColor: 'black',
    shadowOffset: {
      weight: 6,
      height: 3
    },
    shadowRadius: 2,
    shadowOpacity: 0.6,
    elevation: 6,
    ...Platform.select({
      ios: {
        top: '84%',
        width: 55,
        height: 55,
        right: '2.5%',
      },
      android: {
        top: '88%',
        width: 70,
        height: 70,
        right: '4%',
      },
    }),
  },
  transportButton: {
    borderWidth: 1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#3bcd91',
    borderRadius: 100,
    position: 'absolute',
    alignSelf: 'flex-end',
    shadowColor: 'black',
    shadowOffset: {
      weight: 6,
      height: 3
    },
    shadowRadius: 2,
    shadowOpacity: 0.6,
    elevation: 6,
    ...Platform.select({
      ios: {
        top: '76%',
        width: 55,
        height: 55,
        right: '2.5%',
      },
      android: {
        top: '77%',
        width: 70,
        height: 70,
        right: '4%',
      },
    }),
  },
  playIcon: {
    height: 50,
    width: 50,
    paddingLeft: 5,
    textAlign: 'center'
  },
  pauseIcon: {
    height: 50,
    width: 50,
    textAlign: 'center'
  },
  transportIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain'
  },
  distanceValue: {
    elevation: 6,
    alignItems:'center',
    justifyContent:'center',
    position: 'absolute',
    paddingLeft: 20,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 30,
      },
    }),
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 40,
  },
  scoreText: {
    color: '#dddddd',
    fontSize: 26,
  }
});
