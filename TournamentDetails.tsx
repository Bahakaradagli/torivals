import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue,get, update } from 'firebase/database';
import { database } from './firebase'; // Firebase baglantı dosyanız
import { Video } from 'expo-av';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes,listAll,deleteObject , getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';



import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';

const TournamentDetails = ({ route }) => {
  const { tournament } = route.params;
  const tabs = ['General', 'Fixtures', 'Teams', 'Chat'];
  const [selectedTab, setSelectedTab] = useState('General');
  const [userType, setUserType] = useState('');
  const [subsStatus, setSubsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamsData, setTeamsData] = useState([]);
  const [isCompany, setIsCompany] = useState(false); 
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bracket, setBracket] = useState([
    { round: "1. Tur", matches: [] }, 
    { round: "2. Tur", matches: [] }, // 2. tur için alan oluşturduk
  ]);
  const navigation = useNavigation();
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userId = getAuth().currentUser?.uid; // Şu anki kullanıcı ID'si
  const [roundsData, setRoundsData] = useState({});
  const [selectedRoundKey, setSelectedRoundKey] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState(null);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'December'
  ];

  const [photoUrls, setPhotoUrls] = useState([]);
  const [participantsData, setParticipantsData] = useState({});

  useEffect(() => {
    const participantsRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/participants`
    );
  
    onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const participants = snapshot.val();
        setParticipantsData(participants);
      } else {
        console.log("Katılımcı verisi bulunamadı.");
        setParticipantsData({});
      }
    });
  
  }, [tournament.tournamentId]);
  


  const enrichMatchesWithIds = (matches) => {
    return matches.map((match) => {
      const team1Id = Object.keys(participantsData).find(
        (key) => participantsData[key].companyName === match.team1
      );
  
      const team2Id = Object.keys(participantsData).find(
        (key) => participantsData[key].companyName === match.team2
      );
  
      return {
        ...match,
        team1Id: team1Id || null, // Eğer bulunamazsa null döndür
        team2Id: team2Id || null,
      };
    });
  };
  

  const loadPhotos = async (match) => {
    const urls = await fetchPhotosForMatch(match);
    setPhotoUrls(urls);
  };
  
  useEffect(() => {
    if (selectedMatch) {
      loadPhotos(selectedMatch);
    }
  }, [selectedMatch]);

  const showMatchDetails = (match, roundKey) => {
    console.log("📌 Seçilen Maç Bilgisi:", match); // Debugging
    
    const enrichedMatch = {
      ...match,
      team1Id: Object.keys(participantsData).find((key) => participantsData[key].companyName === match.team1),
      team2Id: Object.keys(participantsData).find((key) => participantsData[key].companyName === match.team2),
    };
  
    navigation.navigate('MatchDetails', {
      matchId: enrichedMatch.id,
      user1: enrichedMatch.team1,
      user2: enrichedMatch.team2,
      user1Id: enrichedMatch.team1Id,
      user2Id: enrichedMatch.team2Id,
      team1Score: enrichedMatch.team1Score ?? 0,
      team2Score: enrichedMatch.team2Score ?? 0,
      roundNumber: parseInt(roundKey),
      startDate: tournament.startDate,
    });
  };
  
  
  
  
  
  useEffect(() => {
    if (!tournament || !tournament.startDate) {
      console.log("⚠️ Turnuva veya startDate bilgisi eksik, bekleniyor...");
      return; // Eğer startDate yoksa fonksiyondan çık
    }
  
    try {
      console.log("📌 Gelen Start Date:", tournament.startDate); // Debugging
  
      // Start Date formatı: "31/01/2025 20:00"
      const [datePart, timePart] = tournament.startDate.split(" ");
      
      if (!datePart || !timePart) {
        console.error("⛔ Geçersiz tarih formatı:", tournament.startDate);
        return;
      }
  
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = timePart.split(":");
  
      const startDate = new Date(
        Number(year),
        Number(month) - 1, // JavaScript'te aylar 0'dan başlar
        Number(day),
        Number(hour),
        Number(minute)
      );
  
      console.log("✅ Düzenlenmiş Tarih:", startDate);
  
      // Maçları 5 dakika sonra başlatmak için
      const fiveMinutesAfterStart = new Date(startDate.getTime() + 5 * 60000);
      const now = new Date();
  
      console.log("🔹 Şu An:", now);
      console.log("🔹 5 Dakika Sonrası:", fiveMinutesAfterStart);
  
      if (now >= fiveMinutesAfterStart) {
        console.log("✅ 5 dakika geçti, maçlar başlatılabilir!");
        
      } else {
        console.log("⏳ Maçların başlaması için daha zaman var.");
      }
    } catch (error) {
      console.error("⛔ Tarih formatı hatası:", error.message);
    }
  }, [tournament?.startDate]);
  
  
  // 🏆 **Maçları Başlatma Fonksiyonu**
  const startFirstMatches = () => {
    console.log("📢 İlk maçlar başlatılıyor...");
  
    const matchesRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/1`
    );
  
    update(matchesRef, {
      started: true, // Firebase'de maçların başladığını belirtebiliriz
    })
      .then(() => console.log("✅ İlk maçlar başarıyla başlatıldı!"))
      .catch((err) => console.error("Hata:", err.message));
  };
  
  
  const [companyName, setCompanyName] = useState('Bilinmiyor');

  const pickImageAndUpload = async (match) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to upload photos.');
        return;
      }
  
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log("ImagePicker Result:", result);
  
      // Access the URI from the assets array
      const photoUri = result.assets?.[0]?.uri;
      if (!photoUri) {
        throw new Error("Photo URI is undefined.");
      }
  
      console.log("Photo URI:", photoUri);
  
      // Firebase Storage operations
      const response = await fetch(photoUri);
      if (!response.ok) throw new Error("Failed to fetch the image.");
  
      const blob = await response.blob();
      const storage = getStorage();
      const filePath = `TournamentPhotos/${tournament.tournamentId}/${match.team1}-${match.team2}/${companyName}.jpg`;
      const storageReference = storageRef(storage, filePath);
  
      await uploadBytes(storageReference, blob);
      const downloadURL = await getDownloadURL(storageReference);
      console.log("Uploaded Image URL:", downloadURL);
  
      Alert.alert("Success", "Photo uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload the photo.");
    }
  };
  useEffect(() => {
    console.log(tournament.StartTime+"asdadqfq");
    if (tournamentWinner?.winner) {
      console.log("Kazanan mevcut, fotoğraflar siliniyor..."); // Eklenen debug satırı
      deleteTournamentPhotos(tournament.tournamentId)
        .then(() => console.log('Fotoğraflar silindi'))
        .catch((err) => console.error('Silme işlemi sırasında hata:', err));
    } else {
      console.log("Kazanan mevcut değil."); // Eğer winner yoksa
    }
  }, [tournamentWinner]);
  
  const deleteFolderContents = async (folderPath) => {
    const storage = getStorage();
    const folderRef = storageRef(storage, folderPath);
  
    try {
      // Klasördeki tüm dosyaları ve alt klasörleri listele
      const result = await listAll(folderRef);
  
      // Tüm dosyaları sil
      const fileDeletionPromises = result.items.map((fileRef) => deleteObject(fileRef));
      await Promise.all(fileDeletionPromises);
  
      // Alt klasörleri sil
      const folderDeletionPromises = result.prefixes.map((subFolderRef) =>
        deleteFolderContents(subFolderRef.fullPath)
      );
      await Promise.all(folderDeletionPromises);
  
      console.log(`Klasör başarıyla temizlendi: ${folderPath}`);
    } catch (error) {
      console.error(`Klasör temizlenirken hata oluştu: ${error.message}`);
    }
  };
  
  
  useEffect(() => {
    const chatRef = ref(database, `chats/${tournament.tournamentId}/messages`);
  
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setChatMessages(messagesArray); // Mesajları state'e ekle
      } else {
        console.log("Mesaj bulunamadı");
        setChatMessages([]); // Eğer mesaj yoksa boş bir dizi ekle
      }
    });
  
    return () => unsubscribe(); // Bellek sızıntısını önlemek için
  }, [tournament.tournamentId]);
  


  const sendMessage = () => {
    if (newMessage.trim() === '') {
      Alert.alert("Hata", "Lütfen bir mesaj yazın.");
      return;
    }
  
    const chatRef = ref(database, `chats/${tournament.tournamentId}/messages/${Date.now()}`);
  
    update(chatRef, {
      senderId: userId,
      senderName: companyName || "Bilinmeyen Kullanıcı",
      message: newMessage.trim(),
      timestamp: Date.now(),
    })
      .then(() => {
        setNewMessage('');
        console.log("Mesaj başarıyla gönderildi.");
      })
      .catch((err) => {
        console.error("Mesaj gönderilirken hata oluştu:", err.message);
        Alert.alert("Hata", "Mesaj gönderilemedi.");
      });
  };
  

  const deleteTournamentPhotos = async (tournamentId) => {
    try {
      const storage = getStorage();
      const folderPath = `TournamentPhotos/${tournamentId}/`;
      const listRef = storageRef(storage, folderPath);
  
      console.log(`Silme işlemi başlatıldı: ${folderPath}`); // Debug 1
  
      // Klasördeki tüm dosyaları listele
      const result = await listAll(listRef);
      console.log("Listelenen öğeler:", result); // Debug 2
  
      // Eğer alt klasörler varsa, onları da sil
      for (const folder of result.prefixes) {
        const folderPath = folder.fullPath;
        console.log(`Alt klasör siliniyor: ${folderPath}`); // Debug 3
        await deleteTournamentPhotos(folderPath);
      }
  
      // Dosyaları sil
      const deletePromises = result.items.map((item) => {
        console.log(`Dosya siliniyor: ${item.fullPath}`); // Debug 4
        return deleteObject(item);
      });
      await Promise.all(deletePromises);
  
      console.log(`Klasör başarıyla temizlendi: ${folderPath}`); // Debug 5
    } catch (error) {
      console.error(`Hata: ${error.message}`);
    }
  };
  


  const fetchPhotosForMatch = async (match) => {
    try {
      const storage = getStorage();
      const filePath = `TournamentPhotos/${tournament.tournamentId}/${match.team1}-${match.team2}/`; // Doğru dosya yolu
      const listRef = storageRef(storage, filePath);
  
      const result = await listAll(listRef); // Klasördeki tüm dosyaları listele
      const urls = await Promise.all(result.items.map((item) => getDownloadURL(item))); // URL'leri al
  
      console.log("Fotoğraf URL'leri:", urls);
      return urls; // URL listesini döndür
    } catch (error) {
      console.error("Fotoğraf URL'leri alınırken hata oluştu:", error.message);
      return [];
    }
  };
  
  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}/zzzCardInformation/companyName`);

      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val().companyName);
          setCompanyName(snapshot.val().companyName);
        } else {
          console.log('CompanyName bulunamadı.');
        }
      });
    }
  }, [userId]);
  const [participantsCount, setParticipantsCount] = useState(0);

 
  useEffect(() => {
    const determineWinner = async () => {
      if (!tournamentWinner?.winner) return;
  
      const winnerName = tournamentWinner.winner;
      const winnerId = await getWinnerParticipantId(winnerName, tournament.tournamentId);
  
      if (winnerId) {
        // Kazananın `users` altındaki bilgilerini güncelle
        await addWinnerEarningsToUsers(winnerId, tournament.tournamentId, 1000, 500);
      } else {
        console.error("Kazanan ID bulunamadı.");
      }
    };
  
    determineWinner();
  }, [tournamentWinner]);
  


  const getWinnerParticipantId = async (winnerName, tournamentId) => {
    try {
      const participantsRef = ref(
        database,
        `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournamentId}/participants`
      );
  
      const snapshot = await get(participantsRef);
      if (snapshot.exists()) {
        const participants = snapshot.val();
        for (const [id, participant] of Object.entries(participants)) {
          if (participant.companyName === winnerName) {
            console.log(`Kazanan ID'si bulundu: ${participant.id}`);
            return participant.id; // Kazananın ID'si
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Kazanan ID alınırken hata oluştu:", error.message);
      return null;
    }
  };
  
  

  const addWinnerEarningsToUsers = async (participantId, tournamentId, prizeAmount, xp) => {
    try {
      const userRef = ref(database, `users/${participantId}/tournaments/${tournamentId}`);
  
      // Ödülü ve XP'yi (GP) sayısal olarak hesapla
      const calculatedPrize = parseFloat(
        ((tournament.participantCount * tournament.participationFee * tournament.prizePercentage) / 100).toFixed(2)
      );
      const calculatedXp = parseInt(tournament.firstPlaceGP, 10); // XP (GP) sayısal olacak
  
      await update(userRef, {
        prize: calculatedPrize, // Ödülü number formatında kaydediyoruz
        xp: calculatedXp, // XP (GP) number formatında kaydediliyor
        TournamentName: tournament.tournamentName,
        timestamp: Date.now(),
      });
  
      console.log(`ID: ${participantId} için ödüller başarıyla eklendi. (Ödül: ${calculatedPrize}, GP: ${calculatedXp})`);
    } catch (error) {
      console.error("Ödül eklenirken hata oluştu:", error.message);
    }
  };
  




  useEffect(() => {
    const participantsRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/participants`
    );
    const tournamentt = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/`
    );
    /*onValue(participantsRef, (snapshot) => {
      const participants = snapshot.val();
      const count = participants ? Object.keys(participants).length : 0;
      setParticipantsCount(count);
      console.log('Katılımcı Sayısı:', count); // Katılımcı sayısını logluyoruz
    });*/
    onValue(tournamentt, (snapshot) => {
      const tournamentts = snapshot.val();
      const count = tournamentts ? Object.keys(tournamentts).length : 0;
      setParticipantsCount(tournamentts.participantCount);
      console.log('Katılımcı Sayısı:', tournamentts.participantCount); // Katılımcı sayısını logluyoruz
    });
  }, [tournament.tournamentId]);

  
  useEffect(() => {
    const currentRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/1`
    );
  
    const unsubscribe = onValue(currentRoundRef, (snapshot) => {
      const matches = snapshot.val()?.matches || [];
      const allWinners = matches.every((match) => match.winner);
  
      if (allWinners) {
        console.log("Tüm maçlar tamamlandı, yeni tur oluşturuluyor...");
        moveWinnersToNextRound(1);
      }
    });
  
    return () => unsubscribe();
  }, [tournament.tournamentId]);
  

  
  useEffect(() => {
    const checkFinalWinner = async () => {
      const roundsRef = ref(
        database,
        `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds`
      );
  
      // Tüm turları oku
      onValue(roundsRef, (snapshot) => {
        const rounds = snapshot.val();
        if (rounds) {
          const totalRounds = Object.keys(rounds).length; // Toplam tur sayısı
          const finalRoundKey = Object.keys(rounds)[totalRounds - 1]; // Son turun anahtarı
          const finalRound = rounds[finalRoundKey]; // Son turun verisi
          const finalMatches = finalRound?.matches || []; // Son turdaki maçlar
  
          // Son turda sadece bir maç kaldıysa ve kazanan varsa
          if (finalMatches.length === 1 && finalMatches[0].winner) {
            setTournamentWinner({
              winner: finalMatches[0].winner,
              isFinal: true, // Bu kazananın finalden olduğunu belirtmek için
            });
          } else {
            setTournamentWinner(null); // Henüz kazanan yok
          }
        }
      });
    };
  
    checkFinalWinner();
  }, [tournament.tournamentId]);
  

  useEffect(() => {
    const roundsRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds`
    );



    // Gerçek zamanlı veri okuma
    const unsubscribe = onValue(roundsRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoundsData(snapshot.val());
      } else {
        console.log("Veri bulunamadı.");
      }
    });

    return () => unsubscribe(); // Bellek sızıntısını önlemek için
  }, [tournament.tournamentId]);


  

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const companyRef = ref(database, `companies/${user.uid}`);
      onValue(companyRef, (snapshot) => {
        const companyData = snapshot.val();
        if (companyData) {
          setUserType(companyData.userType);
          setIsCompany(true);
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tournament && tournament.participants) {
      const participants = Object.values(tournament.participants || {});
      const initialTeamsData = participants.map((participant, index) => ({
        id: (index + 1).toString(),
        team: participant?.companyName || `Takım ${index + 1}`,
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        points: 0,
      }));
      setTeamsData(initialTeamsData);
    } else {
      console.error("Participants bilgisi bulunamadı!");
    }
  }, [tournament]);
  
  useEffect(() => {
    const fetchRoundData = (roundIndex) => {
      const roundRef = ref(
        database,
        `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${roundIndex}`
      );
  
      onValue(roundRef, (snapshot) => {
        const roundData = snapshot.val();
        if (roundData && roundData.matches) {
          setBracket((prev) => {
            const updatedBracket = [...prev];
            updatedBracket[roundIndex - 1] = {
              round: `${roundIndex}. Round`,
              matches: roundData.matches,
            };
            return updatedBracket;
          });
        }
      });
    };
  
    fetchRoundData(1); // 1. Tur verisini çek
    fetchRoundData(2); // 2. Tur verisini çek
  }, []);
  

  
  useEffect(() => {
    console.log("🔄 useEffect tetiklendi: participantsCount =", participantsCount, ", teamsData.length =", teamsData.length);
  
    if (participantsCount > 1 && teamsData.length > 0) {
      if (participantsCount === teamsData.length) {
        console.log("✅ Katılımcı sayıları eşleşiyor. İlk tur oluşturulacak...");
        const roundRef = ref(
          database,
          `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/1`
        );
  
        get(roundRef).then((snapshot) => {
          if (!snapshot.exists()) {
            console.log("✅ İlk tur oluşturuluyor...");
            createInitialBracket(teamsData);
          } else {
            console.log("⚠️ 1. Tur zaten mevcut.");
          }
        });
      } else {
        console.log("❌ Katılımcı sayıları eşleşmiyor. İlk tur oluşturulmadı.");
      }
    } else {
      console.log("⛔ participantsCount < 2 veya teamsData boş.");
    }
  }, [participantsCount, teamsData]);
  
  
  
  useEffect(() => {
    const secondRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/2`
    );
  
    onValue(secondRoundRef, (snapshot) => {
      const secondRoundData = snapshot.val();
      if (secondRoundData && secondRoundData.matches) {
        setBracket((prevBracket) => [
          ...prevBracket,
          { round: "2. Round", matches: secondRoundData.matches },
        ]);
      }
    });
  }, []);
  const createInitialBracket = (teams) => {
    if (teams.length < 2) {
      console.log("❌ Katılımcı sayısı yeterli değil. İlk tur oluşturulmadı.");
      return;
    }
  
    console.log("🏆 İlk Tur Maçları Başlatılıyor...", teams);
  
    const roundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/1`
    );
  
    get(roundRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.log("⚠️ 1. Tur zaten oluşturulmuş.");
        return;
      }
  
      const initialBracket = [];
      for (let i = 0; i < teams.length; i += 2) {
        const match = {
          id: i / 2 + 1,
          team1: teams[i]?.team || 'Bekleniyor',
          team2: teams[i + 1]?.team || 'Bekleniyor',
          team1Score: null,
          team2Score: null,
          winner: null,
        };
        initialBracket.push(match);
      }
  
      console.log("✅ İlk Tur Maçları:", initialBracket);
  
      update(roundRef, { matches: initialBracket, started: true })
        .then(() => console.log("✅ 1. Tur başarıyla oluşturuldu."))
        .catch((err) => console.error("❌ Firebase Güncelleme Hatası:", err.message));
    });
  };
  


  useEffect(() => {
    const currentRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/1` // 1. Tur
    );
  
    onValue(currentRoundRef, (snapshot) => {
      const matches = snapshot.val()?.matches || [];
      const allWinners = matches.every((match) => match.winner);
  
      if (allWinners) {
        console.log('Tüm maçlar tamamlandı, yeni tur oluşturuluyor...');
        createNextRound(1);  
      }
    });
  }, []);

  
  const saveMatchResult = (match, currentRoundIndex, matchIndex) => {
    const { team1, team2, team1Score, team2Score } = match;
  
    if (team1Score === null || team2Score === null || isNaN(team1Score) || isNaN(team2Score)) {
      Alert.alert("Hata", "Lütfen geçerli skorları girin.");
      return;
    }
  
    let winner = null;
    if (team1Score > team2Score) winner = team1;
    else if (team2Score > team1Score) winner = team2;
  
    const matchRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${currentRoundIndex}/matches/${matchIndex}`
    );
  
    update(matchRef, { team1Score, team2Score, winner })
      .then(() => {
        console.log(`Skor başarıyla kaydedildi: ${currentRoundIndex}. Round`);
        moveWinnersToNextRound(currentRoundIndex); // Yeni turu kontrol ederek oluştur
      })
      .catch((err) => console.error("Firebase Hatası:", err.message));
  };
  
 

let isRoundBeingCreated = false;

const moveWinnersToNextRound = async (currentRoundIndex) => {
  if (isRoundBeingCreated) {
    console.log("Tur oluşturma işlemi devam ediyor. Yeni tur oluşturulmadı.");
    return;
  }

  isRoundBeingCreated = true;

  try {
    const currentRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${currentRoundIndex}`
    );

    const currentRoundSnapshot = await get(currentRoundRef);
    const matches = currentRoundSnapshot.val()?.matches || [];

    // Tüm maçların kazananlarının belirlenip belirlenmediğini kontrol et
    const allMatchesHaveWinners = matches.every((match) => match.winner);
    if (!allMatchesHaveWinners) {
      console.log(`${currentRoundIndex}. Tur tamamlanmadı. Yeni tur oluşturulmadı.`);
      return;
    }

    const winners = matches.map((match) => match.winner).filter(Boolean);

    if (winners.length < 2) {
      console.log("Yeni tur oluşturmak için yeterli kazanan yok.");
      return;
    }

    const nextRoundIndex = currentRoundIndex + 1;
    const nextRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${nextRoundIndex}`
    );

    const nextRoundSnapshot = await get(nextRoundRef);
    if (nextRoundSnapshot.exists()) {
      console.log(`${nextRoundIndex}. Tur zaten mevcut.`);
      return;
    }

    // Yeni tur eşleşmelerini oluştur
    const nextRoundMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextRoundMatches.push({
        id: (i / 2 + 1).toString(),
        team1: winners[i],
        team2: winners[i + 1] || "Bekleniyor",
        team1Score: null,
        team2Score: null,
        winner: null,
      });
    }

    // Yeni turu Firebase'e kaydet
    await update(nextRoundRef, { matches: nextRoundMatches });
    console.log(`${nextRoundIndex}. Tur başarıyla oluşturuldu.`);

    // Eğer sadece bir kazanan kalmışsa turnuva bitmiştir
    if (winners.length === 1) {
      setTournamentWinner({ winner: winners[0], isFinal: true });
      console.log("🏆 Turnuva Kazananı:", winners[0]);
    }
  } catch (err) {
    console.error("Hata:", err.message);
  } finally {
    isRoundBeingCreated = false; // İşlem tamamlanınca bayrağı sıfırla
  }
};


const createNextRound = async (currentRoundIndex) => {
  // Eğer 2. Tur oluşturulmasını istemiyorsanız buradan durdurabiliriz
  if (currentRoundIndex === 1) {
      console.log("2. Turun oluşturulması engellendi.");
      return;
  }

  const currentRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${currentRoundIndex}`
  );

  const nextRoundRef = ref(
      database,
      `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.tournamentId}/rounds/${currentRoundIndex + 1}`
  );

  try {
      const nextRoundSnapshot = await get(nextRoundRef);
      if (nextRoundSnapshot.exists()) {
          console.log(`${currentRoundIndex + 1}. Tur zaten mevcut.`);
          return;
      }

      const currentRoundSnapshot = await get(currentRoundRef);
      const matches = currentRoundSnapshot.val()?.matches || [];
      const winners = matches.map((match) => match.winner).filter(Boolean);

      if (winners.length < 2) {
          Alert.alert('Hata', 'Yeni tur oluşturmak için yeterli kazanan yok.');
          return;
      }

      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
          nextRoundMatches.push({
              id: (i / 2 + 1).toString(),
              team1: winners[i],
              team2: winners[i + 1] || 'Bekleniyor',
              team1Score: null,
              team2Score: null,
              winner: null,
          });
      }

      await update(nextRoundRef, { matches: nextRoundMatches });
      Alert.alert('Başarılı', `${currentRoundIndex + 1}. Tur oluşturuldu!`);
  } catch (err) {
      console.error('Hata:', err.message);
  }
};


  // Bracket'ta takım seçimini güncelle
  const handleBracketChange = (roundIndex, matchIndex, field, value) => {
    const updatedBracket = [...editableBracket];
    updatedBracket[roundIndex].matches[matchIndex][field] = value;
    setEditableBracket(updatedBracket);
  };

  // Firebase'e bracket verilerini kaydet
  const saveBracket = () => {
    const bracketRef = ref(database, `companies/xRDCyXloboXp4AiYC6GGnnHoFNy2/Tournaments/${tournament.id}/bracket`);
    update(bracketRef, editableBracket)
      .then(() => Alert.alert('Başarılı', 'Bracket güncellendi'))
      .catch((err) => Alert.alert('Hata', err.message));
  };
  const renderParticipantRow = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.rank]}></Text>
      <Text style={[styles.cell, styles.team]}>{item.companyName}</Text>
      <Text style={styles.cell}> </Text>
      <Text style={styles.cell}> </Text>
      <Text style={styles.cell}> </Text>
      <Text style={styles.cell}>Devam</Text>
      <Text style={styles.cell}> </Text>
    </View>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
  
    const [day, month, year] = dateString.split('/').map(Number);
    return `${day} ${months[month - 1]} ${year}`;
  };
  return (
    <View style={styles.container}>
      {/* Turnuva adı üstte sabit */}
      <Text style={styles.title}>{tournament.tournamentName}</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonSelected,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextSelected,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedTab === 'General' && (
  <ScrollView
    style={styles.generalContainer}
    showsVerticalScrollIndicator={false}
    bounces={false} // Scroll esnemesini kapatır
    overScrollMode="never" // Android'de esnemeyi kapatır
  >

 
<ScrollView style={styles.generalContainer}>
  
          <Animatable.View animation="zoomIn" delay={400} style={styles.detailsContainer}>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Start Date:</Text> {formatDate(tournament.startDate)}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Participation Fee:</Text> {tournament.participationFee ? `${tournament.participationFee}₺` : 'Ücretsiz'}</Text>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.generalDescription}>{tournament.tournamentDescription || 'There is no Description.'}</Text>
            <View style={styles.detailsContainer}>


<View style={styles.podiumContainer}>

    <View style={[styles.podium, styles.second]}>
      <Text style={styles.podiumText}>2</Text>
      <Text style={styles.gpText}>500 GP</Text>  
    </View>
  
 
  <View style={[styles.podium, styles.first]}>
    <Text style={styles.podiumText}>1</Text>
    <Text style={styles.gpText}>1000 GP</Text>  
  </View>
  
  {/* 3. Podium */}
  <View style={[styles.podium, styles.third]}>
    <Text style={styles.podiumText}>3</Text>
    <Text style={styles.gpText}>250 GP</Text> 
  </View>
</View>



<View style={styles.prizeContainer}>
<View style={styles.prizeBackground}>
<Text style={styles.prizeText}>
{tournament.participantCount &&
tournament.participationFee &&
tournament.prizePercentage
? `${(
    (tournament.participantCount *
      tournament.participationFee *
      tournament.prizePercentage) /
    100
  )} TL`
: '480 TL'}
</Text>
</View>
</View>



</View>
          </Animatable.View>
        </ScrollView>


  </ScrollView>
)}



{selectedTab === 'Fixtures' && (
  <ScrollView
    style={styles.bracketContainer}
    contentContainerStyle={{ paddingBottom: 20 }} // Alt mesafe eklendi
  >
    {/* Eğer hiç maç yoksa */}
    {Object.keys(roundsData).length === 0 ? (
      <View style={styles.waitingContainer}>
        <Text style={styles.waitingText}>
          Tournament has not started yet. Please wait...
        </Text>
      </View>
    ) : (
      Object.keys(roundsData)
        .map((key) => parseInt(key, 10)) // String olarak gelen tur numaralarını sayıya çevir
        .sort((a, b) => a - b) // Sayısal olarak sıralama yap
        .map((roundNumber, index) => (
          <View key={index} style={styles.roundContainer}>
            <Text style={styles.roundTitle}>{roundNumber}. Round</Text>
            {roundsData[roundNumber]?.matches?.map((match, matchIndex) => (
              <TouchableOpacity
                key={matchIndex}
                style={[
                  styles.matchContainer,
                  (match.team1 === companyName || match.team2 === companyName) && {
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => showMatchDetails(match, roundNumber)} // Herkes detayları görebilir
              >
                <Image
                  source={require('./assets/fixture_background2.png')}
                  style={styles.backgroundVideo}
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                  isMuted
                />
                <Text
                  style={[
                    styles.teamText,
                    match.team1Score > match.team2Score ? { fontWeight: 'bold' } : null,
                  ]}
                >
                  {match.team1 || 'Waiting'}
                </Text>
                <Text style={styles.scoreText}>
                  {match.team1Score != null && match.team2Score != null
                    ? `${match.team1Score} - ${match.team2Score}`
                    : 'VS'}
                </Text>
                {isCompany && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMatch(match);
                      setSelectedRoundKey(roundNumber);
                      setIsModalVisible(true);
                    }}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit Score</Text>
                  </TouchableOpacity>
                )}
                <Text
                  style={[
                    styles.teamText,
                    match.team1Score < match.team2Score ? { fontWeight: 'bold' } : null,
                  ]}
                >
                  {match.team2}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
    )}
  </ScrollView>
)}

<Modal
  transparent={true}
  animationType="slide"
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)} // Android'de geri tuşuyla kapatma
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Maç Detayları</Text>
      
      <Text>{selectedMatch?.team1} vs {selectedMatch?.team2}</Text>

          {/* Fotoğrafları Göster */}
          <FlatList
      data={photoUrls} // Fotoğraf URL'leri
      keyExtractor={(item, index) => index.toString()}
      horizontal // Yatay kaydırma
      renderItem={({ item }) => (
        <Image
          source={{ uri: item }} // URL'den görüntü al
          style={{ width: 300, height: 300, margin: 5, borderRadius: 10 }} // Görüntü boyutları
        />
      )}
      ListEmptyComponent={
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
          Fotoğraf bulunamadı.
        </Text>
      }
    />


      <TextInput
        style={styles.input}
        placeholder="Team 1 Skoru"
        keyboardType="numeric"
        value={selectedMatch?.team1Score?.toString() || ''}
        onChangeText={(value) =>
          setSelectedMatch((prev) => ({ ...prev, team1Score: parseInt(value) }))
        }
      />
      <Text style={styles.vsText}>VS</Text>
      <TextInput
        style={styles.input}
        placeholder="Team 2 Skoru"
        keyboardType="numeric"
        value={selectedMatch?.team2Score?.toString() || ''}
        onChangeText={(value) =>
          setSelectedMatch((prev) => ({ ...prev, team2Score: parseInt(value) }))
        }
      />

      <TouchableOpacity
        onPress={() => saveMatchResult(selectedMatch, selectedRoundKey, selectedMatch.id - 1)}
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>Skoru Kaydet</Text>
      </TouchableOpacity>

      {/* Kapatma Tuşu */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(false)} // Modalı kapat
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Kapat</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



<Modal
  visible={isDetailsModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setIsDetailsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Maç Detayları</Text>
      {selectedMatchDetails && (
        <>
          <Text style={styles.teamText}>
            Takım 1: {selectedMatchDetails.team1 || "Belirtilmemiş"}
          </Text>
          <Text style={styles.teamText}>
            Takım 2: {selectedMatchDetails.team2 || "Belirtilmemiş"}
          </Text>
          <Text style={styles.scoreText}>
            Skor: {selectedMatchDetails.team1Score ?? 0} - {selectedMatchDetails.team2Score ?? 0}
          </Text>
          <Text style={styles.winnerText}>
            Kazanan: {selectedMatchDetails.winner || "Henüz belirlenmedi"}
          </Text>
        </>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setIsDetailsModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Kapat</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
{selectedTab === 'Teams' && (
  <View style={styles.table}>
    {/* Başlık Satırı */}
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.rank]}>#</Text>
      <Text style={[styles.headerCell, styles.team]}>Takım İsmi</Text>
    </View>

    <FlatList
      data={teamsData} // TeamsData içindeki veriyi kullanıyoruz
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
          <Text style={[styles.cell, styles.rank]}>{index + 1}</Text>
          <Text style={[styles.cell, styles.team]}>{item.team}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 50 }} // Altta ekstra boşluk bırak
      keyboardShouldPersistTaps="handled" // Kaydırmayı düzgünleştir
      showsVerticalScrollIndicator={false} // Kaydırma çubuğunu gizle
    />
  </View>
)}



{selectedTab === 'Chat' && (
  <View style={styles.chatContainer}>
  <FlatList
    data={chatMessages}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.messageContainer}>
        <Text style={styles.messageSender}>{item.senderName || "Bilinmeyen Kullanıcı"}</Text>
        <Text style={styles.messageText}>{item.message || "Mesaj Yok"}</Text>
        <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    )}
    ListEmptyComponent={
      <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
        Mesaj yok.
      </Text>
    }
  />


    <View style={styles.inputContainer}>
      <TextInput
        style={styles.chatInput}
        placeholder="Type Message..."
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
      />
      <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
        <Ionicons name="send" size={24} color="#fff" /> 
      </TouchableOpacity>
    </View>
  </View>
)}

    </View>
  );
};

const styles = StyleSheet.create({

  table: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    marginBottom:100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  headerCell: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  rank: {
    width: 40,
    textAlign: 'center',
  },
  team: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  evenRow: {
    backgroundColor: '#000',
  },
  oddRow: {
    backgroundColor: '#121212',
  },
  cell: {
    fontSize: 15,
    color: '#fff',
  },

  winnerContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  
  generalContainer: { flex: 1, backgroundColor: '#000', borderRadius: 10, padding: 15, marginTop: 10 },
  lottieContainer: { alignItems: 'center', justifyContent: 'center', height: 100 },
  lottie: { width: 150, height: 150 },

  chatContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chatInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },

  sendButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  messageContainer: {
    backgroundColor: '#020202',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  sendButton: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  messageSender: {
    fontSize: 12,
    marginBottom:8,
    color: '#00343f',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#FFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  


backgroundVideo: {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  borderRadius:8,
  width: '100%',
  height: '200%',
  opacity: 1, // Videoyu biraz şeffaf yaparak içeriği görünür kıl
},

backgroundVideo2: {
  position: 'absolute',
  top: -10,
  left: -10,
  bottom: 0,
  right: 0,
  borderRadius:8,
  width: '106%',
  height: '120%',
  opacity: 1, // Videoyu biraz şeffaf yaparak içeriği görünür kıl
},
backgroundVideo3: {
  position: 'absolute',
  top:-100,
  left: -20,
  bottom: 0,
  right: 0,
  borderRadius:8,
  width: '120%',
  height: '120%',
  opacity: 1, // Videoyu biraz şeffaf yaparak içeriği görünür kıl
},

videoContainer: {
  flex: 1,
  overflow: 'hidden',
  borderRadius: 10,
  position: 'relative',
},

overlayContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,
  zIndex: 1, // İçerik videonun önünde olacak
},


  tournamentImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  detailsContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  waitingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  
  detailLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  
  

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },

  scoreText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  teamText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
    width: '40%',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#1e1e1e',
    fontSize: 16,
    fontWeight: 'bold',
  },

  vsButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  closeButton: {
    marginTop: 10,
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },

  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 20,
  },
  podium: {
    width: 70,
    height: 100,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#ffcc00',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
  },
  first: {
    height: 140,
    backgroundColor: '#000',
  },
  second: {
    height: 120,
    backgroundColor: '#000',
  },
  third: {
    height: 100,
    backgroundColor: '#000',
  },
  podiumText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffcc00',
    marginBottom:15,
  },
  gpText: {
    marginTop: 5,
    color: '#fff', // Yazı rengi beyaz
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  prizeDisplay: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },

  prizeContainer: {
    marginTop: 10,
    marginBottom:20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  prizeBackground: {
    backgroundColor: '#000',
    borderRadius: 15,
    paddingHorizontal: 80, // Genişlik artırıldı
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffcc00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  
  prizeText: {
    color: '#ffcc00', // Yazı rengi
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  




    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
      },
      title: {
        fontSize: 24,
        marginBottom:20,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 10,
      },
      tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
      },
      tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#1e1e1e',
      },
      tabButtonSelected: {
        backgroundColor: '#FFF',
      },
      tabText: {
        color: '#fff',
        fontSize: 14,
      },
      tabTextSelected: {
        color: '#121212',
        fontWeight: 'bold',
      },
      roundContainer: {
        marginBottom: 20,
      },
   
      roundTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 10,
      },
    bracketContainer: {
        padding: 10,
        backgroundColor: '#000',
        borderRadius: 10,
        marginTop: 10,
      },
      
      matchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 8,
      },
      teamText: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        flex: 1,
      },
      

  generalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  generalDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  tabContent: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default TournamentDetails;
