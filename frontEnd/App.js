import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator} from '@react-navigation/native-stack';

import { Button, Header } from '@react-navigation/elements';
import { colors } from './config/theme';
import AuthContextProvider, {AuthContext} from './store/auth-context';
import { Feather } from "@expo/vector-icons";
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarStyle: {
          backgroundColor: colors.primary100,
          borderTopColor: colors.primary500,
          borderTopWidth: -10,
          height: 75,
        },
        tabBarItemStyle:{
          paddingVertical: 6
        },
        tabBarInactiveTintColor: colors.primary200,
        tabBarActiveTintColor: colors.primary500,
        tabBarIcon: ({size, color}) =>{
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Search') {
            iconName = "search";
          } else if (route.name === 'Cart') {
            iconName = "shopping-cart";
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } 

          return <Feather name={iconName} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPress={() => navigation.navigate('Profile')}>
        Go to Profile
      </Button>
    </View>
  );
}

function SearchScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Search Screen</Text>
      <Button onPress={() => navigation.navigate('Cart')}>Go to Cart</Button>
    </View>
  );
}

function CartScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
      <Text>Your Cart Here</Text>
      <Button onPress={() => navigation.navigate('Search')}>Search for items?</Button>
    </View>
  );
}

function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Screen</Text>
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary500},
        headerTintColor: 'white',
        contentStyle: {backgroundColor: colors.primary100},
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen}  />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Tabs" component={MyTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}