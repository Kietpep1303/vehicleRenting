import { useState } from "react";
import { Alert, StyleSheet, TouchableWithoutFeedback, View, Keyboard } from "react-native";
import { useNavigation } from '@react-navigation/native';

import FlatButton from "../ui/FlatButton";
import AuthForm from "./AuthForm";
import { colors } from "../../config/theme";

function AuthContent({ isLogin, isSignup, onAuthenticate}) {
  const navigation = useNavigation();

  const [credentialdsInvalid, setCredentialsInvalid] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    idCardNumber: false,
  });

  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace('Signup');
    } else {
      navigation.replace('Login');
    }
  }

  function submitHandler(credentials) {
    let { firstName, lastName, email, password, confirmPassword, idCardNumber } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 5;
    const passwordsAreEqual = password === confirmPassword;
    const idCardNumberIsValid = idCardNumber && idCardNumber.length > 0;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!passwordsAreEqual || !passwordsAreEqual))
    ) {
      Alert.alert('Invalid input', 'Please check your entered credentials.');
      setCredentialsInvalid({
        email: !emailIsValid,
        password :!passwordIsValid,
        confirmPassword: !passwordsAreEqual,
        idCardNumber: !idCardNumberIsValid,
      });
      return;
    }
    if (isSignup) {
      onAuthenticate({ firstName, lastName, email, password, idCardNumber });
    } else {
      onAuthenticate({ email, password });
    }
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <View style={styles.authContent}>
          <AuthForm
            isLogin={isLogin}
            isSignup={isSignup}
            onSubmit={submitHandler}
            credentialdsInvalid={credentialdsInvalid}
          />
          <View>
            <FlatButton onPress={switchAuthModeHandler}>
              {isLogin ? 'Create a new user' : 'Log in instead'}
            </FlatButton>
          </View>
          {isLogin && (<FlatButton style={styles.FlatButton} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot your password?
          </FlatButton>)}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}


export default AuthContent;

const styles = StyleSheet.create({
  authContent: {
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
  buttons: {
    marginTop: 8,
  },
  FlatButton: {
    color: colors.primary100,
    marginRight: 16,
  },
});