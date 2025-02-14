import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TournamentEnroll: React.FC = ({ route }: any) => {
  const { tournamentDetails } = route.params; // Gönderilen parametreleri alın

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tournamentDetails.productName}</Text>
      <Text style={styles.details}>Price: {tournamentDetails.participationFee} TL</Text>
      <Text style={styles.details}>Starts on: {tournamentDetails.startDate}</Text>
      <Text style={styles.details}>Content: {tournamentDetails.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default TournamentEnroll;
