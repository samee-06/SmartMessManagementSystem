import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import apiClient from '../api';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await apiClient.post('/auth/register', form);
      Alert.alert("Success", "Account created! Please login.");
      router.replace('/');
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" onChangeText={(t)=>setForm({...form, name:t})} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(t)=>setForm({...form, email:t})} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(t)=>setForm({...form, password:t})} />
      
      {/* Role Selector (Simple) */}
      <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20}}>
        <TouchableOpacity onPress={()=>setForm({...form, role:'student'})}>
            <Text style={{color: form.role==='student' ? 'blue' : 'gray'}}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setForm({...form, role:'admin'})}>
            <Text style={{color: form.role==='admin' ? 'blue' : 'gray'}}>Admin</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <Link href="/" style={{marginTop: 20, textAlign: 'center'}}>Already have an account? Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});