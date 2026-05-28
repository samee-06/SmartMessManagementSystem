import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../api';

export default function RechargeScreen() {
  const [amount, setAmount] = useState('');
  const router = useRouter();

  const handleRecharge = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return Alert.alert("Invalid Amount", "Please enter a valid number.");
    }

    try {
      await apiClient.post('/wallet/recharge', { amount: parseFloat(amount) });
      Alert.alert("Success", "Wallet recharged!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert("Error", "Recharge failed. Check connection.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
      <Text style={styles.title}>Add Money</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Amount (₹)" 
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.btn} onPress={handleRecharge}>
        <Text style={styles.btnText}>Confirm Recharge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  back: { color: '#007bff', marginBottom: 20, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 20, marginBottom: 20 },
  btn: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});