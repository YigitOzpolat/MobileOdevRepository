import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonContainer: {
    // Görünüm
    paddingHorizontal: 20, 
    paddingVertical: 10,   
    margin: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D9534F', 
    backgroundColor: '#FFFFFF', 
    
    
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buton Metin Stili
  buttonText: {
    color: '#D9534F', // Kırmızı metin
    fontSize: 16,
    fontWeight: 'bold',
  },

    redButton: {
    color: '#5a2f2eff', // Kırmızı metin
    fontSize: 18,
    fontWeight: 'bold',
  },
});
