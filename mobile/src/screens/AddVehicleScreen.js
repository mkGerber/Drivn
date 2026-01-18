import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const AddVehicleScreen = ({ navigation }) => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    engine: '',
    transmission: '',
    current_mileage: '',
    color: '',
    license_plate: '',
    vin: '',
    oil_change_interval: '',
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    if (!form.make || !form.model || !form.year) return;
    setLoading(true);
    const payload = {
      user_id: session.user.id,
      make: form.make,
      model: form.model,
      year: Number(form.year),
      trim: form.trim || null,
      engine: form.engine || null,
      transmission: form.transmission || null,
      current_mileage: form.current_mileage ? Number(form.current_mileage) : null,
      color: form.color || null,
      license_plate: form.license_plate || null,
      vin: form.vin || null,
      oil_change_interval: form.oil_change_interval ? Number(form.oil_change_interval) : null,
    };

    const { error } = await supabase.from('cars').insert([payload]);

    if (error) {
      console.error('Error adding vehicle:', error);
    } else {
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Add Vehicle</Text>
        <Text style={styles.subtitle}>Create a new build and start logging</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgePrimary]}>
            <Text style={styles.badgeText}>Build</Text>
          </View>
          <View style={[styles.badge, styles.badgeSecondary]}>
            <Text style={styles.badgeText}>Maintenance</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basics</Text>
        <Text style={styles.inputLabel}>Make</Text>
        <TextInput
          style={styles.input}
          placeholder="Make"
          placeholderTextColor="#64748b"
          value={form.make}
          onChangeText={(value) => updateField('make', value)}
        />
        <Text style={styles.inputLabel}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="Model"
          placeholderTextColor="#64748b"
          value={form.model}
          onChangeText={(value) => updateField('model', value)}
        />
        <Text style={styles.inputLabel}>Year</Text>
        <TextInput
          style={styles.input}
          placeholder="Year"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          value={form.year}
          onChangeText={(value) => updateField('year', value)}
        />
        <Text style={styles.inputLabel}>Trim</Text>
        <TextInput
          style={styles.input}
          placeholder="Trim"
          placeholderTextColor="#64748b"
          value={form.trim}
          onChangeText={(value) => updateField('trim', value)}
        />
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.inputLabel}>Engine</Text>
        <TextInput
          style={styles.input}
          placeholder="Engine"
          placeholderTextColor="#64748b"
          value={form.engine}
          onChangeText={(value) => updateField('engine', value)}
        />
        <Text style={styles.inputLabel}>Transmission</Text>
        <TextInput
          style={styles.input}
          placeholder="Transmission"
          placeholderTextColor="#64748b"
          value={form.transmission}
          onChangeText={(value) => updateField('transmission', value)}
        />
        <Text style={styles.inputLabel}>Current Mileage</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Mileage"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          value={form.current_mileage}
          onChangeText={(value) => updateField('current_mileage', value)}
        />
        <Text style={styles.inputLabel}>Color</Text>
        <TextInput
          style={styles.input}
          placeholder="Color"
          placeholderTextColor="#64748b"
          value={form.color}
          onChangeText={(value) => updateField('color', value)}
        />
        <Text style={styles.inputLabel}>License Plate</Text>
        <TextInput
          style={styles.input}
          placeholder="License Plate"
          placeholderTextColor="#64748b"
          value={form.license_plate}
          onChangeText={(value) => updateField('license_plate', value)}
        />
        <Text style={styles.inputLabel}>VIN</Text>
        <TextInput
          style={styles.input}
          placeholder="VIN"
          placeholderTextColor="#64748b"
          value={form.vin}
          onChangeText={(value) => updateField('vin', value)}
        />
        <Text style={styles.inputLabel}>Oil Change Interval (mi)</Text>
        <TextInput
          style={styles.input}
          placeholder="Oil Change Interval (mi)"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          value={form.oil_change_interval}
          onChangeText={(value) => updateField('oil_change_interval', value)}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Vehicle'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgePrimary: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  badgeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  sectionTitle: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
});

export default AddVehicleScreen;
