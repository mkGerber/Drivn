import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Drivn</Text>
      <Text style={styles.subtitle}>Track your builds and maintenance on the go.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Explore')}>
        <Text style={styles.buttonText}>Explore Builds</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Garage')}>
        <Text style={styles.secondaryText}>Go to Garage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
});

export default HomeScreen;
