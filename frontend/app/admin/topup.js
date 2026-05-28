import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../../api';

export default function TopupScreen() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');

  const handleTopup = async () => {
    try {
      const res = await apiClient.post('/admin/topup', { email, amount: parseFloat(amount) });
      Alert.alert("Success", res.data.message);
      setEmail('');
      setAmount('');
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Recharge failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Recharge</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Student Email" 
        value={email} 
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Amount (₹)" 
        keyboardType="numeric" 
        value={amount} 
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleTopup}>
        <Text style={styles.buttonText}>Add Funds</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});