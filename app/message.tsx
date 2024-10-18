import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, ImageBackground, TouchableOpacity, ScrollView,  } from 'react-native';



const { width, height } = Dimensions.get('window');

function Menu(){
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = params.subject
  const from = params.from
  const date = params.date
  const body = params.body


  return (
    <View style={styles.background}>
        <View style={styles.topBar}>
            <Text style={styles.title} adjustsFontSizeToFit
          numberOfLines={2}>{subject}</Text>
            <Text style = {styles.lowerText}>{from}</Text>
            <Text style = {styles.lowerText}>{date}</Text>
        </View>
        <ScrollView style={{height:height * 0.82, width: width}}>
            <Text style={styles.lowerText}>{body}</Text>
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => {router.navigate('/')}}>
                    <Text style={styles.text}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
  );
}

export default Menu;


const styles = StyleSheet.create({
    title: {
        color: "white",
        fontSize: (Math.min(width, height) * 0.1),
        marginTop: height * 0.02,
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
    },
    background: {
        backgroundColor:'rgb(40,40,40)'
    }
  });


