import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage eklendi
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function DarkLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Remember Me state
  const navigation = useNavigation();

  // Uygulama açıldığında kayıtlı bilgileri kontrol et
  useEffect(() => {
    const checkRememberedUser = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedEmail && savedPassword && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
          // 🔹 Giriş işlemini biraz gecikmeli başlat, böylece email ve şifre state'e yerleşsin
          setTimeout(() => {
            handleLogin(savedEmail, savedPassword);
          }, 100);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    checkRememberedUser();
  }, []);

  // 🔹 Giriş fonksiyonu (email ve şifre parametre alabilir)
  const handleLogin = async (emailParam = email, passwordParam = password) => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, emailParam, passwordParam)
      .then(async (userCredentials) => {
        console.log('Logged in with:', userCredentials.user.email);
        if (rememberMe) {
          await AsyncStorage.setItem('userEmail', emailParam);
          await AsyncStorage.setItem('userPassword', passwordParam);
          await AsyncStorage.setItem('rememberMe', JSON.stringify(true));
        } else {
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userPassword');
          await AsyncStorage.setItem('rememberMe', JSON.stringify(false));
        }
        navigation.replace('Home');
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('./assets/GenelBG1.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFillObject}
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

          {/* Remember Me Checkbox */}
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Icon
              name={rememberMe ? 'check-square' : 'square-o'}
              size={20}
              color="#fff"
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin()}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
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
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeText: {
    color: '#fff',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: 'rgba(1, 39, 85, 0.6)',
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
