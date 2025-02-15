import React, { useEffect, useState,useRef  } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity,ScrollView, Modal,Alert,Animated  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, get } from "firebase/database";

const MatchDetails = ({ route }) => {
    const {
        matchId,
        user1,
        user2,
        user1Id,
        user2Id,
        team1Score,
        team2Score,
        roundNumber,
        startDate, // **Turnuvanın başlangıç tarihini aldık**
      } = route.params;
  const storage = getStorage();
  const getRoundDelay = (round) => 5 + (round - 1) * 30; 
  const [userId, setUserId] = useState(null);
  const [matchUser1Id, setMatchUser1Id] = useState(null);
  const [matchUser2Id, setMatchUser2Id] = useState(null);
  const [isPlayerAuthorized, setIsPlayerAuthorized] = useState(false);
  const [spamPhotos, setSpamPhotos] = useState([]);
  const [scorePhotos, setScorePhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(user1);
  const [userTeam, setUserTeam] = useState(null);
  const [formation, setFormation] = useState("");
  
  const fetchUserTeam = async (userId) => {
      try {
          const db = getDatabase();
          const teamRef = dbRef(db, `users/${userId}/MyTeam`);
          const snapshot = await get(teamRef);
  
          if (snapshot.exists()) {
              const teamData = snapshot.val();
              setUserTeam(teamData.Players || {});
              setFormation(teamData.formation || "4-4-2"); // Varsayılan formasyon
              console.log("📌 Kullanıcı Takımı:", teamData);
          } else {
              console.warn("❌ Kullanıcı takımı bulunamadı!");
          }
      } catch (error) {
          console.error("❌ Kullanıcı takım bilgileri alınırken hata oluştu:", error);
      }
  };
  
  // 📌 Component yüklendiğinde kullanıcı takımını çek
  useEffect(() => {
      if (userId) {
          fetchUserTeam(userId);
      }
  }, [userId]);
  
  const [opponentTeam, setOpponentTeam] = useState(null);
  const [opponentFormation, setOpponentFormation] = useState("");
  
  const fetchOpponentTeam = async (opponentId) => {
      try {
          const db = getDatabase();
          const teamRef = dbRef(db, `users/${opponentId}/MyTeam`);
          const snapshot = await get(teamRef);
  
          if (snapshot.exists()) {
              const teamData = snapshot.val();
              console.log(`🎯 Rakip Takım (${opponentId}):`, teamData);
  
              setOpponentTeam(teamData.Players || {}); // Oyuncular
              setOpponentFormation(teamData.formation || "4-4-2"); // Formasyon
          } else {
              console.warn(`❌ Rakip takım (${opponentId}) bulunamadı!`);
          }
      } catch (error) {
          console.error("❌ Rakip takım bilgileri alınırken hata oluştu:", error);
      }
  };
  
  // 🚀 Kullanımı:
  useEffect(() => {
      if (selectedTeam === user1) {
          fetchOpponentTeam(user1Id);
      } else {
          fetchOpponentTeam(user2Id);
      }
  }, [selectedTeam]);
  

useEffect(() => {
  if (user1Id) {
      fetchOpponentTeam(user1Id);
  }
  if (user2Id) {
      fetchOpponentTeam(user2Id);
  }
}, [user1Id, user2Id]);


  useEffect(() => {
    const auth = getAuth();
    setUserId(auth.currentUser?.uid);
  }, []);

  const teamColors = {
    [user1]: "#00003B", // Mavi (User1)
    [user2]: "#8B0000", // Kırmızı (User2)
  };


  const teamPlayers = {
    [user1]: [
      { id: 1, name: "GK", top: 80, left: 43 },  // Kaleci
      { id: 2, name: "RB", top: 55, left: 83 },  // Sağ Bek
      { id: 3, name: "RCB", top: 65, left: 58 }, // Sağ Stoper
      { id: 4, name: "LCB", top: 65, left: 28 }, // Sol Stoper
      { id: 5, name: "LB", top: 55, left: 3 },   // Sol Bek
      { id: 6, name: "CDM", top: 50, left: 43 }, // Ön Libero
      { id: 7, name: "RCM", top: 35, left: 58 }, // Sağ Merkez Orta Saha
      { id: 8, name: "LCM", top: 35, left: 28 }, // Sol Merkez Orta Saha
      { id: 9, name: "RW", top: 20, left: 73 },  // Sağ Kanat
      { id: 10, name: "ST", top: 15, left: 43 }, // Forvet
      { id: 11, name: "LW", top: 20, left: 13 }, // Sol Kanat
    ],
    [user2]: [
      { id: 1, name: "GK", top: 80, left: 43 },  // Kaleci
      { id: 2, name: "RB", top: 55, left: 83 },  // Sağ Bek
      { id: 3, name: "RCB", top: 65, left: 58 }, // Sağ Stoper
      { id: 4, name: "LCB", top: 65, left: 28 }, // Sol Stoper
      { id: 5, name: "LB", top: 55, left: 3 },   // Sol Bek
      { id: 6, name: "CDM", top: 50, left: 43 }, // Ön Libero
      { id: 7, name: "RCM", top: 35, left: 58 }, // Sağ Merkez Orta Saha
      { id: 8, name: "LCM", top: 35, left: 28 }, // Sol Merkez Orta Saha
      { id: 9, name: "RW", top: 20, left: 73 },  // Sağ Kanat
      { id: 10, name: "ST", top: 15, left: 43 }, // Forvet
      { id: 11, name: "LW", top: 20, left: 13 }, // Sol Kanat
    ],
  };


  const formations = {
    "4-4-2": [
        { position: "GK", top: 80, left: 43 },
        { position: "RB", top: 55, left: 83 },
        { position: "RCB", top: 65, left: 58 },
        { position: "LCB", top: 65, left: 28 },
        { position: "LB", top: 55, left: 3 },
        { position: "RM", top: 40, left: 78 },
        { position: "RCM", top: 50, left: 58 },
        { position: "LCM", top: 50, left: 28 },
        { position: "LM", top: 40, left: 8 },
        { position: "ST", top: 20, left: 55 },
        { position: "ST", top: 20, left: 30 },
    ],
    "4-3-3": [
        { position: "GK", top: 80, left: 43 },
        { position: "RB", top: 55, left: 83 },
        { position: "RCB", top: 65, left: 58 },
        { position: "LCB", top: 65, left: 28 },
        { position: "LB", top: 55, left: 3 },
        { position: "CDM", top: 50, left: 43 },
        { position: "RCM", top: 40, left: 58 },
        { position: "LCM", top: 40, left: 28 },
        { position: "RW", top: 20, left: 75 },
        { position: "ST", top: 15, left: 43 },
        { position: "LW", top: 20, left: 10 },
    ],
    "3-5-2": [
        { position: "GK", top: 80, left: 43 },
        { position: "RCB", top: 60, left: 65 },
        { position: "CB", top: 60, left: 43 },
        { position: "LCB", top: 60, left: 25 },
        { position: "RWB", top: 50, left: 85 },
        { position: "LWB", top: 50, left: 5 },
        { position: "RCM", top: 35, left: 66 },
        { position: "CDM", top: 40, left: 43 },
        { position: "LCM", top: 35, left: 20 },
        { position: "ST", top: 15, left: 55 },
        { position: "ST", top: 15, left: 30 },
    ],
};



  const [user1ProfileImage, setUser1ProfileImage] = useState(null);
  const [user2ProfileImage, setUser2ProfileImage] = useState(null);
  
  const fetchProfileImages = async () => {
      try {
          const db = getDatabase();
          
          // User 1 profil fotoğrafını al
          const user1Ref = dbRef(db, `users/${user1Id}/personalInfo/profileImage`);
          const user1Snapshot = await get(user1Ref);
          if (user1Snapshot.exists()) {
              setUser1ProfileImage(user1Snapshot.val());
          } else {
              console.warn(`❌ Kullanıcı ${user1} için profil fotoğrafı bulunamadı!`);
          }
  
          // User 2 profil fotoğrafını al
          const user2Ref = dbRef(db, `users/${user2Id}/personalInfo/profileImage`);
          const user2Snapshot = await get(user2Ref);
          if (user2Snapshot.exists()) {
              setUser2ProfileImage(user2Snapshot.val());
          } else {
              console.warn(`❌ Kullanıcı ${user2} için profil fotoğrafı bulunamadı!`);
          }
      } catch (error) {
          console.error("❌ Profil fotoğrafları alınırken hata oluştu:", error);
      }
  };
  
  // 📌 Component yüklendiğinde profilleri çek
  useEffect(() => {
      fetchProfileImages();
  }, [user1Id, user2Id]);
  

  useEffect(() => {
    if (route.params) {
      console.log("📌 Gelen Route Params:", route.params);
      setMatchUser1Id(route.params.user1Id);
      setMatchUser2Id(route.params.user2Id);
    }
  }, [route.params]);
  
  useEffect(() => {
    if (userId && matchUser1Id && matchUser2Id) {
      console.log(`🆔 Kullanıcı ID: ${userId}, User1 ID: ${matchUser1Id}, User2 ID: ${matchUser2Id}`);
      setIsPlayerAuthorized(userId === matchUser1Id || userId === matchUser2Id);
    }
  }, [userId, matchUser1Id, matchUser2Id]);
  
  

  

  // 📌 Turnuva Başlangıç Tarihini Parse Et
  const parseStartDate = (startDateString) => {
      if (!startDateString) {
          console.error("⛔ HATA: startDate parametresi eksik!");
          return null;
      }

      console.log("📌 Gelen Start Date:", startDateString); // DEBUG

      try {
          const [datePart, timePart] = startDateString.split(" ");
          if (!datePart || !timePart) throw new Error("Geçersiz tarih formatı!");

          const [day, month, year] = datePart.split("/").map(Number);
          const [hour, minute] = timePart.split(":").map(Number);

          return new Date(year, month - 1, day, hour, minute);
      } catch (error) {
          console.error("⛔ Tarih formatında hata:", error.message);
          return null;
      }
  };

  const tournamentStartTime = parseStartDate(startDate);
  console.log("📌 Turnuva Başlangıç Tarihi (Parsed):", tournamentStartTime);

  if (!tournamentStartTime) {
      console.error("❌ Turnuva başlangıç tarihi hesaplanamadı!");
  }

  // 📌 Maçın Gerçek Başlangıç Saatini Hesapla
  const matchStartTime = new Date(tournamentStartTime?.getTime() ?? Date.now());
  matchStartTime.setMinutes(matchStartTime.getMinutes() + getRoundDelay(roundNumber));

  console.log("📌 Maç Başlangıç Zamanı:", matchStartTime);

  // 📌 Maç Bitiş Zamanı (Maç 20 dk sürecek)
  const matchEndTime = new Date(matchStartTime.getTime());
  matchEndTime.setMinutes(matchStartTime.getMinutes() + 20);

  // 🕒 State'ler
  const [timeRemaining, setTimeRemaining] = useState("");
  const [matchTime, setMatchTime] = useState(0);
  const [matchStatus, setMatchStatus] = useState("");

  useEffect(() => {
      const updateMatchTimer = () => {
          const now = new Date();

          if (now < matchStartTime) {
              // 📌 Maç başlamadıysa -> "Starts in Xm Ys"
              const diffMs = matchStartTime - now;
              const minutes = Math.floor(diffMs / 60000);
              const seconds = Math.floor((diffMs % 60000) / 1000);
              setTimeRemaining(`${minutes}m ${seconds}s`);
              setMatchStatus(`${minutes}m ${seconds}s`);
          } else if (now >= matchStartTime && now < matchEndTime) {
              // 📌 Maç başladıysa -> "Live: Xm"
              const elapsedMs = now - matchStartTime;
              const elapsedRealMinutes = elapsedMs / 60000;
              const matchGameMinutes = Math.min(Math.floor(elapsedRealMinutes * 4.5), 90); // 1 gerçek dakika = 4.5 oyun dakikası
              setMatchTime(matchGameMinutes);
              setMatchStatus(`${matchGameMinutes}'`);
          } else {
              // 📌 Maç bittiyse -> "ENDED"
              setMatchStatus("Match Finished");
          }
      };

      updateMatchTimer();
      const interval = setInterval(updateMatchTimer, 1000); // Her saniye güncelle

      return () => clearInterval(interval);
  }, []);


  const getCompanyName = async (userId) => {
    try {
        const db = getDatabase();
        const userRef = dbRef(db, `users/${userId}/zzzCardInformation/companyName/companyName`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.warn("⚠️ Kullanıcı için companyName bulunamadı!");
            return "Unknown";
        }
    } catch (error) {
        console.error("❌ companyName alınırken hata oluştu:", error);
        return "Unknown";
    }
};
 
  // 📌 Animasyon değerleri (Fade ve Slide için)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
const animatePlayers = () => {
  fadeAnim.setValue(0);
  slideAnim.setValue(20);
  
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, 
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }),
  ]).start();
};

// 📌 Takım değiştiğinde animasyonu tetikle
useEffect(() => {
  animatePlayers();
}, [selectedTeam]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      setIsPlayerAuthorized(currentUser.uid === user1Id || currentUser.uid === user2Id);
    }
  }, []);

  useEffect(() => {
    if (matchId) {
      loadPhotos();
    }
  }, [matchId]);

  
  
  const loadPhotos = async () => {
    try {
        const spamFolder = `TournamentPhotos/${user1Id}-${user2Id}/spam/`;
        const scoresFolder = `TournamentPhotos/${user1Id}-${user2Id}/scores/`;

        const spamListRef = storageRef(storage, spamFolder);
        const scoresListRef = storageRef(storage, scoresFolder);

        const spamResult = await listAll(spamListRef);
        const scoresResult = await listAll(scoresListRef);

        const spamPhotosData = await Promise.all(
            spamResult.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const fileName = item.name; // 📌 Dosya adı doğrudan alınıyor
                const username = fileName.split('-')[0]; // 📌 `Muhammet-123123123.jpg` formatını ayrıştırıyor
                const borderColor = getUserBorderColor(username);
                return { url, username, borderColor };
            })
        );

        const scorePhotosData = await Promise.all(
            scoresResult.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const fileName = item.name;
                const username = fileName.split('-')[0]; 
                const borderColor = getUserBorderColor(username);
                return { url, username, borderColor };
            })
        );

        setSpamPhotos(spamPhotosData);
        setScorePhotos(scorePhotosData);

        console.log("📸 Spam Photos:", spamPhotosData);
        console.log("📸 Score Photos:", scorePhotosData);
    } catch (error) {
        console.error('❌ Fotoğraflar yüklenirken hata oluştu:', error);
    }
};


const getUserBorderColor = (username) => {
    if (username === user1) return '#00003B'; // **Koyu Mavi (User1)**
    if (username === user2) return '#8B0000'; // **Koyu Kırmızı (User2)**
    return '#fff'; // **Varsayılan Renk (Beyaz)**
};


const [isScoreUploadAllowed, setIsScoreUploadAllowed] = useState(false);

useEffect(() => {
    const updateMatchStatus = () => {
        const now = new Date();

        if (now < matchStartTime) {
            
        } else if (now >= matchStartTime && now < matchEndTime) {
            
        } else {
            setMatchStatus("Match Finished");

            // **Score Upload Process Süresi** (Maç bittikten sonra 5 dakika)
            const scoreUploadEndTime = new Date(matchEndTime.getTime() + 5 * 60 * 1000);
            setIsScoreUploadAllowed(now < scoreUploadEndTime);
        }
    };

    updateMatchStatus();
    const interval = setInterval(updateMatchStatus, 1000);

    return () => clearInterval(interval);
}, []);

const takePhotoAndUpload = async (folder) => {
    if (!isPlayerAuthorized) {
        Alert.alert("Unauthorized", "You can only upload photos for your own match.");
        return;
    }

    if (folder === 'scores' && !isScoreUploadAllowed) {
        Alert.alert("Upload Disabled", "Score upload time has ended.");
        return;
    }

    try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (result.canceled) {
            console.log('Kullanıcı fotoğraf çekmedi.');
            return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'User is not logged in.');
            return;
        }

        const companyName = await getCompanyName(currentUser.uid);
        const timestamp = Date.now();
        const photoUri = result.assets[0].uri;
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileName = `${companyName}-${timestamp}.jpg`;
        const filePath = `TournamentPhotos/${user1Id}-${user2Id}/${folder}/${fileName}`;
        const storageReference = storageRef(storage, filePath);

        await uploadBytes(storageReference, blob);
        const downloadURL = await getDownloadURL(storageReference);
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        }, []);
        console.log('📸 Fotoğraf başarıyla yüklendi:', downloadURL);
        Alert.alert('Success', 'Photo uploaded successfully!');

        const newPhoto = { url: downloadURL, username: companyName };

        if (folder === 'spam') {
            setSpamPhotos((prev) => [...prev, newPhoto]);
        } else {
            setScorePhotos((prev) => [...prev, newPhoto]);
        }
    } catch (error) {
        console.error('❌ Fotoğraf yükleme hatası:', error);
        Alert.alert('Error', error.message || 'Failed to upload the photo.');
    }
};




  const tabs = ['General', 'Lineup', 'Stats', 'Photos'];
  const [selectedTab, setSelectedTab] = useState('General');

  return (
    <View style={styles.container}>
      {/* Üst Kısım: Maç Başlığı ve Skor */}
      <View style={styles.header}>
        
      <Text style={styles.competition}>TORIVALS TOURNAMENT</Text>
        <Text style={styles.matchDate}>{matchStartTime.toLocaleString()}</Text>


        <View style={styles.teamSection}>
  <View style={styles.teamContainer}>
    <Image source={{ uri: user1ProfileImage }} style={styles.teamLogo} />
    <Text style={styles.teamName}>{user1}</Text>
  </View>

  <View style={styles.scoreContainer}>
    <Text style={styles.score}>{team1Score}</Text>
    <Text style={styles.vs}>-</Text>
    <Text style={styles.score}>{team2Score}</Text>
  </View>

  <View style={styles.teamContainer}>
    <Image source={{ uri: user2ProfileImage }} style={styles.teamLogo} />
    <Text style={styles.teamName}>{user2}</Text>
  </View>
</View>

        <Text style={styles.matchStatus}>{matchStatus}</Text>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.tabButtonSelected]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* İçerik Alanı */}
      <ScrollView style={styles.content}>
        {selectedTab === 'General' && (
          <View>
            <Text style={styles.sectionTitle}>Match Summary</Text>
            <Text style={styles.matchInfo}>{user1} defeated {user2} with a score of {team1Score}-{team2Score}.</Text>
          </View>
        )}

{selectedTab === 'Lineup' && (

<View style={styles.container}>
<View style={styles.teamSelection}>
        <TouchableOpacity
          style={[styles.teamTab, selectedTeam === user1 && { backgroundColor: teamColors[user1] }]}
          onPress={() => setSelectedTeam(user1)}
        >
          <Text style={[styles.teamName, selectedTeam === user1 && styles.selectedTeamText]}>{user1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.teamTab, selectedTeam === user2 && { backgroundColor: teamColors[user2] }]}
          onPress={() => setSelectedTeam(user2)}
        >
          <Text style={[styles.teamName, selectedTeam === user2 && styles.selectedTeamText]}>{user2}</Text>
        </TouchableOpacity>
      </View>

      {/* 📌 Saha Görseli ve Oyuncular */}
      <View style={styles.lineupContainer}>
    <Image source={require("./assets/Pitch.png")} style={styles.lineupImage} />

    {/* 📌 Seçili takımın oyuncularını formasyona göre diziyoruz */}
    {opponentTeam &&
        formations[opponentFormation]?.map((pos, index) => {
            // Kullanıcının oyuncularını sırayla pozisyonlara atama
            const playerKey = `Player${index + 1}`;
            const playerData = opponentTeam[playerKey];

            if (!playerData) return null;

            return (
                <Animated.View
                    key={index}
                    style={[
                        styles.playerPosition,
                        {
                            top: `${pos.top}%`,
                            left: `${pos.left}%`,
                            borderColor: teamColors[selectedTeam],
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Image
                        source={{ uri: playerData.playerImage }}
                        style={styles.playerImage}
                    />
                    <Text style={styles.playerText}>{playerData.playerName}</Text>
                </Animated.View>
            );
        })}
</View>

</View>

    )}

{selectedTab === 'Stats' && (
  <View style={styles.statsContainer}>
    <Text style={styles.sectionTitle}>Match Stats</Text>

    {[
      { player1: 66, player2: 34, max: 100, label: "Topla Oynama (%)" },
      { player1: 14, player2: 7, max: 21, label: "Toplam Şut" },
      { player1: 3, player2: 3, max: 6, label: "İsabetli Şut" },
      { player1: 7, player2: 3, max: 10, label: "İsabetsiz Şut" },
      { player1: 0.80, player2: 1.65, max: 2, label: "Gol Beklentisi (xG)" },
      { player1: 24, player2: 15, max: 30, label: "Ceza Sahasında Buluşma" },
    ].map((stat, index) => {
      // Yüzdelik hesapla (Örn: 7 / 21 * 100)
      const player1Percentage = (stat.player1 / stat.max) * 100;
      const player2Percentage = (stat.player2 / stat.max) * 100;

      return (
        <View key={index} style={styles.statRow}>
          <Text style={styles.statLabel}>{stat.label}</Text>

          <View style={styles.barContainer}>
            <Animated.View style={[styles.statBar, styles.player1Bar, { width: `${player1Percentage}%` }]} />
            <Animated.View style={[styles.statBar, styles.player2Bar, { width: `${player2Percentage}%` }]} />
          </View>

          <View style={styles.statNumbers}>
            <Text style={styles.player1Stat}>{stat.player1}</Text>
            <Text style={styles.player2Stat}>{stat.player2}</Text>
          </View>
        </View>
      );
    })}
  </View>
)}


            {selectedTab === 'Photos' && (
                    <View>
     <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedPhoto?.url }} style={styles.fullImage} />
          <Text style={styles.photoDescription}>{selectedPhoto?.description}</Text>
        </View>
      </Modal>

      <ScrollView>
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Spam Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {spamPhotos.map((photo, index) => (
        <View key={index} style={styles.photoContainer}>
            <TouchableOpacity onPress={() => { setSelectedPhoto(photo); setIsModalVisible(true); }}>
                <Image source={{ uri: photo.url }} style={[styles.uploadedPhoto, { borderColor: photo.borderColor }]} />
            </TouchableOpacity>
           
        </View>
    ))}
    {isPlayerAuthorized && (
        <TouchableOpacity style={styles.uploadCard} onPress={() => takePhotoAndUpload('spam')}>
            <Text style={styles.uploadCardText}>+</Text>
        </TouchableOpacity>
    )}
</ScrollView>


        </View>

        <View style={styles.photoSection}>
    <Text style={styles.sectionTitle}>Score Photos</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {scorePhotos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
                <TouchableOpacity onPress={() => { setSelectedPhoto(photo); setIsModalVisible(true); }}>
                    <Image source={{ uri: photo.url }} style={[styles.uploadedPhoto, { borderColor: photo.borderColor }]} />
                </TouchableOpacity>
            </View>
        ))}
        {isPlayerAuthorized && isScoreUploadAllowed && (
            <TouchableOpacity style={styles.uploadCard} onPress={() => takePhotoAndUpload('scores')}>
                <Text style={styles.uploadCardText}>+</Text>
            </TouchableOpacity>
        )}
    </ScrollView>
</View>

      </ScrollView>

                    </View>

            )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({


  statsContainer: {
    padding: 15,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  
  statRow: {
    marginVertical: 10,
  },
  
  statLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  
  statBar: {
    height: '100%',
  },
  
  player1Bar: {
    backgroundColor: '#00003B', // Mavi
  },
  
  player2Bar: {
    backgroundColor: '#8B0000', // Kırmızı
  },
  
  statNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  
  player1Stat: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  player2Stat: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
 
    usernameText: {
        color: '#FFCC00',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },
    
    statValue: {
      color: '#FFF',
      fontSize: 16,
      width: 40,
      textAlign: 'center',
    },
   
    bar: {
      height: '100%',
    },
    playerPosition: {
      position: "absolute",
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#000", // 🔹 Daire rengi siyah yapıldı
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#ffcc00", // 🔹 Çerçeve rengi sarı
      transform: [{ translateX: -22 }, { translateY: -22 }],
      shadowColor: "#ffcc00", // 🔹 Shadow frame ile aynı renk
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      elevation: 6, // 🔹 Android için shadow efekti
  },
  playerImage: {
      width: 55,
      height: 55,
      borderRadius: 22.5,
  },
  playerText: {
      color: "#FFF", // 🔹 Oyuncu isimleri beyaz yapıldı
      fontWeight: "bold",
      fontSize: 10,
      textAlign: "center",
      marginTop: 5,
      textShadowColor: "#ffcc00", // 🔹 Yazının arkasına gölge eklendi
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
  },
    
   
    
    container: { flex: 1, backgroundColor: '#000', padding: 15 },
    photoSection: { marginBottom: 20, padding: 10, borderRadius: 10, backgroundColor: "#121212" },
    uploadedPhoto: { width: 100, height: 100, margin: 5, borderRadius: 10, borderWidth: 1, borderColor: "#ffcc00" },
    uploadCard: { width: 100, height: 100, borderRadius: 10, backgroundColor: "#121212", alignItems: "center",borderColor: "#fff",borderWidth: 1, justifyContent: "center", margin: 5 },
    uploadCardText: { fontSize: 36, color: "#fff" },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '90%', height: '60%', resizeMode: 'contain', borderRadius: 10 },
    closeText: { fontSize: 24, color: 'white' },
    description: { fontSize: 14, color: "#ccc", marginBottom: 10, textAlign: "center" },

    closeModal: { position: 'absolute', top: 40, right: 20 },
    photoDescription: { color: 'white', marginTop: 10, textAlign: 'center', fontSize: 16 },
    lineupContainer: {
    alignItems: 'center',
    justifyContent: 'center', 
  },
  teamSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 10,
  },
  teamTab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  selectedTeamTab: {
    backgroundColor: "#ffcc00",
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  teamName: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
  },
  selectedTeamText: {
    color: "#fff",
  },

  // 📌 Saha Görseli ve Oyuncular
  
  lineupImage: {
    width: "150%",
    height: 350,
    resizeMode: "contain",
  },
  

      photoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 110,
      },
    
    matchDate: { color: '#aaa', fontSize: 12, marginBottom: 10 },
    matchStatus: { color: '#FFCC00', fontSize: 16, marginTop: 10 },

      uploadButton: {
        backgroundColor: "#ffcc00",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: "center",
        alignSelf: "center",
        marginTop: 10,
        shadowColor: "#ffcc00",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
      },
      uploadButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
      },

  header: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  competition: {
    color: '#FFF',
    fontSize: 14,
    textTransform: 'uppercase',
  },

  
  teamSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  score: {
    fontSize: 32,
    color: '#FFF',
    marginHorizontal: 5,
  },
  vs: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFF',
    marginHorizontal: 5,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#121212',
  },
  tabButtonSelected: {
    backgroundColor: '#FFF',
  },
  tabText: {
    color: '#FFF',
    fontSize: 14,
  },
  tabTextSelected: {
    color: '#121212',
    fontWeight: 'bold',
  },
  content: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  matchInfo: {
    color: '#aaa',
    fontSize: 14,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
 
  rating: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default MatchDetails;
