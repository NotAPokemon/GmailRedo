import { Link, Stack, router } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, ImageBackground, TouchableOpacity,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, } from "react";
import { Icon } from 'react-native-elements';
import Menu from "./menu"


const { width, height } = Dimensions.get('window');


function app() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isOpen, setOpen] = useState(false)

  const menu = (
    <Menu/>
  );

  function openMenu(){
    setOpen(!isOpen)
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
        {isLoggedIn ? ( isOpen ?
          (<View>
            <TouchableOpacity onPress={() => {openMenu()}}>
              <Icon style = {styles.iconStyleClosed} name="menu" color = "white"/>
            </TouchableOpacity>
          </View>) : (
          <View style = {styles.sideBarcont}>
            <TouchableOpacity onPress={() => {openMenu()}}>
              <Icon style = {styles.iconStyleOpen} name="menu" color = "white"/>
            </TouchableOpacity>
            <View>

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
  iconStyleOpen: {
    marginRight: width * 0.2,
    marginTop: height * 0.03
  },
  iconStyleClosed: {
    marginRight: width * 0.8,
    marginTop: height * 0.03
  },
  sideBarcont: {
    flexDirection: "row",
    backgroundColor: "rgb(20,20,20)",
    height: height,
    width: width * 0.6,
    padding: 5,
  },
});
