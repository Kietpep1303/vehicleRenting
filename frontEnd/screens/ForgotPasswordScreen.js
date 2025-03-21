import { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';

import Input from '../components/Auth/input';
import Button from '../components/ui/Button';
import FlatButton from '../components/ui/FlatButton';
import LoadingOverlay from '../components/ui/LoadingOverlays';
import { requestOTP } from '../util/auth';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../config/theme';

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  async function checkEmailHandler() {
    setIsLoading(true);
    try {
      const response = await requestOTP(email);
      Alert.alert('Success', response.message);
      navigation.replace('ChangePassword', { email }); // Navigate to ChangePasswordScreen with email
    } catch (error) {
      Alert.alert('Error', 'Failed to request OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingOverlay message="Requesting OTP..." />;
  }

  return (
    <View style={styles.bigcontainer}>
      <Text style={styles.title}>Forgot Password</Text>
    <View style={styles.container}>
      <Input style={styles.input}
        label="Email Address"
        value={email}
        onUpdateValue={setEmail}
        keyboardType="email-address"
      />
      <Button onPress={checkEmailHandler}>Check for Email</Button>
      <FlatButton onPress={() => navigation.replace('Login')}>
        Go back to Login
      </FlatButton>
    </View>
    </View>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 64,
    marginHorizontal: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary700,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.primary700,
  },
  bigcontainer: {
    flex: 1,
    justifyContent: 'center',
  },
});