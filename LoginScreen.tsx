import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av'; // Import Video component from expo-av
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function DarkLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log('Logged in with:', userCredentials.user.email);
        navigation.replace('Home');
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
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

      {/* Login Content */}
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image source={require('./assets/icon.png')} style={styles.logo} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.loginTitle}>Login</Text>
          <Text style={styles.loginSubtitle}>Sign in to continue.</Text>

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
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#888" />
            </TouchableOpacity>
          </View>


          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>
              Don’t have an account? <Text style={styles.signupText}>Create a new account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay over the video
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', // Semi-transparent darker overlay
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginSubtitle: {
    color: '#888',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(44, 44, 44, 0.6)', // Semi-transparent input background
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 10,
    color: '#fff', // White text color for better readability
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
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#888',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: 'rgba(1, 39, 85, 0.6)', // Semi-transparent input backgroundRGBA(1, 39, 85, 1)
    borderRadius: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupLink: {
    color: '#888',
    marginTop: 20,
  },
  signupText: {
    color: '#012755',
  },
});
