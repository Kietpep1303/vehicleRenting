import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { colors } from '../../config/theme';

function Input({
  label,
  keyboardType,
  secure,
  onUpdateValue,
  value,
  isInvalid,
}) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
          {label}
        </Text>
        <TextInput
          style={[styles.input, isInvalid && styles.inputInvalid]}
          // autoCapitalize={false}
          autoCapitalize="none"
          keyboardType={keyboardType}
          secureTextEntry={secure}
          onChangeText={onUpdateValue}
          value={value}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    color: 'white',
    marginBottom: 4,
  },
  labelInvalid: {
    color: colors.error500,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: colors.primary100,
    borderRadius: 4,
    fontSize: 16,
  },
  inputInvalid: {
    backgroundColor: colors.error,
  },
});