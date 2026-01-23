import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const VehicleCard = ({ vehicle, onPress, coverUrl, onDelete, deleting }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.9}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Photo</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>
          {vehicle.make} {vehicle.model}
        </Text>
        {vehicle.year ? <Text style={styles.year}>{vehicle.year}</Text> : null}
      </View>
      <View style={styles.metaRow}>
        
        <Text style={styles.metaValue}>
          {vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} mi` : '—'}
        </Text>
      </View>
      {onDelete ? (
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={onDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#64748b',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  year: {
    color: '#94a3b8',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fecaca',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default VehicleCard;
