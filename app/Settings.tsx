import {router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import getAPI from './apiLink';


const { width, height } = Dimensions.get('window');


function Settings() {
  const [folder, setFolder] = useState(' ')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  useEffect(() => {
    const checkLoginStatus = async () => {
      const emailS = await AsyncStorage.getItem('Email');
      const passwordS = await AsyncStorage.getItem('Password');
      const def = await AsyncStorage.getItem('DefaultFolder')

      if (emailS !== null && passwordS !== null) {
        setEmail(emailS)
        setPassword(passwordS)

      }
      if (def !== null){
        setFolder(def)
      }
    };

    checkLoginStatus();
  }, []);
  async function handleSubmit(){
    try {
        const response = await fetch('http://'+ getAPI() +'/open_folder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, folder}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
  
        const data = await response.json();
        if (data.status == 'True'){
            setError(data.status);
            AsyncStorage.setItem('DefaultFolder', folder)
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
            Settings
          </Text>
        </View>
        <View style={styles.input}>
          <Text style={styles.inputText}>Default Folder:  </Text>
          <TextInput style={styles.inputFeild} value={folder} onChangeText={setFolder}/>
        </View>
        <View>
          <TouchableOpacity style={styles.saveContainer} onPress={handleSubmit}>
              <Text style={styles.submitText}>
                  Save
              </Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>
              {error}
          </Text>
          <View style = {styles.exitButtons}>
            <TouchableOpacity style={styles.lougoutContainer} onPress={() => router.navigate("/AuthHandler")}>
                <Text style={styles.submitText}>
                    Logout  
                </Text>
                <Icon style={styles.exitIcon} name='logout' color='white'/>
            </TouchableOpacity>
            <Text></Text>
            <TouchableOpacity onPress={() => router.navigate('/')}>
                <Text style={styles.submitText}>
                    Go Back
                </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

export default Settings;

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
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(width, height) * 0.045,
    marginTop: height * 0.01
  },
  lougoutContainer: {
    flexDirection: 'row'
  },
  saveContainer: {
    height: height * 0.05,
    width: width * 0.2,
    backgroundColor: 'rgb(0,0,255)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: height * 0.01,
    marginLeft: width * 0.15
  },
  exitButtons: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitIcon: {
    marginRight: width * 0.1,
    marginLeft: width * 0.025,
  }
  
  

});
