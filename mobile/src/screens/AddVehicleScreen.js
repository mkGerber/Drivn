import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import supabase from '../supabaseClient';
import vehicleModels from '../data/vehicle models.json';
import { UserAuth } from '../context/AuthContext';

const AddVehicleScreen = ({ navigation }) => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
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
    type: '',
  });

  const catalog = useMemo(() => {
    const yearSet = new Set();
    const list = (vehicleModels || [])
      .map((entry) => {
        const make = String(entry?.Make || entry?.make_name || '').trim();
        if (!make) return null;
        const rawModels = (entry?.Models || entry?.models || [])
          .map((model) => {
            const name = String(model?.model_name || model || '').trim();
            if (!name) return null;
            const years = (model?.years || []).map((value) => Number(value)).filter(Boolean);
            years.forEach((year) => yearSet.add(year));
            return { name, years };
          })
          .filter(Boolean);
        const modelsByName = new Map();
        rawModels.forEach((model) => {
          const key = model.name.toLowerCase();
          if (!modelsByName.has(key)) {
            modelsByName.set(key, model);
            return;
          }
          const existing = modelsByName.get(key);
          const mergedYears = new Set([...(existing.years || []), ...(model.years || [])]);
          modelsByName.set(key, { name: existing.name, years: Array.from(mergedYears) });
        });
        const models = Array.from(modelsByName.values());
        return { make, models };
      })
      .filter(Boolean);

    list.sort((a, b) => a.make.localeCompare(b.make));
    const years = Array.from(yearSet).sort((a, b) => b - a);
    return { list, years };
  }, []);

  const selectedYear = useMemo(() => Number(form.year) || null, [form.year]);

  const makeOptions = useMemo(() => {
    const allMakes = catalog.list.map((entry) => entry.make).sort((a, b) => a.localeCompare(b));
    if (catalog.years.length === 0) return [...allMakes, 'Other'];
    if (!selectedYear) return [];
    const filtered = catalog.list
      .filter((entry) => entry.models.some((model) => model.years.includes(selectedYear)))
      .map((entry) => entry.make)
      .sort((a, b) => a.localeCompare(b));
    const base = filtered.length === 0 ? allMakes : filtered;
    return [...base, 'Other'];
  }, [catalog, form.year, selectedYear]);

  const selectedMake = useMemo(
    () => catalog.list.find((item) => item.make === form.make) || null,
    [catalog, form.make]
  );

  const modelOptions = useMemo(() => {
    if (!selectedMake) return [];
    const allModels = selectedMake.models
      .map((model) => model.name)
      .sort((a, b) => a.localeCompare(b));
    if (catalog.years.length === 0) return [...allModels, 'Other'];
    if (!selectedYear) return [...allModels, 'Other'];
    const filtered = selectedMake.models
      .filter((model) => model.years.includes(selectedYear))
      .map((model) => model.name)
      .sort((a, b) => a.localeCompare(b));
    const base = filtered.length === 0 ? allModels : filtered;
    return [...base, 'Other'];
  }, [catalog.years.length, form.year, selectedMake, selectedYear]);

  const getTypeForMake = (value = '') => {
    const make = value.trim().toLowerCase();
    if (!make) return '';
    const euro = new Set([
      'audi', 'bmw', 'mercedes-benz', 'mercedes', 'porsche', 'volkswagen', 'volvo', 'mini',
      'land rover', 'jaguar', 'alfa romeo', 'fiat', 'peugeot', 'renault', 'skoda', 'seat',
      'bentley', 'maserati', 'ferrari', 'lamborghini', 'aston martin', 'rolls-royce', 'mclaren',
    ]);
    const jdm = new Set([
      'toyota', 'lexus', 'honda', 'acura', 'nissan', 'infiniti', 'mazda', 'subaru', 'mitsubishi',
      'suzuki', 'daihatsu', 'isuzu',
    ]);
    const domestic = new Set([
      'ford', 'chevrolet', 'gmc', 'cadillac', 'buick', 'chrysler', 'dodge', 'ram', 'jeep',
      'lincoln', 'tesla', 'rivian',
    ]);
    const korean = new Set(['hyundai', 'kia', 'genesis']);
    if (euro.has(make)) return 'Euro';
    if (jdm.has(make)) return 'JDM';
    if (domestic.has(make)) return 'Domestic';
    if (korean.has(make)) return 'Korean';
    return 'Other';
  };

  useEffect(() => {
    if (!form.make) {
      setForm((prev) => ({ ...prev, model: '', type: '' }));
      return;
    }
    if (form.make === 'Other') {
      setForm((prev) => ({ ...prev, type: 'Other' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      model: prev.model && modelOptions.includes(prev.model) ? prev.model : '',
      type: getTypeForMake(form.make),
    }));
  }, [form.make, modelOptions]);

  useEffect(() => {
    if (!form.year) {
      setForm((prev) => ({ ...prev, make: '', model: '', type: '' }));
      setCustomMake('');
      setCustomModel('');
      return;
    }
    if (form.make && form.make !== 'Other' && !makeOptions.includes(form.make)) {
      setForm((prev) => ({ ...prev, make: '', model: '', type: '' }));
      setCustomMake('');
      setCustomModel('');
    }
  }, [form.year, makeOptions]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const SearchablePicker = ({ label, placeholder, value, options, onSelect, disabled }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filteredOptions = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options
        .map((item) => {
          const value = item.toLowerCase();
          if (value.startsWith(q)) {
            return { item, score: 0 };
          }
          if (value.includes(q)) {
            return { item, score: 1 };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          return a.item.localeCompare(b.item);
        })
        .map((entry) => entry.item);
    }, [options, query]);

    useEffect(() => {
      if (!open) setQuery('');
    }, [open]);

    return (
      <View style={styles.selectWrap}>
        <TouchableOpacity
          style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
          onPress={() => {
            if (!disabled) setOpen(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={value ? styles.selectText : styles.selectPlaceholder}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>
        <Modal visible={open} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}`}
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={setQuery}
              />
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    const resolvedMake = form.make === 'Other' ? customMake.trim() : form.make;
    const resolvedModel = form.model === 'Other' || form.make === 'Other'
      ? customModel.trim()
      : form.model;
    const resolvedYear = Number(form.year);
    if (!resolvedMake || !resolvedModel || !resolvedYear) return;
    setLoading(true);
    const payload = {
      user_id: session.user.id,
      make: resolvedMake,
      model: resolvedModel,
      year: resolvedYear,
      trim: form.trim || null,
      engine: form.engine || null,
      transmission: form.transmission || null,
      current_mileage: form.current_mileage ? Number(form.current_mileage) : null,
      color: form.color || null,
      license_plate: form.license_plate || null,
      vin: form.vin || null,
      oil_change_interval: form.oil_change_interval ? Number(form.oil_change_interval) : null,
      type: form.type || null,
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
        <Text style={styles.inputLabel}>Year</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter year"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          value={form.year}
          onChangeText={(value) => updateField('year', value)}
        />
        <Text style={styles.inputLabel}>Make</Text>
        <SearchablePicker
          label="Make"
          placeholder={form.year || catalog.years.length === 0 ? 'Select make' : 'Pick a year first'}
          value={form.make}
          options={makeOptions}
          onSelect={(value) => {
            updateField('make', value);
            setCustomMake('');
            setCustomModel('');
          }}
          disabled={!form.year && catalog.years.length > 0}
        />
        {form.make === 'Other' ? (
          <TextInput
            style={styles.input}
            placeholder="Enter make"
            placeholderTextColor="#64748b"
            value={customMake}
            onChangeText={setCustomMake}
          />
        ) : null}
        <Text style={styles.inputLabel}>Model</Text>
        <SearchablePicker
          label="Model"
          placeholder={form.make ? 'Select model' : 'Pick a make first'}
          value={form.model}
          options={modelOptions}
          onSelect={(value) => {
            updateField('model', value);
            if (value !== 'Other') setCustomModel('');
          }}
          disabled={!form.make || form.make === 'Other'}
        />
        {form.make === 'Other' || form.model === 'Other' ? (
          <TextInput
            style={styles.input}
            placeholder="Enter model"
            placeholderTextColor="#64748b"
            value={customModel}
            onChangeText={setCustomModel}
          />
        ) : null}
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
  searchInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  selectWrap: {
    marginBottom: 10,
  },
  selectButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: '#64748b',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  modalClose: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  optionRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  optionText: {
    color: '#f8fafc',
  },
  readonlyField: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    padding: 12,
    marginBottom: 10,
  },
  readonlyText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
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
