import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router'; // Added Link import here
import apiClient from '../api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) router.replace('/dashboard');
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
          await AsyncStorage.setItem('userToken', response.data.token);
          router.replace('/dashboard');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert("Login Failed", error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        Alert.alert("Network Error", "The app cannot reach your Mac. Check IP and Firewall.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NITD UniWallet</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {}
      <Link href="/register" asChild>
        <TouchableOpacity style={styles.linkWrapper}>
          <Text style={styles.linkText}>New user? Register here</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  linkWrapper: { marginTop: 20 },
  linkText: { color: '#007bff', textAlign: 'center', fontWeight: '500' }
});