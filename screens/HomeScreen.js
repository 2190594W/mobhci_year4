import React from 'react';
import { Image, StyleSheet, View, Text, Animated, TouchableWithoutFeedback, Dimensions, AsyncStorage } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SocialIcon } from 'react-native-elements';
import { NavigationEvents } from 'react-navigation';

const { width } = Dimensions.get('window');

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    appMode: 'scooter',
    fade: new Animated.Value(1),
    xTranslateOff: new Animated.Value(0),
    xTranslateOn: new Animated.Value(0),
    loginText: 'Login:'
  };

  login = () => {
    Animated.timing(
      this.state.fade,
      {toValue: 0}
    ).start();
    this.setState({ loginText: 'Welcome Ben Stevenson!' });
  }

  changeMode = () => {
    this.setState({
      appMode: (this.state.appMode === 'bicycle') ? 'scooter' : 'bicycle',
    });
    this._toggleTransportType();
    // this.view.slideOutRight();
    // Animated.sequence([
    // Animated.timing(
    //   this.state.xTranslateOff,
    //   {toValue: 1}
    // ),
    // Animated.timing(
    //   this.state.xTranslateOn,
    //   {toValue: 1}
    // )
    // ]).start();
  }

  componentDidMount = () => {
    Animated.timing(
      this.state.xTranslateOn,
      {toValue: 1}
    ).start();
    this._getCurrentTransport();
  }

  _getCurrentTransport = async () => {
    try {
      const transport = await AsyncStorage.getItem('@xPlore_Store:currTransport');
      if (transport !== null) {
        this.setState({
          appMode: transport,
        });
        console.info("Updated transport from storage");
      }
    } catch (error) {
      console.error("Error with retrieving transport: ", error);
    }
  };

  _toggleTransportType = async (event) => {
    let newTransport = "scooter";
    if (this.state.appMode === "scooter") {
      newTransport = "bicycle";
    }
    try {
      this.setState({
        appMode: newTransport,
      });
      await AsyncStorage.setItem('@xPlore_Store:currTransport', newTransport);
    } catch (error) {
      console.error("Error with storing transport: ", error);
    }
  };

  handleViewRef = ref => this.view = ref;

  render() {
    moveXOff = this.state.xTranslateOff.interpolate({
      inputRange: [0, 1],
      outputRange: [(width / 2) - 170, width + 100]
    });
    moveXOn = this.state.xTranslateOn.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, (width / 2) - 170]
    });
    if (this.state.appMode === 'bicycle') {
      imgSrc = <Image style={styles.welcomeImage} source={require('../assets/images/bikeLogo3.png')} />;
    } else if (this.state.appMode === 'scooter') {
      imgSrc = <Image style={styles.welcomeImage} source={require('../assets/images/icon.png')} />;
    }
    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={payload => this._getCurrentTransport()}
        />
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/long_logo_10.png')}
            style={styles.welcomeImage}
          />
        </View>
        <Text style={styles.login}>
          {this.state.loginText}
        </Text>
        <Animated.View style={[styles.socials, {opacity: this.state.fade}]}>
          <SocialIcon
            type='facebook'
            light
            onPress={this.login}
          />
          <SocialIcon
            type='medium'
            light
            onPress={this.login}
          />
          <SocialIcon
            type='github'
            light
            onPress={this.login}
          />
          <SocialIcon
            type='stack-overflow'
            light
            onPress={this.login}
          />
          <SocialIcon
            type='instagram'
            light
            onPress={this.login}
          />
        </Animated.View>
        <View style={styles.appMode}>
          <TouchableWithoutFeedback onPress={this.changeMode}>
            <Animated.View ref={this.handleViewRef} duration={1000}>
              {imgSrc}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 340,
    height: 180,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  login: {
    marginLeft: 10,
    fontSize: 24,
    fontFamily: 'ubuntu',
    color: '#4d4d4d'
  },
  socials: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#49cd97',
    margin: 10,
    borderRadius: 6,
  },
  appMode: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
