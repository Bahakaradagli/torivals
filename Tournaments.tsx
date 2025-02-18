import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push,update, set } from 'firebase/database';
import { database } from './firebase';

const Tournaments = () => {
  const [inputId, setInputId] = useState('');
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [approveUser, setApproveUser] = useState(''); // Onaylanacak kullanıcı
  const [isAdmin, setIsAdmin] = useState(false); // Admin kontrolü
  const [eventType, setEventType] = useState(null); // 📌 Turnuva mı Lig mi?

  const imageMap = {
    'turnuva1.png': require('./assets/titleturnuva1.png'),
    'turnuva2.png': require('./assets/titleturnuva2.png'),
    'turnuva3.png': require('./assets/titleturnuva3.png'),
    'turnuva4.png': require('./assets/titleturnuva4.png'),
    'turnuva5.png': require('./assets/titleturnuva5.png'),
    'turnuva6.png': require('./assets/titleturnuva6.png'),
    'turnuva7.png': require('./assets/titleturnuva7.png'),
  };



  // 🟢 Kullanıcının admin olup olmadığını kontrol et
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user?.email === 'admin@gmail.com') {
      setIsAdmin(true); // Eğer kullanıcı admin ise, isAdmin'i true yap
    } else {
      setIsAdmin(false);
    }
  }, []); // 🔥 Sadece başlangıçta bir kez çalışsın

  
  const fetchTournament = () => {
    if (!inputId.trim()) {
      setError('Lütfen bir ID girin.');
      return;
    }

    const tournamentsRef = ref(database, `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments`);
    const leaguesRef = ref(database, `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Leagues`);

    let foundEvent = null;
    let foundType = null;

    // Turnuvaları kontrol et
    onValue(tournamentsRef, (tournamentSnapshot) => {
      const tournamentData = tournamentSnapshot.val();
      const foundTournament = Object.values(tournamentData || {}).find(
        (item) => item.tournamentId === inputId
      );

      if (foundTournament) {
        foundEvent = foundTournament;
        foundType = 'Tournament';
      }

      // Ligleri kontrol et
      onValue(leaguesRef, (leagueSnapshot) => {
        const leagueData = leagueSnapshot.val();
        const foundLeague = Object.values(leagueData || {}).find(
          (item) => item.tournamentId === inputId
        );

        if (foundLeague) {
          foundEvent = foundLeague;
          foundType = 'League';
        }

        if (foundEvent) {
          setTournament(foundEvent);
          setEventType(foundType);
          setError('');
        } else {
          setTournament(null);
          setError('Bu ID ile eşleşen bir etkinlik bulunamadı.');
        }
      }, { onlyOnce: true });
    }, { onlyOnce: true });
  };


  const handleApproveUser = () => {
    if (!approveUser.trim()) {
      alert('Lütfen bir kullanıcı adı girin.');
      return;
    }

    const approvedRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/${eventType}s/${tournament.tournamentId}/approved/${approveUser}`
    );

    set(approvedRef, { username: approveUser })
      .then(() => {
        alert(`${approveUser} başarıyla onaylandı!`);
        setApproveUser('');
      })
      .catch((error) => console.error('Hata:', error.message));
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
  
  const handleJoinTournament = () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setError('Kullanıcı oturumu açık değil.');
      return;
    }
  
    if (!tournament || !eventType) {
      alert('Lütfen önce bir turnuva veya lig bulun.');
      return;
    }
  
    const userCompanyRef = ref(database, `users/${user.uid}/zzzCardInformation`);
  
    onValue(userCompanyRef, (snapshot) => {
      const companyData = snapshot.val();
  
      if (!companyData) {
        alert("You don't have permission");
        return;
      }
  
      let companyName = 'Unknown';
      const firstKey = Object.keys(companyData)[0];
      companyName = companyData[firstKey]?.companyName || 'Unknown';
  
      // 🟢 Kullanıcının `approved` listesinde olup olmadığını kontrol et
      const approvedRef = ref(
        database, 
        `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/${eventType}s/${tournament.tournamentId}/approved`
      );
  
      onValue(approvedRef, (approvedSnapshot) => {
        const approvedList = approvedSnapshot.val() || {};
  
        // 🛠 Kullanıcının `approved` listesinde olup olmadığını kontrol et
        const isApproved = Object.keys(approvedList).includes(companyName);
  
        if (!isApproved) {
          alert("You don't have permission to join this event.");
          return;
        }
  
        // 🔥 Lig ise MyLeagues, Turnuva ise MyTournaments klasörüne ekle
        const userRefPath = eventType === 'Tournament'
          ? `users/${user.uid}/MyTournaments/${tournament.tournamentId}`
          : `users/${user.uid}/MyLeagues/${tournament.tournamentId}`;
  
        // 🔥 Katılımcıyı turnuvanın `participants` kısmına da ekle
        const participantsRef = ref(
          database, 
          `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/${eventType}s/${tournament.tournamentId}/participants/${user.uid}`
        );
  
        const participantData = {
          id: user.uid,
          email: user.email,
          companyName: companyName,
          eventName: tournament.tournamentName,
          joinedAt: new Date().toISOString()
        };
  
        // 🔥 Sadece `tournamentId: tournamentId` veya `leagueId: leagueId` şeklinde kaydet
        const leagueOrTournamentId = tournament.tournamentId;
  
        Promise.all([
          set(ref(database, userRefPath), leagueOrTournamentId),
          set(participantsRef, participantData)
        ])
          .then(() => {
            alert(`${eventType} başarıyla kaydedildi!`);
            setJoined(true);
          })
          .catch((error) => {
            console.error('Hata:', error.message);
          });
  
      }, { onlyOnce: true });
  
    }, { onlyOnce: true });
  };
  

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.adminPanel}>
          <Text style={styles.adminTitle}>Approve a User</Text>
          <TextInput
            style={styles.input}
            placeholder="User ID to Approve"
            value={approveUser}
            onChangeText={setApproveUser}
            placeholderTextColor="#fff"
          />
          <TouchableOpacity style={styles.approveButton} onPress={handleApproveUser}>
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

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
  adminPanel: {
    marginTop: 10,
    backgroundColor: '#1c1c1c',
    padding: 10,
    borderRadius: 5,
  },
  adminTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  approveButton: {
    backgroundColor: '#e67e22',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  
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
        left:8,
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