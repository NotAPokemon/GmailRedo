import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView,  } from 'react-native';
import {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

function Menu(){
  const router = useRouter();
  const [subject, setSubject] = useState('')
  const [to, setTo] = useState('');
  const [body, setBody] = useState('')

  async function handelClick() {
    try {
        const email = await AsyncStorage.getItem('Email')
        const password = await AsyncStorage.getItem('Password')
        const response = await fetch('http://192.168.86.26:5555/send_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, to, subject, body}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
  
        const data = await response.json();
        if (data.result == true){
            router.push('/')
        } else {
            setSubject(data.status)
        }
      } catch (error) {
        console.error(error);
      }
  }


  return (
    <View style={styles.background}>
        <View style={styles.topBar}>
            <TextInput style={styles.title} value={subject}, onChangeText={setSubject} adjustsFontSizeToFit
          numberOfLines={2}/>
            <TextInput style = {styles.lowerText} value={to} onChangeText={setTo}/>
        </View>
        <ScrollView style={{height:height * 0.82, width: width}}>
            <TextInput style={styles.lowerText} value={body} onChangeText={setBody} />
        </ScrollView>
        <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => {router.navigate('/')}}>
                <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {handelClick}}>
                <Text style={styles.text}>
                    Send
                </Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

export default Menu;


const styles = StyleSheet.create({
    title: {
        color: "white",
        fontSize: (Math.min(width, height) * 0.1),
        marginTop: height * 0.02,
        borderBottomWidth: height * 0.005,
        borderColor: 'rgb(10,10,10)'
      },
    topBar: {
        borderBottomWidth:  height * 0.005,
         borderColor: "rgb(35,35,35)", 
         justifyContent: 'center',
         alignItems: 'center'
    },
    bottomBar: {
        flexDirection:'row', 
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
        fontSize: width * 0.03,
        borderBottomWidth: height * 0.005,
        borderColor: 'rgb(10,10,10)'
    },
    background: {
        backgroundColor:'rgb(40,40,40)'
    }
  });


