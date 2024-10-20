import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard,  } from 'react-native';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import getAPI from './apiLink';

const { width, height } = Dimensions.get('window');

function NewEmail(){
  const router = useRouter();
  const params = useLocalSearchParams()
  const [subject, setSubject] = useState('')
  const [to, setTo] = useState('');
  const [body, setBody] = useState('')

  
  useEffect(() => {
    if (params.to) {
        // @ts-ignore
      setTo(params.to);
    }
  }, [params.to]);

  async function handelClick() {
    try {
        const email = await AsyncStorage.getItem('Email')
        const password = await AsyncStorage.getItem('Password')
        const response = await fetch('http://' + getAPI() +'/send_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, to, subject, body}),
        });
  
        if (!response.ok) {
          console.log('Failed to send email');
          return;
        }
  
        const data = await response.json();
        if (data.result == true){
            //@ts-ignore
            router.push(`/?folder=${encodeURIComponent(params.folder)}`)
        } else {
            setSubject(data.status)
        }
      } catch (error) {
        console.error(error);
      }
  }

  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.background}>
            <View style={styles.topBar}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Subject:  </Text>
                    <TextInput style={[styles.title, {width: width}]} value={subject} onChangeText={setSubject} numberOfLines={2} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.lowerText}>Recipients:  </Text>
                    <TextInput style = {[styles.lowerText, {width: width}]} value={to} onChangeText={setTo} keyboardType='email-address'/>
                </View>
            </View>
            <ScrollView style={{height:height * 0.75, width: width}}>
                <View style={styles.bodytextCont}>
                    <ScrollView style={{height: height * 0.5}}>
                        <TextInput style={[styles.lowerText, {width: width * 0.95, height: height * 0.2}]} value={body} onChangeText={setBody} multiline={true}/>
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => {// @ts-ignore
                router.navigate(`/?folder=${encodeURIComponent(params.folder)}`)}}>
                    <Text style={styles.text}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.send} onPress={() => {handelClick()}}>
                    <Icon name='send' color= 'white'/>
                </TouchableOpacity>
            </View>
        </View>
    </TouchableWithoutFeedback>
  );
}

export default NewEmail;


const styles = StyleSheet.create({
    title: {
        color: "white",
        fontSize: (Math.min(width, height) * 0.1),
        marginTop: height * 0.02,
      },
    textContainer: {
        borderBottomWidth: height * 0.005,
        borderColor: 'rgb(10,10,10)',
        width: width,
        flexDirection: 'row'
    },
    bodytextCont:{
        borderBottomWidth: height * 0.005,
        borderColor: 'rgb(10,10,10)',
        width: width,
        height: height * 0.75,
        flexDirection: 'row'
    },
    send: {
        marginLeft: width * 0.03
    },
    topBar: {
        borderBottomWidth:  height * 0.005,
         borderColor: "rgb(35,35,35)", 
         justifyContent: 'center',
         alignItems: 'center'
    },
    bottomBar: {
        flexDirection:'column-reverse', 
        borderTopWidth:  height * 0.005, 
        borderColor: "rgb(35,35,35)", 
        justifyContent: 'center',
        height: height * 0.1,
        alignItems: 'center',
    },
    text:{
        color: 'white'
    },
    lowerText:{
        color: 'white',
        fontSize: width * 0.05,
    },
    background: {
        backgroundColor:'rgb(40,40,40)'
    },
    
  });