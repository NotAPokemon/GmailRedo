import { Link, router, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');


function AuthHandler() {
  const [email, setEmail] = useState(' ')
  const [password, setPassword] = useState('')
  const [message, setMessages] = useState('Submit')
  const [error, setError] = useState('')


  async function handleSubmit(){
    try {
        const response = await fetch('http://192.168.86.26:5555/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password}),
        });
  
        if (!response.ok) {
          console.log('Failed to login');
          return;
        }
  
        const data = await response.json();
        if (data.status == 'Login successful'){
            setMessages(data.status);
            AsyncStorage.setItem('Email', email)
            AsyncStorage.setItem('Password', password)
            router.push("/")
        } else {
            setError(data.status)
        }
      } catch (error) {
        console.error(error);
      }

  }

  return (
    <ImageBackground  style = {styles.background} source = {require('@/assets/images/background.png')}>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>
            Login
          </Text>
        </View>
        <View style={styles.input}>
          <Text style={styles.inputText}>Email:           </Text>
          <TextInput style={styles.inputFeild} value={email} onChangeText={setEmail} keyboardType="email-address"/>
        </View>
        <View style={styles.input}>
          <Text style={styles.inputText}>Password:    </Text>
          <TextInput style={styles.inputFeild} value={password} onChangeText={setPassword} secureTextEntry={true}/>
        </View>
        <View>
          <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.submitText}>
                  {message}
              </Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>
              {error}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

export default AuthHandler;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(60,60,60, 0.5)',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    padding: 10,
    height: height * 0.8
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgb(40,40,40)',
  },
  input: {
    justifyContent: "center",
    flexDirection: 'row',
    marginBottom: height * 0.05,
    marginTop: height * 0.03
  },
  inputText: {
    fontSize: Math.min(width, height) * 0.05,
    color: 'white',
  },
  inputFeild: {
    borderWidth: 1,
    borderColor: 'white',
    width: width * 0.5,
    height: height * 0.05,
    paddingLeft: 5
  },
  title: {
    color: "white",
    fontSize: Math.min(width, height) * 0.15,
    marginBottom: height * 0.05
  },
  submitText: {
    color: 'white',
    fontSize: Math.min(width, height) * 0.045,
    marginTop: height * 0.1
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(width, height) * 0.045,
    marginTop: height * 0.01
  }
});
