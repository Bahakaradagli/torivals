import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, TouchableOpacity, Text, StyleSheet,Image, Settings } from 'react-native';
import { Icon } from 'react-native-elements';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import CompanySignUpScreen from './CompanySignupScreen';
import CompanySignInScreen from './CompanySignInScreen';
import ProfileScreen from './ProfileScreen';
import GraphScreen from './GraphScreen';
import CartPage from './CartPage';
import TournamentDetails from './TournamentDetails';
import MatchDetails from './MatchDetails';
import CompanyProfileScreen from './CompanyProfileScreen';
import CompanyAddItem from './CompanyAddItem';
import BuySubPage from './BuySubPage';
import ProductsPage from './ProductsPage';
import Tournaments from './Tournaments';
import ProductDetails from './ProductDetails';
import MyTournaments from './MyTournaments'; // MyTournaments sayfasını içeri aktar
import ShufflePage from './ShufflePage';
import MyClubPage from './MyClubPage2';
import CompanyHomePage from './CompanyHomePage'; // Şirketler için HomePage Component
import SharePage from './ShufflePageFolder/TampleSharingCardThema'
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { database } from './firebase';
import 'expo-dev-client';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsPage" component={ProductsPage} options={{ title: 'Products', headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ title: 'Product Details', headerShown: false }} />
    </Stack.Navigator>
  );
}

function MyTournamentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyTournaments"
        component={MyTournaments}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TournamentDetails"
        component={TournamentDetails}
        options={{ headerShown: false }}
      />
                    <Stack.Screen name="MatchDetails" component={MatchDetails}         options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


function HomeTabs() {
  const [userType, setUserType] = useState<string | null>(null);
  const [subsStatus, setSubsStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const companyRef = ref(database, `companies/${user.uid}`);
      onValue(companyRef, (snapshot) => {
        const companyData = snapshot.val();
        if (companyData) {
          setUserType(companyData.userType);
          const subsRef = ref(database, `companies/${user.uid}/accountInfo/Subs`);
          onValue(subsRef, (subsSnapshot) => {
            const subsValue = subsSnapshot.val();
            setSubsStatus(subsValue);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#012755" />
      </View>
    );
  }

  if (userType === 'companies' && subsStatus !== '123456') {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="BuySub"
          component={BuySubPage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarStyle: {
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      height: 100,
    },
    tabBarInactiveTintColor: '#d9d9d9',
    tabBarActiveTintColor: '#ffffff',
    headerShown: false,
    tabBarLabelStyle: {
      fontSize: 13,
      marginBottom: 8,
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'Home') {
        iconName = 'home';
      } else if (route.name === 'Products') {
        iconName = 'list';
      } else if (route.name === 'AddItem') {
        iconName = 'add-circle';
      } else if (route.name === 'Sales') {
        iconName = 'stats-chart';
      } else if (route.name === 'Search') {
        iconName = 'search';
      }else if (route.name === 'Tournaments') {
        iconName = 'trophy'; // İkon ismi Expo'nun Ionicons kütüphanesine uygun olmalı
      } else if (route.name === 'Profile') {
        iconName = 'person';
      }

      return (
        <View style={{ alignItems: 'center' }}>
  
          <Ionicons name={iconName} size={size} color={color} />
        </View>
      );
    },
    tabBarBackground: () => (
      <Image
        source={require('./assets/downpanel.png')}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />
    ),
  })}
>
  <Tab.Screen
    name="Home"
    component={userType === 'companies' ? ShufflePage : ShufflePage}
    options={{
      tabBarLabel: 'Home',
    }}
  />
<Tab.Screen
        name="Search"
        component={Tournaments} // Turnuvalar bileşeni ShufflePage'e yönlendirilmiş.
        options={{
          tabBarLabel: 'Search',
        }}
      />
<Tab.Screen
  name="MyTournamentss"
  component={MyTournamentsStack}
  options={{
    tabBarLabel: 'Rivals',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="trophy" size={size} color={color} />
    ),
  }}
/>
<Tab.Screen
  name="MyClub"
  component={MyClubPage}
  options={{
    tabBarLabel: 'My Club',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="people" size={size} color={color} />
    ),
  }}
/>






  {userType === 'companies' && (
    <>
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          tabBarLabel: 'Ürünlerim',
        }}
      />
 

      <Tab.Screen
        name="AddItem"
        component={CompanyAddItem}
        options={{
          tabBarLabel: 'Yeni Ürün',
        }}
      />
      
    </>
  )}
  {userType !== 'companies' && (
    <>

    </>
  )}
  <Tab.Screen
    name="Profile"
    component={userType === 'companies' ? CompanyProfileScreen : ProfileScreen}
    options={{
      tabBarLabel: 'Profile',
    }}
  />
</Tab.Navigator>
  );
}


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribeAuth;
  }, []);

  return (
    <NavigationContainer>
    {isLoggedIn ? (
      <Stack.Navigator>
<Stack.Screen
  name="HomeTabs"
  component={HomeTabs}
  options={{
    headerShown: true,
    headerTitle: '', // Başlığı tamamen kaldırır
    headerLeft: () => (
      <TouchableOpacity style={{ marginLeft: 15 }}>
        <Image
          source={require('./assets/adaptive-icon.png')} // Adaptif ikon
          style={{ width: 60, height: 60 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
    headerBackground: () => (
      <Image
        source={require('./assets/downpanel.png')} // Arka plan
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    ),
  }}
/>

        <Stack.Screen
          name="Settings"
          component={GraphScreen}
          options={{
            headerShown: true,
            headerTitle: 'Ayarlar',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    ) : (
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CompanySignup" component={CompanySignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CompanySignIn" component={CompanySignInScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    )}
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'rgba(243, 156, 18, 0.8)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
