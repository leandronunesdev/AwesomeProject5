import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import {readVisaCreditCard} from './readVisaCreditCard';
import {readMasterCardCreditCard} from './readMasterCardCreditCard';

// Pre-step, call this before any NFC operations
NfcManager.start();

function App() {
  const [isScanning, setIsScanning] = useState(false);

  async function readNdef() {
    setIsScanning(true);
    try {
      const tag = await readVisaCreditCard();
      // const tag = await readMasterCardCreditCard();

      console.warn('tag', tag);
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      // NfcManager.cancelTechnologyRequest();
      setIsScanning(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      {isScanning ? (
        <Text>Scanning...</Text>
      ) : (
        <TouchableOpacity onPress={readNdef}>
          <Text>Scan a Tag!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
