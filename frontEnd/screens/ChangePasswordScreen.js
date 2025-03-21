import { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { colors } from '../config/theme';

import Input from '../components/Auth/input';
import Button from '../components/ui/Button';
import LoadingOverlay from '../components/ui/LoadingOverlays';
import { OTPChangePassword } from '../util/auth';

function ChangePasswordScreen({ route }) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { email } = route.params; // Get email from navigation params

  async function submitHandler() {
    setIsLoading(true);
    try {
      const response = await OTPChangePassword(email, otp, newPassword);
      Alert.alert('Success', response.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingOverlay message="Changing password..." />;
  }

  return (
    <View style={styles.bigcontainer}>
      <Text style={styles.title}>Change Password</Text>
    <View style={styles.container}>
      <Input label="Enter OTP" value={otp} onUpdateValue={setOtp} />
      <Input
        label="New Password"
        secure
        value={newPassword}
        onUpdateValue={setNewPassword}
      />
      <Button onPress={submitHandler}>Submit</Button>
    </View>
    </View>
  );
}

export default ChangePasswordScreen;

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