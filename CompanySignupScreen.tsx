import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import LottieView from "lottie-react-native";


export default function CompanySignupScreen() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleCompanySignUp = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        const uid = user?.uid;
  
        // Firebase Realtime Database: Create company data and account info
        const db = getDatabase();
  
        // Save company details
        const companyData = {
          companyName: companyName,
          email: email,
          password: password,
          userType: 'companies',
        };
  
        // Save subscription info
        const accountInfoData = {
          Subs: 'off', // Default subscription status
        };
  
        // Write both company details and subscription info to the database
        Promise.all([
          set(ref(db, `companies/${uid}`), companyData),
          set(ref(db, `companies/${uid}/accountInfo/`), accountInfoData),
        ])
          .then(() => {
            console.log('Company and subscription info added to Realtime Database');
            navigation.replace('Home'); // Redirect to home after successful signup
          })
          .catch((error) => {
            console.error('Error adding data to Realtime Database:', error);
          });
      })
      .catch((error) => alert(error.message));
  };
  
  return (
    <View style={styles.container}>
      {/* Arka plan Lottie animasyonu */}


      <View style={styles.formContainer}>
        <Text style={styles.signupTitle}>Company Sign Up</Text>
        <Text style={styles.signupSubtitle}>Create a company account to continue.</Text>

        <TextInput
          style={styles.input}
          placeholder="Company Name"
          placeholderTextColor="#888"
          value={companyName}
          onChangeText={setCompanyName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.showPasswordIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleCompanySignUp}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            Already have a company account? <Text style={styles.loginText}>Log In</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.companySignupLink}>
            Are you wanna register as a Employee? <Text style={styles.companySignupText}>Register here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Koyu arka plan
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  companyName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  tagline: {
    color: '#888',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: '#1e1e1e', // Kart arka planı koyu
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  signupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signupSubtitle: {
    color: '#888',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 10,
    color: '#fff',
    height: 40,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 15,
  },
  signupButton: {
    backgroundColor: '#f39c12',
    borderRadius: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    color: '#888',
    marginTop: 20,
  },
  loginText: {
    color: '#f39c12',
  },
  companySignupLink: {
    color: '#888',
    marginTop: 20,
  },
  companySignupText: {
    color: '#f39c12',
  },
  bgAnimaiton: {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  width: '500%',
  height: '500%',
  zIndex: 0, // Send animation to the background
  }
});
