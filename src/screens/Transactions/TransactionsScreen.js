// src/screens/Transactions/TransactionsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../api/api';

export default function TransactionsListScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // TODO: igazítsd a Monity web tranzakció-lista endpointjára
        const res = await api.get('/transactions');
        setItems(res.data?.items || res.data || []);
      } catch (e) {
        console.log('Tranzakciók hiba:', e.message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Tranzakciók betöltése...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{item.description || 'Nincs leírás'}</Text>
        <Text style={styles.rowSubtitle}>{item.date}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text
          style={[
            styles.rowAmount,
            item.amount < 0 ? styles.negative : styles.positive,
          ]}
        >
          {item.amount} {item.currency || 'HUF'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#777777',
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#27ae60',
  },
  negative: {
    color: '#c0392b',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 4,
  },
});
