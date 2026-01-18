import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { signUpNewUser } = UserAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setErrorMessage('');
    const result = await signUpNewUser(email.trim(), password);
    if (!result?.success) {
      setErrorMessage(result?.error?.message || 'Failed to sign up');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Drivn in seconds</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
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

export default SignupScreen;
