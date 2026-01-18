import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserAuth } from '../context/AuthContext';

const SigninScreen = ({ navigation }) => {
  const { signInUser } = UserAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    setLoading(true);
    setErrorMessage('');
    const result = await signInUser(email.trim(), password);
    if (!result?.success) {
      setErrorMessage(result?.error || 'Failed to sign in');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drivn</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Need an account? Sign up</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 14,
    color: '#f8fafc',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  linkText: {
    color: '#94a3b8',
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: '#f87171',
    marginBottom: 8,
  },
});

export default SigninScreen;
