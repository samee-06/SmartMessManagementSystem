import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from "jwt-decode";
import QRCode from 'react-native-qrcode-svg';
import apiClient from '../api';

export default function DashboardScreen() {
  const [balance, setBalance] = useState('0.00');
  const [menu, setMenu] = useState([]);
  const [role, setRole] = useState('');
  const [qrData, setQrData] = useState(null);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) setRole(jwtDecode(token).role);

      const balRes = await apiClient.get('/wallet/balance');
      setBalance(balRes.data.balance);
      
      const menuRes = await apiClient.get('/mess/menu');
      setMenu(menuRes.data.data);
    } catch (error) {
      console.log("Fetch error", error);
    }
  };

  const fetchQR = async () => {
    try {
      const res = await apiClient.get('/wallet/qr');
      setQrData(res.data.qrString);
      setTimer(30);
    } catch (error) {
      setQrData(null);
      Alert.alert("Notice", error.response?.data?.message || "Cannot generate QR right now.");
    }
  };

  const handleSelfRecharge = async (amount) => {
    if (!amount || isNaN(amount)) return;
    try {
      await apiClient.post('/wallet/recharge', { amount: parseFloat(amount) });
      fetchData(); // Refresh balance after success
      Alert.alert("Success", `₹${amount} added to your wallet.`);
    } catch (error) {
      Alert.alert("Error", "Recharge failed.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  
  const handleGenerateQR = () => fetchQR();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{role === 'admin' ? 'Admin Panel' : 'Student Wallet'}</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text></TouchableOpacity>
      </View>

      {/* BALANCE CARD */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Account Balance</Text>
        <Text style={styles.balanceText}>₹ {balance}</Text>
      </View>

      {/* STUDENT ACTIONS */}
      {role === 'student' && (
        <>
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={styles.cardTitle}>Your Mess Pass</Text>
            {qrData && timer > 0 ? (
              <>
                <QRCode value={qrData} size={200} />
                <Text style={{ marginTop: 15, color: 'gray' }}>Refreshes in {timer}s</Text>
              </>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={handleGenerateQR}>
                <Text style={styles.btnText}>Generate Secure QR</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
  style={[styles.btn, styles.successBtn]} 
  onPress={() => router.push('/recharge')} // Now it goes to the new screen
>
  <Text style={styles.btnText}>Recharge My Wallet</Text>
</TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.infoBtn, { marginTop: 10 }]} onPress={() => router.push('/history')}>
            <Text style={styles.btnText}>View Payment History</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ADMIN ACTIONS */}
      {role === 'admin' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Management Tasks</Text>
          <TouchableOpacity style={[styles.btn, styles.adminBtn]} onPress={() => router.push('/admin/scanner')}>
            <Text style={styles.btnText}>Open Staff QR Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.successBtn, { marginTop: 10 }]} onPress={() => router.push('/admin/topup')}>
            <Text style={styles.btnText}>Admin Manual Recharge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MENU SECTION */}
      <View style={styles.card}>
        <View style={styles.menuHeader}>
          <Text style={styles.cardTitle}>Today's Menu ({todayName})</Text>
        </View>

        {/* STRICT FILTER: Only show items matching today's name */}
        {menu.length > 0 ? (
          menu.filter(item => item.day.trim() === todayName).map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Text style={styles.mealType}>{item.meal_type}</Text>
              <Text style={styles.itemsList}>{item.items}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No menu items found for {todayName}.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 4 },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  balanceText: { fontSize: 36, fontWeight: 'bold', color: '#007bff' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: '#007bff', fontWeight: 'bold' },
  menuItem: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  mealType: { fontWeight: 'bold', color: '#007bff', fontSize: 16 },
  itemsList: { color: '#555', marginTop: 2 },
  emptyText: { color: 'gray', fontStyle: 'italic', marginTop: 10 },
  btn: { padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  btnText: { color: 'white', fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#007bff', width: '100%' },
  successBtn: { backgroundColor: '#28a745', width: '100%' },
  infoBtn: { backgroundColor: '#17a2b8', width: '100%' },
  adminBtn: { backgroundColor: '#6f42c1', width: '100%' },
});