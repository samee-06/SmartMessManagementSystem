import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../api';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get('/wallet/history');
        setHistory(res.data.data);
      } catch (error) {
        console.log("History error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.mealText}>
            {item.type === 'topup' ? 'Wallet Recharge' : item.mess_id.split('_').pop()}
        </Text>
        <Text style={styles.dateText}>{item.formatted_date}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'topup' ? '#28a745' : '#dc3545' }]}>
        {item.type === 'topup' ? '+' : '-'} ₹{item.amount}
      </Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{flex: 1}} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{textAlign: 'center'}}>No transactions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2
  },
  mealText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { color: 'gray', fontSize: 12 },
  amount: { fontSize: 16, fontWeight: 'bold' }
});