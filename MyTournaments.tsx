import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import { Video } from 'expo-av';

const MyTournaments = () => {
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('My Tournaments');
  const [myEarnings, setMyEarnings] = useState([]);
  const [totalPrize, setTotalPrize] = useState(0);
  const [totalGP, setTotalGP] = useState(0);
  const navigation = useNavigation();

  const imageMap = {
    'turnuva1.png': require('./assets/titleturnuva1.png'),
    'turnuva2.png': require('./assets/titleturnuva2.png'),
    'turnuva3.png': require('./assets/titleturnuva3.png'),
    'turnuva4.png': require('./assets/titleturnuva4.png'),
    'turnuva5.png': require('./assets/titleturnuva5.png'),
    'turnuva6.png': require('./assets/titleturnuva6.png'),
    'turnuva7.png': require('./assets/titleturnuva7.png'),
  };

  useEffect(() => {
    fetchMyTournaments();
    fetchMyEarnings();
  }, []);

  const fetchMyEarnings = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('User is not logged in.');
      return;
    }

    const tournamentsRef = ref(database, `users/${user.uid}/tournaments`);
    onValue(tournamentsRef, (snapshot) => {
      const tournamentsData = snapshot.val() || {};
      const earningsArray = Object.keys(tournamentsData).map((id) => ({
        id,
        ...tournamentsData[id],
      }));
      setMyEarnings(earningsArray);

      // Toplam ödülleri hesapla
      const totalPrizeCalc = earningsArray.reduce(
        (sum, item) => sum + (item.prize || 0),
        0
      );
      const totalGPCalc = earningsArray.reduce(
        (sum, item) => sum + (item.xp || 0),
        0
      );

      setTotalPrize(totalPrizeCalc);
      setTotalGP(totalGPCalc);
    });
  };

  const fetchMyTournaments = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Kullanıcı oturumu açık değil.');
      return;
    }

    const allTournamentsRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments`
    );

    // Admin ise tüm turnuvaları göster
    if (user.email === 'admin@gmail.com') {
      onValue(allTournamentsRef, (allSnapshot) => {
        const allTournaments = allSnapshot.val() || {};
        setMyTournaments(Object.values(allTournaments));
        setLoading(false);
      });
    } else {
      // Normal kullanıcı ise, sadece kendi katıldığı turnuvaları göster
      const myTournamentsRef = ref(database, `users/${user.uid}/MyTournaments`);

      onValue(myTournamentsRef, (snapshot) => {
        const tournamentIds = snapshot.val() || {};
        const tournamentIdList = Object.values(tournamentIds);

        onValue(allTournamentsRef, (allSnapshot) => {
          const allTournaments = allSnapshot.val() || {};
          const filteredTournaments = Object.values(allTournaments).filter(
            (tournament) => tournamentIdList.includes(tournament.tournamentId)
          );
          setMyTournaments(filteredTournaments);
          setLoading(false);
        });
      });
    }
  };

  // -- A: My Tournaments için her bir kartı render edecek fonksiyon
  const renderTournamentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TournamentDetails', { tournament: item })}
    >
      <Video
        source={require('./assets/PuanDurumuBG1.mp4')}
        style={styles.backgroundVideo3}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />
      <Image
        source={imageMap[item.imageUrl] || require('./assets/deniz.jpg')}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.tournamentName}</Text>
        <Text style={styles.date}>Start Date: {item.startDate}</Text>
        <Text style={styles.content}>Rule: {item.content}</Text>
      </View>
    </TouchableOpacity>
  );

  // -- B: My Earnings için her bir kartı render edecek fonksiyon
  const renderEarningItem = ({ item }) => (
    <View style={styles.card}>
      <Video
        source={require('./assets/PuanDurumuBG1.mp4')}
        style={styles.backgroundVideo3}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />
     
      <View style={styles.info}>
        {/* Turnuva kimliği, ödül ve xp gösterimi */}
        <Text style={styles.title}>{item.TournamentName}</Text>
        <Text style={styles.date}>Prize: {item.prize}₺</Text>
        <Text style={styles.content}>GP: {item.xp}</Text>
      </View>
    </View>
  );

  // Sekmelerin üst kısımda gösterilmesi
  const renderOptions = () => (
    <View style={styles.horizontalOptionsContainer}>
      {['My Tournaments', 'My Earnings', 'My Cups'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.horizontalOption,
            selectedOption === item && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption(item)}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === item && styles.selectedOptionText,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Seçilen sekmeye göre içerik göstermek
  const renderContent = () => {
    if (loading) {
      return <Text style={styles.loading}>Loading...</Text>;
    }

    switch (selectedOption) {
      case 'My Earnings':
        return (
          <FlatList
            data={myEarnings}
            keyExtractor={(item) => item.id}
            renderItem={renderEarningItem}
          />
        );
      case 'My Cups':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.noData}>Kupalarınız burada listelenecek.</Text>
          </View>
        );
      default:
        return (
          <FlatList
            data={myTournaments}
            keyExtractor={(item) => item.tournamentId}
            renderItem={renderTournamentItem}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Kullanıcının total prize & gp bilgileri */}
      <View style={styles.totalContainer}>
        <View style={styles.totalBox}>
          <Text style={styles.totalTitle}>Total Prize</Text>
          <Text style={styles.totalValue}>{totalPrize}₺</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalTitle}>Total GP</Text>
          <Text style={styles.totalValue}>{totalGP}</Text>
        </View>
      </View>

      {/* Sekme (My Tournaments, My Earnings, My Cups) */}
      {renderOptions()}

      {/* İçerik */}
      <ScrollView style={{ flex: 1 }}>{renderContent()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  totalBox: {
    alignItems: 'center',
  },
  totalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  // Sekme butonları
  horizontalOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  horizontalOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
  },
  selectedOption: {
    backgroundColor: '#00343f',
  },
  optionText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontSize: 12,
  },
  // Kart stili
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  content: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  loading: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Arka plan videosu
  backgroundVideo3: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 10,
    width: '106%',
    height: '135%',
    opacity: 1,
  },
});

export default MyTournaments;
