import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserAuth } from '../context/AuthContext';
import SigninScreen from '../screens/SigninScreen';
import SignupScreen from '../screens/SignupScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ExploreScreen from '../screens/ExploreScreen';
import GarageScreen from '../screens/GarageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import VehicleCommunityScreen from '../screens/VehicleCommunityScreen';
import DiscussionDetailScreen from '../screens/DiscussionDetailScreen';
import LegalScreen from '../screens/LegalScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthedTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      headerStyle: { backgroundColor: '#0b1120' },
      headerTitleStyle: { color: '#f8fafc', fontWeight: '700' },
      headerTintColor: '#f8fafc',
      tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1f2937' },
      tabBarActiveTintColor: '#f97316',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarIcon: ({ color, size }) => {
        const iconMap = {
          Marketplace: 'pricetag',
          Explore: 'compass',
          Garage: 'car-sport',
          Profile: 'person-circle',
        };
        const iconName = iconMap[route.name] || 'ellipse';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Garage" component={GarageScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { session } = UserAuth();

  return (
    <Stack.Navigator>
      {session ? (
        <>
          <Stack.Screen name="Tabs" component={AuthedTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="VehicleDetails"
            component={VehicleDetailsScreen}
            options={({ route }) => ({
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#f8fafc',
              headerShadowVisible: false,
              headerBackTitle: route.params?.backTitle || 'Back',
              headerBackTitleVisible: true,
            })}
          />
          <Stack.Screen
            name="VehicleCommunity"
            component={VehicleCommunityScreen}
            options={{ headerShown: true, title: 'Community' }}
          />
          <Stack.Screen
            name="DiscussionDetail"
            component={DiscussionDetailScreen}
            options={{ headerShown: true, title: 'Discussion' }}
          />
          <Stack.Screen
            name="Legal"
            component={LegalScreen}
            options={{ headerShown: true, title: 'Legal' }}
          />
          <Stack.Screen
            name="AddVehicle"
            component={AddVehicleScreen}
            options={({ route }) => ({
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#f8fafc',
              headerShadowVisible: false,
              headerBackTitle: route.params?.backTitle || 'Back',
              headerBackTitleVisible: true,
            })}
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={({ route }) => ({
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: '#0b1120' },
              headerTintColor: '#f8fafc',
              headerShadowVisible: false,
              headerBackTitle: route.params?.backTitle || 'Back',
              headerBackTitleVisible: true,
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Signin" component={SigninScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
