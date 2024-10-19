import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, Dimensions, Linking, TouchableOpacity, ScrollView,  } from 'react-native';



const { width, height } = Dimensions.get('window');

function Menu(){
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = params.subject
  const from = params.from
  const date = params.date
  const body = params.body

  // @ts-ignore
  const handleLinkPress = (url) => {
    if (url.startsWith('mailto:')) {
      const email = url.replace('mailto:', '');
      router.navigate(`/newEmail?to=${encodeURIComponent(email)}`)
    } else {
      Linking.openURL(url).catch((err) => console.error("An error occurred", err));
    }
  };


  // @ts-ignore
  const renderBodyWithLinks = (text) => {
    const formattedLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+|mailto:[^\s]+)\)/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(formattedLinkRegex);

    // @ts-ignore
    return parts.map((part, index) => {
      if (index % 3 === 1) {
        if(parts[index + 1].startsWith('mailto:')){
            return (
                <TouchableOpacity key={index} onPress={() => handleLinkPress(parts[index + 1])}>
                  <Text style={styles.linkNew}>{part}</Text>
                </TouchableOpacity>
              );
        }
        return (
          <TouchableOpacity key={index} onPress={() => handleLinkPress(parts[index + 1])}>
            <Text style={styles.link}>{part}</Text>
          </TouchableOpacity>
        );
      } else if (index % 3 === 0) {
        const nonLinkParts = part.split(urlRegex)
        // @ts-ignore
        return nonLinkParts.map((subPart, subIndex) => {
          if (urlRegex.test(subPart)) {
            return (
              <TouchableOpacity key={subIndex} onPress={() => handleLinkPress(subPart)}>
                <Text style={styles.link}>{subPart}</Text>
              </TouchableOpacity>
            );
          }
          // @ts-ignore
          return <Text key={subIndex} style={styles.lowerText}>{subPart}</Text>;
        });
      }
      return null; 
    });
  };



  return (

    <View style={styles.background}>
        <View style={styles.topBar}>
            <Text style={styles.title} adjustsFontSizeToFit
          numberOfLines={2}>{subject}</Text>
            <Text style = {styles.lowerText}>{from}</Text>
            <Text style = {styles.lowerText}>{date}</Text>
        </View>
        <ScrollView style={{height:height * 0.7, width: width}}>
            <View>{renderBodyWithLinks(body)}</View>
        </ScrollView>
        <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => {// @ts-ignore
                router.navigate(`/?folder=${encodeURIComponent(params.folder)}`)}}>
                <Text style={styles.text}>Go Back</Text>
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
    link: {
        color:'rgb(0,102,204)',
        fontSize: width * 0.03,
        textDecorationLine: 'underline',
    },
    linkNew: {
        color:'rgb(125,72,40)',
        fontSize: width * 0.03,
        textDecorationLine: 'underline',
    },
    background: {
        backgroundColor:'rgb(40,40,40)',
        height: height
    }
  });


