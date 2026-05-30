import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';

// Ensure your physical phone is on the SAME Wi-Fi network as your computer!
// 192.168.1.103 is your computer's local network IP.
const API_BASE_URL = 'http://192.168.1.103:8000/api';

export default function App() {
  const [venues, setVenues] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Fetch Metadata on Load from FastAPI
    axios.get(`${API_BASE_URL}/metadata`)
      .then(response => {
        setVenues(response.data.venues);
        setSelectedVenue(response.data.venues[0]);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching metadata:", error);
        setLoading(false);
      });
  }, []);

  const runOptimization = () => {
    setOptimizing(true);
    axios.post(`${API_BASE_URL}/optimize`, {
      budget_limit: 100.0,
      venue: selectedVenue,
      mandatory_xi: [],
      mandatory_squad: [],
      unavailable_players: [],
      price_overrides: {}
    })
    .then(response => {
      setResult(response.data);
      setOptimizing(false);
    })
    .catch(error => {
      console.error("Optimization error:", error);
      alert("Failed to optimize. Ensure FastAPI server is running on port 8000.");
      setOptimizing(false);
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#001C58" />
        <Text style={styles.loadingText}>Connecting to Python Brain...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>IPL War Room</Text>
          <Text style={styles.subtitle}>Native Mobile Client</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Select Home Stadium</Text>
          {venues.map(v => (
            <TouchableOpacity 
              key={v} 
              style={[styles.venueButton, selectedVenue === v && styles.venueSelected]}
              onPress={() => setSelectedVenue(v)}
            >
              <Text style={[styles.venueText, selectedVenue === v && styles.venueTextSelected]}>{v.split(',')[0]}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.optimizeButton} 
            onPress={runOptimization}
            disabled={optimizing}
          >
            {optimizing ? (
              <ActivityIndicator color="#001C58" />
            ) : (
              <Text style={styles.optimizeText}>🚀 OPTIMIZE TEAM</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Optimal Playing XI</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Power Score</Text>
                <Text style={styles.metricValue}>{result.xi_power.toFixed(1)}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Team Chemistry</Text>
                <Text style={styles.metricValue}>{result.chemistry_score}%</Text>
              </View>
            </View>

            {result.playing_xi.map((player: any, idx: number) => (
              <View key={idx} style={styles.playerRow}>
                <Text style={styles.playerName}>{idx + 1}. {player.Player.title()}</Text>
                <Text style={styles.playerRole}>{player.Archetype}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#001C58', fontWeight: 'bold' },
  scroll: { padding: 20 },
  header: { marginBottom: 25, marginTop: 40, alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '900', color: '#001C58', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5, fontWeight: '500' },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  venueButton: { padding: 12, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 10 },
  venueSelected: { backgroundColor: '#001C58' },
  venueText: { fontSize: 16, color: '#4A5568', textAlign: 'center', fontWeight: '600' },
  venueTextSelected: { color: '#FFD700', fontWeight: 'bold' },
  optimizeButton: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  optimizeText: { color: '#001C58', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  resultCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  resultTitle: { fontSize: 22, fontWeight: 'bold', color: '#001C58', marginBottom: 20, textAlign: 'center' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  metricBox: { backgroundColor: '#F7FAFC', padding: 15, borderRadius: 12, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  metricLabel: { fontSize: 12, color: '#718096', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 26, color: '#001C58', fontWeight: '900', marginTop: 5 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  playerName: { fontSize: 16, color: '#2D3748', fontWeight: '600' },
  playerRole: { fontSize: 14, color: '#A0AEC0', fontStyle: 'italic', fontWeight: '500' }
});
