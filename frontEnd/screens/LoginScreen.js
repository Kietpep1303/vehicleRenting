import { useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import { login } from '../util/auth';
import { useNavigation } from '@react-navigation/native';
import LoadingOverlay from '../components/ui/LoadingOverlays';
import { colors } from '../config/theme';
import FlatButton from '../components/ui/FlatButton';

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigation = useNavigation();

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      console.log("Sending login request with payload:", { email, password });

      const response = await login(email, password);

      console.log("Login successful:", response);

      if (response.message === 'Login successful') {
        navigation.replace('Tabs'); // Navigate to HomeScreen
      } else {
        Alert.alert('Login failed', 'Unexpected response from the server.');
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        'Authentication failed!',
        'Could not log you in. Please check your credentials or try again later!'
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Logging you in..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <AuthContent isLogin onAuthenticate={loginHandler} />
      <FlatButton onPress={() => navigation.navigate('Tabs')} style={{ marginTop: 16 }}>
        To HomeScreen
      </FlatButton>
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.primary700,
  },
});