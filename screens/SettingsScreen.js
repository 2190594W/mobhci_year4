import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, View, Text, AsyncStorage } from 'react-native';
import { Icon } from 'expo';
import { ExpoConfigView } from '@expo/samples';

import AnimateNumber from '@bankify/react-native-animate-number';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'app.json          ',
  };

  state = {
    currentTravelScore: 0,
  };

  componentDidMount() {
    this._getLastScore();
  }

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

  _increaseCurrScore = async () => {
    let currScore = this.state.currentTravelScore;
    let newScore = currScore + (Math.random() * (20000 - 5000) + 5000);
    try {
      await AsyncStorage.setItem('@xPlore_Store:currScore', newScore.toFixed(1));
      this.setState({
        currentTravelScore: newScore,
      });
    } catch (error) {
      console.error("Error with storing: ", error);
    }
  };

  _decreaseCurrScore = async () => {
    let currScore = this.state.currentTravelScore;
    let newScore = currScore - (Math.random() * (20000 - 5000) + 5000);
    if (newScore < 1) newScore = 0;
    try {
      await AsyncStorage.setItem('@xPlore_Store:currScore', newScore.toFixed(1));
      this.setState({
        currentTravelScore: newScore,
      });
    } catch (error) {
      console.error("Error with storing: ", error);
    }
  };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (
      <View style={styles.container}>
        <View
          style={styles.scoreValue}
        >
          <AnimateNumber
            value={this.state.currentTravelScore}
            timing="easeOut"
            renderContent={(value: number) => (
              <View style={{flexDirection:'row'}}>
                <Text style={styles.scoreText}>{value}</Text>
                <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-trophy' : 'md-trophy'}  size={40} color={"#3bcd91"} style={{marginTop: "auto", marginBottom: "auto", marginLeft: "4%"}}/>
              </View>
            )}
            formatter={(val) => {
              return parseFloat(val).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }}
          />
        </View>
        <ExpoConfigView />
        <View
          style={styles.pointsBtns}
        >
          <TouchableOpacity
            style={styles.giveMePointsBtn}
            onPress={() => {
              this._increaseCurrScore();
            }}
          >
            <Text style={{color: "#ffffff"}}>Give me more Points!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.takeMyPointsBtn}
            onPress={() => {
              this._decreaseCurrScore();
            }}
          >
            <Text style={{color: "#ffffff"}}>Take away my Points!</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scoreValue: {
    elevation: 6,
    alignItems:'center',
    justifyContent:'center',
    ...Platform.select({
      ios: {
        paddingTop: "1%",
      },
      android: {
        paddingBottom: "1%",
        paddingTop: "4%",
      }
    }),
    shadowColor: "#000",
    shadowOffset: {
    	width: 0,
    	height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 12,
    zIndex: 100,
    backgroundColor:'#ffffff',
  },
  scoreText: {
    color: '#ff00c0',
    fontSize: 32,
  },
  pointsBtns: {
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
    	width: 0,
    	height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 12,
    zIndex: 100,
    backgroundColor: "#ffffff",
  },
  giveMePointsBtn: {
    flex: 1,
    padding: "4%",
    margin: "2%",
    backgroundColor: "#165139",
    alignItems: 'center',
    borderRadius: 10,
  },
  takeMyPointsBtn: {
    flex: 1,
    padding: "4%",
    margin: "2%",
    backgroundColor: "#960000",
    alignItems: 'center',
    borderRadius: 10,
  },
});
