import React from 'react';
import {
  View,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  AsyncStorage,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
  Modal,
} from 'react-native';
import { Icon } from 'expo';

import AnimateNumber from '@bankify/react-native-animate-number'

const deviceWidth = Dimensions.get('window').width;

export default class RewardsScreen extends React.Component {
  state = {
    currentTravelScore: 0,
    modalOpacity: 0,
  };

  componentDidMount() {
    this._getLastScore();
  }

  static navigationOptions = {
    title: 'Rewards           ',
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
      console.log("Error with retrieving score: ", error);
    }
  };

  setModalVisible(modalId, visible) {
    this.setState({
      [`${modalId}ModalVisible`]: visible,

    });
  }

  render() {

    const rewardLogos = [
      require('../assets/images/rewardLogos/greggsLogo.png'),
      require('../assets/images/rewardLogos/costaLogo.png'),
      require('../assets/images/rewardLogos/tacoMazamaLogo.png'),
      require('../assets/images/rewardLogos/pretAMangerLogo.png'),
      require('../assets/images/rewardLogos/subwayLogo.png'),
      require('../assets/images/rewardLogos/tescoLogo.png'),
      require('../assets/images/rewardLogos/starbucksLogo.png'),
      require('../assets/images/rewardLogos/bootsLogo.png'),
      require('../assets/images/rewardLogos/waitroseLogo.png'),
      require('../assets/images/rewardLogos/subwayResLogo.png'),
      require('../assets/images/rewardLogos/pizzaExpressLogo.png'),
    ];
    const rewardTitles = ["Greggs", "Costa", "Taco Mazama", "Pret a Manger",
      "SPT - Subway", "Tesco", "Starbucks", "Boots", "Waitrose", "Subway", "Pizza Express"
    ];
    const rewardPckgs = {
      "Greggs": []
    };
    const rewards = [];

    for (var rewardCount = 0; rewardCount < rewardLogos.length; rewardCount++) {
      let rewardID = `reward${rewardCount}`;
      let rewardIDModal = `reward${rewardCount}ModalVisible`;
      rewards.push(
        <TouchableOpacity
          key={`reward${rewardCount}`}
          style={styles.rewardContainer}
          onPress={() => {
            this.setModalVisible(rewardID, true);
          }}
        >
          <Image
            source={rewardLogos[rewardCount]}
            style={styles.rewardBrandIcon}
          />
        </TouchableOpacity>,
        <Modal
          key={`reward${rewardCount}Modal`}
          style={styles.rewardModal}
          transparent={true}
          animationType="slide"
          transparent={true}
          visible={this.state[rewardIDModal]}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <TouchableOpacity
            style={styles.rewardModalViewDismiss}
            onPress={() => {
              this.setModalVisible(rewardID, false);
            }}>
          </TouchableOpacity>
          <View
            style={styles.rewardModalView}
          >
            <View
              style={styles.rewardModalViewContents}
            >
              <Text
                style={styles.rewardModalViewTitle}
              >
                {rewardTitles[rewardCount]}
              </Text>

              <TouchableOpacity
                style={styles.rewardModalCloseBtn}
                onPress={() => {
                  this.setModalVisible(rewardID, false);
                }}>
                <Icon.Ionicons name={'ios-close'}  size={50} color="#aaaaaa"/>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
      this.state[`reward${rewardCount}ModalVisible`] = false;
    }

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
        <ScrollView>
          <View
            style={styles.rewards}
          >
            {rewards}
          </View>
        </ScrollView>
      </View>
    );
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
  rewards: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '4%',
    marginBottom: '20%',
  },
  rewardContainer: {
    backgroundColor:'#ffffff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
    	width: 0,
    	height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    width: deviceWidth * 0.45,
    height: deviceWidth * 0.45,
    marginLeft: "2.5%",
    marginRight: "2.5%",
    marginBottom: "5%",
  },
  rewardBrandIcon: {
    borderRadius: 10,
    flex: 1,
    resizeMode: 'contain',
    maxWidth: deviceWidth * 0.45,
    maxHeight: deviceWidth * 0.45,
    minWidth: deviceWidth * 0.45,
    minHeight: deviceWidth * 0.45,
  },
  rewardModal: {
  },
  rewardModalViewDismiss: {
    height: "40%",
    opacity: 0.0,
  },
  rewardModalView: {
    height: "70%",
    width: deviceWidth * 0.92,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
    	width: 0,
    	height: 0,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
  rewardModalViewContents: {
    alignItems: 'center',
    marginTop: 20,
  },
  rewardModalViewTitle: {
    fontSize: 30
  },
  rewardModalCloseBtn: {
    ...Platform.select({
      ios: {
        marginTop: "-13%",
        paddingBottom: "10%",
        left: "42%",
      },
      android: {
        marginTop: "-13%",
        left: "41%",
      }
    }),
  }
});
