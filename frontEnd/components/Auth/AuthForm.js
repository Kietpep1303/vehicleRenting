import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/core';
// import MainApp from 

import Button from '../ui/Button';
import Input from './input';

function AuthForm({ isLogin, isSignup, onSubmit, credentialsInvalid }) {
  const navigation = useNavigation();

  const [enteredFirstName, setEnteredFirstName] = useState("");
  const [enteredLastName, setEnteredLastName] = useState("");
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredConfirmPassword, setEnteredConfirmPassword] = useState("");
  const [enteredIdCardNumber, setEnteredIdCardNumber] = useState("");

  const {
    firstName: firstNameIsInvalid,
    lastName: lastNameIsInvalid,
    email: emailIsInvalid,
    password: passwordIsInvalid,
    confirmPassword: confirmPasswordIsInvalid,
    idCardNumber: idCardNumberIsInvalid,
  } = credentialsInvalid || {};

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case "firstName":
        setEnteredFirstName(enteredValue);
        break;
      case "lastName":
        setEnteredLastName(enteredValue);
        break;
      case "email":
        setEnteredEmail(enteredValue);
        break;
      case "password":
        setEnteredPassword(enteredValue);
        break;
      case "confirmPassword":
        setEnteredConfirmPassword(enteredValue);
        break;
      case "idCardNumber":
        setEnteredIdCardNumber(enteredValue);
        break;
    }
  }

  function submitHandler() {
    onSubmit({
      firstName: enteredFirstName,
      lastName: enteredLastName,
      email: enteredEmail,
      password: enteredPassword,
      confirmPassword: enteredConfirmPassword,
      idCardNumber: enteredIdCardNumber,
    });
  }

  return (
    <View style={styles.form}>
      {isSignup && (
        <>
          <Input
            label="First Name"
            onUpdateValue={updateInputValueHandler.bind(this, "firstName")}
            value={enteredFirstName}
            isInvalid={firstNameIsInvalid}
          />
          <Input
            label="Last Name"
            onUpdateValue={updateInputValueHandler.bind(this, "lastName")}
            value={enteredLastName}
            isInvalid={lastNameIsInvalid}
          />
          <Input
            label="ID Card Number"
            onUpdateValue={updateInputValueHandler.bind(this, "idCardNumber")}
            value={enteredIdCardNumber}
            isInvalid={idCardNumberIsInvalid}
          />
        </>
      )}
      <Input
        label="Email Address"
        onUpdateValue={updateInputValueHandler.bind(this, "email")}
        value={enteredEmail}
        isInvalid={emailIsInvalid}
      />
      <Input
        label="Password"
        secure
        onUpdateValue={updateInputValueHandler.bind(this, "password")}
        value={enteredPassword}
        isInvalid={passwordIsInvalid}
      />
      {!isLogin && (
        <Input
          label="Confirm Password"
          secure
          onUpdateValue={updateInputValueHandler.bind(this, "confirmPassword")}
          value={enteredConfirmPassword}
          isInvalid={confirmPasswordIsInvalid}
        />
      )}
      <View style={styles.buttons}>
        <Button onPress={submitHandler}>
          {isLogin ? "Log In" : "Sign Up"}
        </Button>
      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
  },
  buttons: {
    marginTop: 12,
  },
});

