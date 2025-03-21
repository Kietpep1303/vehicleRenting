import { useState } from "react";
import { Alert, Text, View, StyleSheet } from "react-native";

import AuthContent from "../components/Auth/AuthContent";
import LoadingOverlay from "../components/ui/LoadingOverlays";
import { createUser } from "../util/auth";
import { useNavigation } from "@react-navigation/native";
import { colors } from '../config/theme';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigation = useNavigation();

  async function signupHandler({ firstName, lastName, email, password, idCardNumber }) {
    setIsAuthenticating(true);
    try {
      console.log("Sending signup request...");
      const response = await createUser(firstName, lastName, email, password, idCardNumber);
      console.log("Signup successful:", response);

      if (response.message === 'User registered successfully') {
        Alert.alert('Signup successful!', 'You can now log in.');
        navigation.replace('Login'); // Navigate to LoginScreen
      } else {
        Alert.alert('Signup failed', 'Unexpected response from the server.');
      }
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert(
        'Signup failed!',
        'Could not sign you up. Please check your credentials or try again later!'
      );
    } finally{
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating account..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <AuthContent isSignup onAuthenticate={signupHandler} />
    </View>
  );
}

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.primary700,
  },
});