import { Link, Stack, router } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, ImageBackground, TouchableOpacity, ScrollView,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, } from "react";
import { Icon } from 'react-native-elements';


const { width, height } = Dimensions.get('window');


function app() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isClosed, setClosed] = useState(true)

  function openMenu(){
    setClosed(!isClosed)
  }

  function openSettings(){
    router.replace("/Settings")
  }

  useEffect(() => {
    const checkLoginStatus = async () => {
      const emailS = await AsyncStorage.getItem('Email');
      const passwordS = await AsyncStorage.getItem('Password');

      if (emailS !== null && passwordS !== null) {
        setIsLoggedIn(true);
        setEmail(emailS)
        setPassword(passwordS)

      } else {
        setIsLoggedIn(false);
        router.replace("/AuthHandler")
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style = {styles.container}>
        {isLoggedIn ? ( isClosed ?
          (<View>
            <TouchableOpacity style={styles.iconContainerClosed} onPress={() => {openMenu()}}>
              <Icon style = {styles.iconStyleClosed} name="menu" color = "white"/>
            </TouchableOpacity>
          </View>) : (
          <View style = {styles.sideBarcont}>
            <TouchableOpacity style={styles.iconContainerOpen} onPress={() => {openMenu()}}>
              <Icon style = {styles.iconStyleOpen} name="menu" color = "white"/>
            </TouchableOpacity>
            <ScrollView style = {styles.labelScrollVeiw}>
            </ScrollView>
            <View style={styles.botomBar}>
              <TouchableOpacity>
                <Icon name='add' color= 'white'/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {openSettings()}}>
                <Icon name='settings' color= 'white'/>
              </TouchableOpacity>
            </View>
          </View>)
        )
          : null}
    </View>
  );
}

export default app;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0,
    paddingTop: 0,
    backgroundColor: 'rgb(40,40,40)',
  },
  title: {
    marginTop: width * 0.2,
    color: "white",
    fontSize: Math.min(width, height) * 0.15,
    marginBottom: height * 0.05
  },
  iconContainerOpen: {
    height: height * 0.03 + 3,
    width: width * 0.2,
    alignItems: "flex-start",
    marginRight: width,
    marginBottom: height * 0.03 + 3,
  },
  iconStyleOpen: {
    marginLeft: width * 0.03,
    marginTop: height * 0.03,
    height: height * 0.03,
  },
  iconContainerClosed: {
    marginTop: height * 0.005,
    marginRight: width * 0.8,
  },
  labelScrollVeiw: {
    width: '100%',
    height: height * 0.8,
    flex: 1,
  },
  iconStyleClosed: {
    marginTop: height * 0.03
  },
  botomBar:{
    height: height * 0.05 + 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: height * 0.005,
    borderColor: "rgb(35,35,35)"
  },
  sideBarcont: {
    flexDirection: "column",
    backgroundColor: "rgb(20,20,20)",
    height: height,
    width: width * 0.75,
    padding: 5,
  },
});
