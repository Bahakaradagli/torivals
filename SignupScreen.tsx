import React, { useState } from 'react';
import { View, StyleSheet, Text, Image,TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import LottieView from "lottie-react-native";

import { Video } from 'expo-av'; // Import Video component from expo-av

export default function DarkSignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        const uid = user?.uid;

        // Firebase Realtime Database'e kullanıcı verilerini kaydediyoruz
        const db = getDatabase();
        set(ref(db, 'users/' + uid), {
          name: name,
          email: email,
          password: password,
          userType: 'users',  // Bunu 'company' veya 'user' olarak belirleyin
        })
        .then(() => {
          console.log('User added to Realtime Database');
          navigation.replace('Home'); // Kayıt başarılıysa ana ekrana yönlendirme
        })
        .catch((error) => {
          console.error('Error adding user to Realtime Database:', error);
        });
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('./assets/GenelBG1.mp4')} // Replace with your video file
        rate={1.0}
        volume={1.0}
        isMuted={true} // Video will play without sound
        resizeMode="cover" // Ensure video covers the screen
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFillObject} // Makes the video fill the screen
      />
        <View style={styles.logoContainer}>
                <Image source={require('./assets/icon.png')} style={styles.logo} />
              </View>
      <View style={styles.formContainer}>
        <Text style={styles.signupTitle}>Sign Up</Text>
        <Text style={styles.signupSubtitle}>Create an account to continue.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
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

        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginText}>Log In</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
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
    backgroundColor: '#00343f',
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
    color: '#00343f',
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
