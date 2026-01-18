import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const LEGAL_COPY = {
  privacy: {
    title: 'Privacy Policy',
    body: `This Privacy Policy explains how we collect, use, and protect your information when you use the Drivn app.

Information we collect:
- Account information (email, username)
- Vehicle data you provide (vehicle details, maintenance logs)
- User‑generated content (discussions, questions, answers, comments)
- Usage data necessary to operate and improve the service

How we use your information:
- To provide core features and personalize your experience
- To store and display your vehicles, logs, and content
- To maintain safety and prevent misuse

Data sharing:
We do not sell your personal information. We share data only with service providers that help us operate the app (for example, hosting and storage), and only to the extent necessary to provide the service.

Data retention and deletion:
You can delete your account at any time from the Profile screen. Deleting your account removes your profile data and associated content from the app, subject to legal or operational retention requirements.

Contact:
If you have questions about this policy, contact support at support@yourapp.com.`,
  },
  terms: {
    title: 'Terms of Service',
    body: `These Terms of Service govern your use of the Drivn app. By accessing or using the app, you agree to these terms.

User responsibilities:
- Provide accurate information and keep your account secure
- Use the app lawfully and respectfully
- Do not upload harmful, illegal, or infringing content

Content:
You retain ownership of the content you submit, but you grant us a license to store, display, and distribute it within the app for the purpose of providing the service.

Enforcement:
We may remove content or suspend accounts that violate these terms or our community standards.

Disclaimers:
The service is provided “as is” without warranties of any kind. We do not guarantee uninterrupted availability or error‑free operation.

Changes:
We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the updated terms.

Contact:
If you have questions about these terms, contact support at support@yourapp.com.`,
  },
  support: {
    title: 'Support',
    body: `Need help? Email us at support@yourapp.com.

Please include:
- Your username
- A brief description of the issue
- Screenshots if possible`,
  },
};

const LegalScreen = ({ route }) => {
  const section = route?.params?.section || 'privacy';
  const content = useMemo(() => LEGAL_COPY[section] || LEGAL_COPY.privacy, [section]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content.title}</Text>
      <View style={styles.card}>
        <Text style={styles.body}>{content.body}</Text>
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
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  body: {
    color: '#e2e8f0',
    lineHeight: 20,
  },
});

export default LegalScreen;
