import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push,update, set } from 'firebase/database';
import { database } from './firebase';

const Tournaments = () => {
  const [inputId, setInputId] = useState('');
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  const imageMap = {
    'turnuva1.png': require('./assets/titleturnuva1.png'),
    'turnuva2.png': require('./assets/titleturnuva2.png'),
    'turnuva3.png': require('./assets/titleturnuva3.png'),
    'turnuva4.png': require('./assets/titleturnuva4.png'),
    'turnuva5.png': require('./assets/titleturnuva5.png'),
    'turnuva6.png': require('./assets/titleturnuva6.png'),
    'turnuva7.png': require('./assets/titleturnuva7.png'),
  };

  const fetchTournament = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError('Kullanıcı oturumu açık değil.');
      return;
    }

    const tournamentsRef = ref(database, `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments`);
    onValue(tournamentsRef, (snapshot) => {
      const data = snapshot.val();
      const foundTournament = Object.values(data || {}).find(
        (item) => item.tournamentId === inputId
      );

      if (foundTournament) {
        setTournament(foundTournament);
        setError('');
        checkIfAlreadyJoined(foundTournament.tournamentId);
      } else {
        setTournament(null);
        setError('Bu ID ile eşleşen bir turnuva bulunamadı.');
      }
    });
  };

  const checkUserType = (callback: (isCompany: boolean) => void) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userType = snapshot.val()?.userType || 'user';
        callback(userType === 'companies');
      }, { onlyOnce: true });
    } else {
      callback(false);
    }
  };

  const checkIfAlreadyJoined = (tournamentId) => {
    const auth = getAuth();
    const user = auth.currentUser;

    const myTournamentsRef = ref(database, `users/${user.uid}/MyTournaments`);
    onValue(myTournamentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const alreadyJoined = Object.values(data).includes(tournamentId);

      setJoined(alreadyJoined);
    });
  };
  
  const handleJoinTournament = () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setError('Kullanıcı oturumu açık değil.');
      return;
    }
  
    // Eğer kullanıcı adminse sadece kendi hesabına eklesin
    if (user.email === 'admin@gmail.com') {
      const myTournamentsRef = ref(database, `companies/${user.uid}/MyTournaments`);
      update(myTournamentsRef, {
        [tournament.tournamentId]: tournament.tournamentId
      })
        .then(() => {
          alert('Turnuva başarıyla hesabınıza eklendi!');
          setJoined(true);
        })
        .catch((error) => console.error('Hata:', error.message));
      return;
    }
  
    // Kullanıcının userType'ını kontrol et
    checkUserType((isCompany) => {
      const myTournamentsRef = ref(database, `users/${user.uid}/MyTournaments`);
  
      if (isCompany) {
        update(myTournamentsRef, {
          [tournament.tournamentId]: tournament.tournamentId
        })
          .then(() => {
            alert('Turnuva başarıyla hesabınıza eklendi!');
            setJoined(true);
          })
          .catch((error) => console.error('Hata:', error.message));
      } else {
        const userCompanyRef = ref(database, `users/${user.uid}/zzzCardInformation`);
  
        onValue(
          userCompanyRef,
          (snapshot) => {
            const companyData = snapshot.val();
  
            let companyName = 'Bilinmiyor';
            if (companyData) {
              const firstKey = Object.keys(companyData)[0];
              companyName = companyData[firstKey]?.companyName || 'Bilinmiyor';
            }
  
            const participantData = {
              id: user.uid, // 🔥 Kullanıcı kendi UID’si ile kaydolacak
              email: user.email,
              companyName: companyName,
            };
  
            // 🔥 `push` yerine `set` kullanarak UID ile ekleme yapıyoruz
            const participantRef = ref(
              database,
              `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/participants/${user.uid}`
            );
  
            set(participantRef, participantData) // 🔥 Kullanıcının UID'sini key olarak kullanarak ekleme
              .then(() => {
                update(myTournamentsRef, {
                  [tournament.tournamentId]: tournament.tournamentId
                })
                  .then(() => {
                    alert('Turnuvaya başarıyla katıldınız!');
                    setJoined(true);
                  })
                  .catch((error) => console.error('Hata:', error.message));
              })
              .catch((error) => console.error('Hata:', error.message));
          },
          { onlyOnce: true }
        );
      }
    });
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Tournament</Text>
      <TextInput
        style={styles.input}
        placeholder="Tournament ID"
        value={inputId}
        onChangeText={(text) => setInputId(text)}
        placeholderTextColor="#fff"
      />
      <TouchableOpacity style={styles.searchButton} onPress={fetchTournament}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tournament && (
        <View style={styles.card}>
          <View style={styles.header}>
            <Image
              source={imageMap[tournament.imageUrl] || require('./assets/turnuva5.png')}
              style={styles.image}
            />
            <View>
              <Text style={styles.tournamentName}>{tournament.tournamentName}</Text>
              <Text style={styles.tournamentDate}>{tournament.startDate}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.joinButton, joined && styles.disabledButton]}
            onPress={handleJoinTournament}
            disabled={joined}
          >
            <Text style={styles.joinButtonText}>{joined ? 'Joined' : 'Join'}</Text>
            </TouchableOpacity>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{tournament.content}</Text>
              <Text style={styles.statLabel}>Rule</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{tournament.participantCount}</Text>
              <Text style={styles.statLabel}>Player</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Cup</Text>
              <Text style={styles.statLabel}>Tournament</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
      },
      input: {
        height: 50,
        borderColor: '#00343f',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#fff',
        backgroundColor: '#000',
      },
      searchButton: {
        backgroundColor: '#00343f',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
      },
      searchButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
      },
      error: {
        color: '#e74c3c',
        marginTop: 10,
      },
      card: {
        backgroundColor: '#030303',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      image: {
        width: 100,
        height: 100,
        borderRadius: 35,
        marginRight: 15,
      },
      tournamentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
      },
      tournamentDate: {
        fontSize: 16,
        color: '#ccc',
      },
      joinButton: {
        backgroundColor: '#3498db',
        paddingVertical: 8,
        left:13,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 15,
      },
      joinButtonText: {
        color: '#fff',
        fontSize: 16,
      },
      statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
      },
      statBox: {
        alignItems: 'center',
        width: '30%',
      },
      statValue: {
        fontSize: 15,
        color: '#00343f',
      },
      statLabel: {
        fontSize: 13,
        color: '#ccc',
      },

 
  disabledButton: {
    backgroundColor: '#00343f',
  },
 
});

export default Tournaments; 