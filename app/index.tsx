import {router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, ImageBackground, TouchableOpacity, ScrollView,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, } from "react";
import { Icon } from 'react-native-elements';
import getAPI from './apiLink';


const { width, height } = Dimensions.get('window');


function app() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isClosed, setClosed] = useState(true)
  const [tabs, setTabs] = useState(['Loading tabs..'])
  const [messages, setMessages] = useState([{'subject':'Loading Messages..', 'from': 'Loading Messages..', 'date': 'Loading Messages..', 'body':'Loading Messages..', 'seen': false}])
  const [folder, setFolder] = useState('')
  const [deleteMode, setDeleteMode] = useState(false)
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.folder) {
      // @ts-ignore
      setFolder(params.folder)
    }
  }, [params.folder]);


  const defaut = [{'subject':'Loading Messages..', 'from': 'Loading Messages..', 'date': 'Loading Messages..', 'body':'Loading Messages..', 'seen' : false}]

  function openMenu(){
    setClosed(!isClosed)
  }

  function openSettings(){
    router.replace(`/Settings?folder=${encodeURIComponent(folder)}`)
  }

  // @ts-ignore
  function readMessage(message){
    router.replace(`/message?subject=${encodeURIComponent(message.subject)}&from=${encodeURIComponent(message.from)}&date=${encodeURIComponent(message.date)}&body=${encodeURIComponent(message.body)}&folder=${encodeURIComponent(folder)}`);
  }

  async function getFolders(email: string, password: string) {
    try {
      const response = await fetch('http://192.168.86.26:5555/get_all_folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password}),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      return data.folders
    } catch (error) {
      console.error(error);
    }
  }

  // @ts-ignore
  async function getMessages(email, password, folder) {
    try {
      const response = await fetch('http://'+  getAPI() +'/get_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, folder}),
      });

      if (!response.ok) {
        console.log('Failed to fetch emails');
        return;
      }

      const data = await response.json();
      return data.messages
    } catch (error) {
      console.error(error);
    }
  }

  // @ts-ignore
  async function deleteFolder(name) {
    try {
      const response = await fetch('http://' + getAPI() +'/delete_folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name}),
      });

      if (!response.ok) {
        console.log('Failed to delete folder');
        return;
      }

      const data = await response.json();
      
      return data

    } catch (error) {
      console.error(error);
    }
  }

  // @ts-ignore
  async function changeFolder(name){
    if (!deleteMode){
      openMenu()
      setFolder(name)
      setMessages(defaut)
      let data = await getMessages(email , password, name)
      setMessages(data)
    } else {
      setDeleteMode(false)
      let res = await deleteFolder(name)
      if (!res.result){
        console.error(res.status)
      }
      if (folder !==null){
          let data = await getFolders(email, password)
          // @ts-ignore
          function removeExtra(data) {
            // @ts-ignore
            return data.map((str) => str.replace(/"/g, ''));
          }
          // @ts-ignore
          function removeGmailLabels(arr) {
            // @ts-ignore
            return arr.filter(str => !str.includes('[Gmail]'));
          }
          setTabs(removeGmailLabels(removeExtra(data)))
      }
      setDeleteMode(false)
    }
  }


  
  useEffect(() => {
    // @ts-ignore
    const checkLoginStatus = async () => {
      const emailS = await AsyncStorage.getItem('Email');
      const passwordS = await AsyncStorage.getItem('Password');
      const folderS = await AsyncStorage.getItem('DefaultFolder')

      if (emailS !== null && passwordS !== null) {
        setIsLoggedIn(true);
        setEmail(emailS)
        setPassword(passwordS)
        if (folderS !==null){
          setFolder(folderS)
          // @ts-ignore
          let useFolder;
          try{
            useFolder = params.folder
            if (params.folder.length > 2){
              // @ts-ignore
              setFolder(params.folder)
            } else{
              useFolder = folderS
            }
          } catch{
            useFolder = folderS
            setFolder(folderS)
          }

          let data = await getFolders(emailS, passwordS)
          // @ts-ignore
          function removeExtra(data) {
            // @ts-ignore
            return data.map((str) => str.replace(/"/g, ''));
          }
          // @ts-ignore
          function removeGmailLabels(arr) {
            // @ts-ignore
            return arr.filter(str => !str.includes('[Gmail]'));
          }
          setTabs(removeGmailLabels(removeExtra(data)))
          let mes = await getMessages(emailS, passwordS, useFolder)
          setMessages(mes)
        }
      } else {
        setIsLoggedIn(false);
        router.replace(`/AuthHandler?folder=${encodeURIComponent(folder)}`)
      }
    };


    checkLoginStatus();
  }, []);


  return (
    <View style = {styles.container}>
        {isLoggedIn ? ( isClosed ?
          (
          <View>
            <View style={{flexDirection:'row', borderBottomWidth:  height * 0.005, borderColor: "rgb(35,35,35)"}}>
              <TouchableOpacity style={styles.iconContainerClosed} onPress={() => {openMenu()}}>
                <Icon style = {styles.iconStyleClosed} name="menu" color = "white"/>
              </TouchableOpacity>
              <Text style={styles.title}>{folder}</Text>
            </View>
            <ScrollView style={{height:height, width: width}}>
              {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => readMessage(item)}>
                      <View style={item.seen ? styles.messageContainerNew : styles.messageContainerSeen}>
                        <Text style={styles.messageSubject}>{item.subject}</Text>
                        <Text style={styles.messageFrom}>{item.from}</Text>
                        <Text style={styles.messageFrom}>{item.date}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: 'white' }}>No messages available.</Text>
                )}
            </ScrollView>
          </View>
          ) : (
          <View style = {styles.sideBarcont}>
            <TouchableOpacity style={styles.iconContainerOpen} onPress={() => {openMenu()}}>
              <Icon style = {styles.iconStyleOpen} name="menu" color = "white"/>
            </TouchableOpacity>
            <ScrollView style = {styles.labelScrollVeiw}>
              {tabs.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => changeFolder(item)}>
                  <View style={styles.tab}>
                    <Text style={styles.tabText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.botomBar}>
              <TouchableOpacity onPress={()=> router.navigate(`/newLabel?folder=${encodeURIComponent(folder)}`)}>
                <Icon name='add' color= 'white'/>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> setDeleteMode(true)}>
                <Icon name='remove' color= 'white'/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {openSettings()}}>
                <Icon name='settings' color= 'white'/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.send} onPress={() => {router.replace(`/newEmail?folder=${encodeURIComponent(folder)}`)}}>
                <Icon name='send' color= 'white'/>
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
  send: {
    marginLeft: (width*0.75) * 0.625
  },
  messageContainerSeen:{
    height: height * 0.2,
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(60,60,60)',
    borderRadius: height * 0.01,
    marginLeft: width * 0.1,
    marginBottom: height * 0.05,
  },
  messageContainerNew:{
    height: height * 0.2,
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(60,90,60)',
    borderRadius: height * 0.01,
    marginLeft: width * 0.1,
    marginBottom: height * 0.05,
  },
  messageSubject: {
    color: "white",
    fontSize: width * 0.05,
  },
  messageFrom: {
    color: "white",
    fontSize: width * 0.025,
  },
  title: {
    color: "white",
    fontSize: Math.min(width, height) * 0.15,
    marginTop: height * 0.01,
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
    marginRight: width * 0.1,
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
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgb(60,60,60)",
    height: height * 0.075,
    width: width * 0.6,
    marginBottom: height * 0.02,
    borderRadius: height * 0.01,
  },
  tabText: {
    color: 'white'
  }
});
