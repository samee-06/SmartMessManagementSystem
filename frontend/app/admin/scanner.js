import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import apiClient from '../../api'; // Note the double dots to go up two directories

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Hardware permission logic
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true); // Lock scanner to prevent multiple rapid scans

    try {
      const response = await apiClient.post('/wallet/verify-scan', {
        qr_token: data,
        mess_id: 'NITD_MAIN_MESS'
      });
      
      Alert.alert("Payment Approved! ✅", response.data.message, [
        { text: "Scan Next Student", onPress: () => setScanned(false) }
      ]);
    } catch (error) {
      Alert.alert("Scan Failed ❌", error.response?.data?.message || "Invalid QR Code", [
        { text: "Try Again", onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Scanner</Text>
      <Text style={styles.subtitle}>Point at student's screen</Text>
      
      <View style={styles.cameraBox}>
        <CameraView 
          style={styles.camera} 
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      </View>

      {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: 'gray', marginBottom: 30 },
  cameraBox: { width: 300, height: 300, overflow: 'hidden', borderRadius: 20, marginBottom: 20 },
  camera: { flex: 1 },
});