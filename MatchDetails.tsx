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
  const [userTeam, setUserTeam] = useState([]);
const [formation, setFormation] = useState("");
const [opponentTeam, setOpponentTeam] = useState([]);
const [opponentFormation, setOpponentFormation] = useState("");

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
  const [player1Stats, setPlayer1Stats] = useState(null);
const [player2Stats, setPlayer2Stats] = useState(null);
const [player1TotalPrize, setPlayer1TotalPrize] = useState(0);
const [player2TotalPrize, setPlayer2TotalPrize] = useState(0);
const [player1TotalXP, setPlayer1TotalXP] = useState(0);
const [player2TotalXP, setPlayer2TotalXP] = useState(0);
const [player1Tournaments, setPlayer1Tournaments] = useState(0);
  const [player2Tournaments, setPlayer2Tournaments] = useState(0);
  const [player1Trophies, setPlayer1Trophies] = useState(0);
  const [player2Trophies, setPlayer2Trophies] = useState(0); 


const fetchTotalPrize = async (playerId, setTotalPrize) => {
  try {
    const db = getDatabase();
    const tournamentsRef = dbRef(db, `users/${playerId}/tournaments`);
    const snapshot = await get(tournamentsRef);

    if (snapshot.exists()) {
      const tournaments = snapshot.val();
      const totalPrize = Object.values(tournaments).reduce((sum, t) => sum + (t.prize || 0), 0);
      setTotalPrize(totalPrize);
    } else {
      setTotalPrize(0);
    }
  } catch (error) {
    console.error(`❌ ${playerId} için ödül verisi alınırken hata oluştu:`, error);
  }
};

const fetchTotalXP = async (playerId, setTotalXP) => {
  try {
    const db = getDatabase();
    const tournamentsRef = dbRef(db, `users/${playerId}/tournaments`);
    const snapshot = await get(tournamentsRef);

    if (snapshot.exists()) {
      const tournaments = snapshot.val();
      const totalXP = Object.values(tournaments).reduce((sum, t) => sum + (t.xp || 0), 0);
      setTotalXP(totalXP);
    } else {
      setTotalXP(0);
    }
  } catch (error) {
    console.error(`❌ ${playerId} için XP verisi alınırken hata oluştu:`, error);
  }
};

const fetchPlayerStats = async (playerId, setPlayerStats) => {
    try {
        const db = getDatabase();
        const playerRef = dbRef(db, `users/${playerId}/tournamentStats`);
        const snapshot = await get(playerRef);

        if (snapshot.exists()) {
            const stats = snapshot.val();
            setPlayerStats({
                tournamentsPlayed: stats.tournamentsPlayed || 0,
                trophiesWon: stats.trophiesWon || 0
            });
        } else {
            setPlayerStats({
                tournamentsPlayed: 0,
                trophiesWon: 0
            });
        }
    } catch (error) {
        console.error(`❌ ${playerId} için turnuva verileri alınırken hata oluştu:`, error);
    }
};



  const fetchTournamentsPlayed = async (playerId, setTournamentsPlayed) => {
    try {
        const db = getDatabase();
        const tournamentsRef = dbRef(db, `users/${playerId}/MyTournaments`);
        const snapshot = await get(tournamentsRef);

        if (snapshot.exists()) {
            const tournaments = snapshot.val();
            const tournamentCount = Object.keys(tournaments).length;
            setTournamentsPlayed(tournamentCount);
        } else {
            setTournamentsPlayed(0);
        }
    } catch (error) {
        console.error(`❌ ${playerId} için turnuva katılım verisi alınırken hata oluştu:`, error);
    }
};

const fetchTrophiesWon = async (playerId, setTrophiesWon) => {
  try {
      const db = getDatabase();
      const tournamentsRef = dbRef(db, `users/${playerId}/tournaments`);
      const snapshot = await get(tournamentsRef);

      if (snapshot.exists()) {
          const tournaments = snapshot.val();
          const wonTrophies = Object.values(tournaments).filter(t => t.prize > 0).length;
          setTrophiesWon(wonTrophies);
      } else {
          setTrophiesWon(0);
      }
  } catch (error) {
      console.error(`❌ ${playerId} için ödül verisi alınırken hata oluştu:`, error);
  }
};


useEffect(() => {
  if (user1Id) {
    fetchTournamentsPlayed(user1Id, setPlayer1Tournaments);
    fetchTrophiesWon(user1Id, setPlayer1Trophies);
    fetchTotalPrize(user1Id, setPlayer1TotalPrize);
    fetchTotalXP(user1Id, setPlayer1TotalXP);
  }
  if (user2Id) {
    fetchTournamentsPlayed(user2Id, setPlayer2Tournaments);
    fetchTrophiesWon(user2Id, setPlayer2Trophies);
    fetchTotalPrize(user2Id, setPlayer2TotalPrize);
    fetchTotalXP(user2Id, setPlayer2TotalXP);
  }
}, [user1Id, user2Id]);


useEffect(() => {
    if (selectedTeam === user1) {
        fetchOpponentTeam(user1Id, setOpponentTeam, setOpponentFormation);
    } else {
        fetchOpponentTeam(user2Id, setOpponentTeam, setOpponentFormation);
    }
}, [selectedTeam]);


useEffect(() => {
    if (user1Id) fetchPlayerStats(user1Id, setPlayer1Stats);
    if (user2Id) fetchPlayerStats(user2Id, setPlayer2Stats);
}, [user1Id, user2Id]);


const fetchUserTeam = async (userId, setTeam, setFormation) => {
  try {
      const db = getDatabase();
      const teamRef = dbRef(db, `users/${userId}/MyTeam`);
      const snapshot = await get(teamRef);

      if (snapshot.exists()) {
          const teamData = snapshot.val();
          
          const fullSquad = [
              ...(teamData.squad?.defense || []),
              ...(teamData.squad?.midfield || []),
              ...(teamData.squad?.forwards || []),
              ...(teamData.squad?.goalkeeper ? [teamData.squad.goalkeeper] : [])
          ];

          setTeam(fullSquad); 
          setFormation(teamData.formation || "4-4-2");
      } else {
          setTeam([]);
      }
  } catch (error) {
      console.error("❌ Kullanıcı takım bilgileri alınırken hata oluştu:", error);
      setTeam([]);
  }
};



const fetchOpponentTeam = async (opponentId, setOpponentTeam, setOpponentFormation) => {
  try {
      const db = getDatabase();
      const teamRef = dbRef(db, `users/${opponentId}/MyTeam`);
      const snapshot = await get(teamRef);

      if (snapshot.exists()) {
          const teamData = snapshot.val();
          
          // 🔥 Doğru şekilde set et
          const fullSquad = [
              ...(teamData.squad?.defense || []),
              ...(teamData.squad?.midfield || []),
              ...(teamData.squad?.forwards || []),
              ...(teamData.squad?.goalkeeper ? [teamData.squad.goalkeeper] : [])
          ];

          console.log("✅ Rakip Takım: ", fullSquad);
          setOpponentTeam(fullSquad); // 🔥 Rakip takımı buraya set ediyoruz!
          setOpponentFormation(teamData.formation || "4-4-2");
      } else {
          console.warn(`❌ Rakip takım (${opponentId}) bulunamadı!`);
          setOpponentTeam([]);
      }
  } catch (error) {
      console.error("❌ Rakip takım bilgileri alınırken hata oluştu:", error);
      setOpponentTeam([]);
  }
};



  
useEffect(() => {
  if (selectedTeam === user1) {
      fetchOpponentTeam(user2Id, setOpponentTeam, setOpponentFormation);
  } else {
      fetchOpponentTeam(user1Id, setOpponentTeam, setOpponentFormation);
  }
}, [selectedTeam]);

useEffect(() => {
  console.log("🟢 user1Id:", user1Id);
  console.log("🟢 user2Id:", user2Id);
  console.log("🟢 setUserTeam:", typeof setUserTeam);
  console.log("🟢 setFormation:", typeof setFormation);
  console.log("🟢 setOpponentTeam:", typeof setOpponentTeam);
  console.log("🟢 setOpponentFormation:", typeof setOpponentFormation);
  
  if (user1Id) fetchUserTeam(user1Id, setUserTeam, setFormation);
  if (user2Id) fetchOpponentTeam(user2Id, setOpponentTeam, setOpponentFormation);
}, [user1Id, user2Id]);

  useEffect(() => {
    const auth = getAuth();
    setUserId(auth.currentUser?.uid);
  }, []);

  const teamColors = {
    [user1]: "#00003B", // Mavi (User1)
    [user2]: "#8B0000", // Kırmızı (User2)
  };


  const formations = {
    // ---------- 3 ATB (3 Defanslı Formasyonlar) ----------
  
    // 3-1-4-2
    "3-1-4-2": [
      { position: "GK",  top: 80, left: 50 },
      // 3 Defans
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      // 1 DM
      { position: "CDM", top: 55, left: 50 },
      // 4 Orta Saha
      { position: "RM",  top: 45, left: 80 },
      { position: "RCM", top: 45, left: 63 },
      { position: "LCM", top: 45, left: 37 },
      { position: "LM",  top: 45, left: 20 },
      // 2 Forvet
      { position: "ST",  top: 25, left: 40 },
      { position: "ST",  top: 25, left: 60 },
    ],
  
    // 3-4-1-2
    "3-4-1-2": [
      { position: "GK",  top: 80, left: 50 },
      // 3 Defans
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      // 4 Orta Saha (daha çok kanatlı)
      { position: "RM",  top: 55, left: 80 },
      { position: "RCM", top: 55, left: 63 },
      { position: "LCM", top: 55, left: 37 },
      { position: "LM",  top: 55, left: 20 },
      // 1 Ofansif Orta Saha
      { position: "CAM", top: 45, left: 50 },
      // 2 Forvet
      { position: "ST",  top: 25, left: 40 },
      { position: "ST",  top: 25, left: 60 },
    ],
  
    // 3-4-2-1
    "3-4-2-1": [
      { position: "GK",  top: 80, left: 50 },
      // 3 Defans
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      // 4 Orta Saha
      { position: "RM",  top: 55, left: 80 },
      { position: "RCM", top: 55, left: 60 },
      { position: "LCM", top: 55, left: 40 },
      { position: "LM",  top: 55, left: 20 },
      // 2 Ofansif Orta Saha
      { position: "RAM", top: 45, left: 60 },
      { position: "LAM", top: 45, left: 40 },
      // 1 Forvet
      { position: "ST",  top: 25, left: 50 },
    ],
  
    // 3-4-3
    "3-4-3": [
      { position: "GK",  top: 80, left: 50 },
      // 3 Defans
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      // 4 Orta Saha
      { position: "RM",  top: 50, left: 80 },
      { position: "RCM", top: 50, left: 63 },
      { position: "LCM", top: 50, left: 37 },
      { position: "LM",  top: 50, left: 20 },
      // 3 Forvet (geniş)
      { position: "RW",  top: 25, left: 75 },
      { position: "ST",  top: 20, left: 50 },
      { position: "LW",  top: 25, left: 25 },
    ],
  
    // 3-5-2
    "3-5-2": [
      { position: "GK",  top: 80, left: 50 },
      // 3 Defans
      { position: "RCB", top: 65, left: 63 },
      { position: "CB",  top: 65, left: 50 },
      { position: "LCB", top: 65, left: 37 },
      // 5 Orta Saha
      { position: "RWM", top: 50, left: 85 },
      { position: "RCM", top: 50, left: 63 },
      { position: "CM",  top: 50, left: 50 },
      { position: "LCM", top: 50, left: 37 },
      { position: "LWM", top: 50, left: 15 },
      // 2 Forvet
      { position: "ST",  top: 25, left: 40 },
      { position: "ST",  top: 25, left: 60 },
    ],
  
    // ---------- 4 ATB (4 Defanslı Formasyonlar) ----------
  
    // 4-1-2-1-2
    "4-1-2-1-2": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 1 DM
      { position: "CDM", top: 57, left: 50 },
      // 2 CM
      { position: "RCM", top: 47, left: 60 },
      { position: "LCM", top: 47, left: 40 },
      // 1 CAM
      { position: "CAM", top: 37, left: 50 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 42 },
      { position: "ST",  top: 20, left: 58 },
    ],
  
    // 4-1-2-1-2 (2)
    "4-1-2-1-2 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 1 DM
      { position: "CDM", top: 57, left: 50 },
      // 2 CM (biraz daha geniş)
      { position: "RCM", top: 47, left: 65 },
      { position: "LCM", top: 47, left: 35 },
      // 1 CAM
      { position: "CAM", top: 37, left: 50 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 42 },
      { position: "ST",  top: 20, left: 58 },
    ],
  
    // 4-1-3-2
    "4-1-3-2": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 1 DM
      { position: "CDM", top: 57, left: 50 },
      // 3 Orta Saha (daha ofansif)
      { position: "RCM", top: 47, left: 60 },
      { position: "CM",  top: 47, left: 50 },
      { position: "LCM", top: 47, left: 40 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 43 },
      { position: "ST",  top: 20, left: 57 },
    ],
  
    // 4-1-4-1
    "4-1-4-1": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 1 DM
      { position: "CDM", top: 57, left: 50 },
      // 4 Orta Saha (daha düz)
      { position: "RM",  top: 47, left: 80 },
      { position: "RCM", top: 47, left: 60 },
      { position: "LCM", top: 47, left: 40 },
      { position: "LM",  top: 47, left: 20 },
      // 1 Forvet
      { position: "ST",  top: 20, left: 50 },
    ],
  
    // 4-2-1-3
    "4-2-1-3": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 2 DM
      { position: "RDM",  top: 57, left: 60 },
      { position: "LDM",  top: 57, left: 40 },
      // 1 AM/CM
      { position: "CAM",  top: 47, left: 50 },
      // 3 Forvet
      { position: "RW",   top: 25, left: 75 },
      { position: "ST",   top: 20, left: 50 },
      { position: "LW",   top: 25, left: 25 },
    ],
  
    // 4-2-2-2
    "4-2-2-2": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 2 DM
      { position: "RDM",  top: 57, left: 60 },
      { position: "LDM",  top: 57, left: 40 },
      // 2 AM (geniş)
      { position: "RAM",  top: 47, left: 60 },
      { position: "LAM",  top: 47, left: 40 },
      // 2 Forvet
      { position: "ST",   top: 20, left: 42 },
      { position: "ST",   top: 20, left: 58 },
    ],
  
    // 4-2-3-1
    "4-2-3-1": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 2 DM
      { position: "RDM",  top: 57, left: 60 },
      { position: "LDM",  top: 57, left: 40 },
      // 3 Ofansif Orta Saha
      { position: "RAM",  top: 47, left: 60 },
      { position: "CAM",  top: 47, left: 50 },
      { position: "LAM",  top: 47, left: 40 },
      // 1 Forvet
      { position: "ST",   top: 20, left: 50 },
    ],
  
    // 4-2-3-1 (2)
    "4-2-3-1 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 2 DM
      { position: "RDM",  top: 57, left: 60 },
      { position: "LDM",  top: 57, left: 40 },
      // 3 Ofansif Orta Saha (daha geniş)
      { position: "RAM",  top: 47, left: 70 },
      { position: "CAM",  top: 47, left: 50 },
      { position: "LAM",  top: 47, left: 30 },
      // 1 Forvet
      { position: "ST",   top: 20, left: 50 },
    ],
  
    // 4-2-4
    "4-2-4": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 2 Orta Saha
      { position: "RCM",  top: 50, left: 60 },
      { position: "LCM",  top: 50, left: 40 },
      // 4 Forvet (2 merkez, 2 kanat gibi)
      { position: "RW",   top: 30, left: 80 },
      { position: "RS",   top: 25, left: 60 },
      { position: "LS",   top: 25, left: 40 },
      { position: "LW",   top: 30, left: 20 },
    ],
  
    // 4-3-1-2
    "4-3-1-2": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 3 Orta Saha
      { position: "RCM", top: 55, left: 60 },
      { position: "CM",  top: 55, left: 50 },
      { position: "LCM", top: 55, left: 40 },
      // 1 Ofansif Orta Saha
      { position: "CAM", top: 45, left: 50 },
      // 2 Forvet
      { position: "ST",  top: 25, left: 42 },
      { position: "ST",  top: 25, left: 58 },
    ],
  
    // 4-3-2-1
    "4-3-2-1": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 3 Orta Saha
      { position: "RCM",  top: 55, left: 60 },
      { position: "CM",   top: 55, left: 50 },
      { position: "LCM",  top: 55, left: 40 },
      // 2 Ofansif
      { position: "RAM",  top: 45, left: 60 },
      { position: "LAM",  top: 45, left: 40 },
      // 1 Forvet
      { position: "ST",   top: 25, left: 50 },
    ],
  
    // 4-3-3
    "4-3-3": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 3 Orta Saha
      { position: "RCM", top: 50, left: 60 },
      { position: "CM",  top: 50, left: 50 },
      { position: "LCM", top: 50, left: 40 },
      // 3 Forvet (kanat + santrfor)
      { position: "RW",  top: 25, left: 75 },
      { position: "ST",  top: 20, left: 50 },
      { position: "LW",  top: 25, left: 25 },
    ],
  
    // 4-3-3 (2)
    "4-3-3 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 3 Orta Saha (biraz daha geride)
      { position: "RCM", top: 55, left: 60 },
      { position: "CM",  top: 55, left: 50 },
      { position: "LCM", top: 55, left: 40 },
      // 3 Forvet
      { position: "RW",  top: 25, left: 75 },
      { position: "ST",  top: 20, left: 50 },
      { position: "LW",  top: 25, left: 25 },
    ],
  
    // 4-3-3 (3)
    "4-3-3 (3)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 3 Orta Saha
      { position: "RCM", top: 50, left: 58 },
      { position: "CM",  top: 50, left: 43 },
      { position: "LCM", top: 50, left: 28 },
      // 3 Forvet
      { position: "RW",  top: 25, left: 75 },
      { position: "ST",  top: 20, left: 50 },
      { position: "LW",  top: 25, left: 25 },
    ],
  
    // 4-3-3 (4)
    "4-3-3 (4)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 3 Orta Saha (biraz daha önde)
      { position: "RCM", top: 45, left: 60 },
      { position: "CM",  top: 45, left: 50 },
      { position: "LCM", top: 45, left: 40 },
      // 3 Forvet
      { position: "RW",  top: 20, left: 75 },
      { position: "ST",  top: 15, left: 50 },
      { position: "LW",  top: 20, left: 25 },
    ],
  
    // 4-4-1-1 (2)
    "4-4-1-1 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 4 Orta Saha
      { position: "RM",  top: 50, left: 80 },
      { position: "RCM", top: 50, left: 60 },
      { position: "LCM", top: 50, left: 40 },
      { position: "LM",  top: 50, left: 20 },
      // 1 Ofansif Serbest (SS/CAM)
      { position: "CF",  top: 35, left: 50 },
      // 1 Forvet
      { position: "ST",  top: 20, left: 50 },
    ],
  
    // 4-4-2
    "4-4-2": [
      { position: "GK",  top: 80, left: 43 }, // Örnek koddaki gibi korunabilir
      // 4 Defans
      { position: "RB",  top: 65, left: 83 },
      { position: "RCB", top: 70, left: 58 },
      { position: "LCB", top: 70, left: 28 },
      { position: "LB",  top: 65, left: 3 },
      // 4 Orta Saha
      { position: "RM",  top: 40, left: 78 },
      { position: "RCM", top: 50, left: 58 },
      { position: "LCM", top: 50, left: 28 },
      { position: "LM",  top: 40, left: 8 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 55 },
      { position: "ST",  top: 20, left: 30 },
    ],
  
    // 4-4-2 (2)
    "4-4-2 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",  top: 65, left: 80 },
      { position: "RCB", top: 70, left: 60 },
      { position: "LCB", top: 70, left: 40 },
      { position: "LB",  top: 65, left: 20 },
      // 4 Orta Saha (daha düz sıralanmış)
      { position: "RM",  top: 50, left: 75 },
      { position: "RCM", top: 50, left: 60 },
      { position: "LCM", top: 50, left: 40 },
      { position: "LM",  top: 50, left: 25 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 43 },
      { position: "ST",  top: 20, left: 57 },
    ],
  
    // 4-5-1
    "4-5-1": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 5 Orta Saha
      { position: "RWM",  top: 50, left: 85 },
      { position: "RCM",  top: 50, left: 65 },
      { position: "CM",   top: 50, left: 50 },
      { position: "LCM",  top: 50, left: 35 },
      { position: "LWM",  top: 50, left: 15 },
      // 1 Forvet
      { position: "ST",   top: 25, left: 50 },
    ],
  
    // 4-5-1 (2)
    "4-5-1 (2)": [
      { position: "GK",  top: 80, left: 50 },
      // 4 Defans
      { position: "RB",   top: 65, left: 80 },
      { position: "RCB",  top: 70, left: 60 },
      { position: "LCB",  top: 70, left: 40 },
      { position: "LB",   top: 65, left: 20 },
      // 5 Orta Saha (biraz farklı yayılım)
      { position: "RM",   top: 50, left: 80 },
      { position: "RCM",  top: 50, left: 60 },
      { position: "LCM",  top: 50, left: 40 },
      { position: "LM",   top: 50, left: 20 },
      { position: "CAM",  top: 40, left: 50 }, 
      // 1 Forvet
      { position: "ST",   top: 25, left: 50 },
    ],
  
    // ---------- 5 ATB (5 Defanslı Formasyonlar) ----------
  
    // 5-2-1-2
    "5-2-1-2": [
      { position: "GK",  top: 80, left: 50 },
      // 5 Defans (Wing-back'ler biraz önde)
      { position: "RWB", top: 60, left: 85 },
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      { position: "LWB", top: 60, left: 15 },
      // 2 Orta (merkez)
      { position: "RCM", top: 50, left: 60 },
      { position: "LCM", top: 50, left: 40 },
      // 1 Ofansif Orta Saha
      { position: "CAM", top: 40, left: 50 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 42 },
      { position: "ST",  top: 20, left: 58 },
    ],
  
    // 5-2-3
    "5-2-3": [
      { position: "GK",  top: 80, left: 50 },
      // 5 Defans (3 stoper + 2 kanat bek)
      { position: "RWB", top: 60, left: 85 },
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      { position: "LWB", top: 60, left: 15 },
      // 2 Orta
      { position: "RCM", top: 50, left: 60 },
      { position: "LCM", top: 50, left: 40 },
      // 3 Forvet (RW, ST, LW)
      { position: "RW",  top: 25, left: 75 },
      { position: "ST",  top: 20, left: 50 },
      { position: "LW",  top: 25, left: 25 },
    ],
  
    // 5-3-2
    "5-3-2": [
      { position: "GK",  top: 80, left: 50 },
      // 5 Defans
      { position: "RWB", top: 60, left: 85 },
      { position: "RCB", top: 68, left: 63 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 37 },
      { position: "LWB", top: 60, left: 15 },
      // 3 Orta Saha
      { position: "RCM", top: 50, left: 60 },
      { position: "CM",  top: 50, left: 50 },
      { position: "LCM", top: 50, left: 40 },
      // 2 Forvet
      { position: "ST",  top: 20, left: 43 },
      { position: "ST",  top: 20, left: 57 },
    ],
  
    // 5-4-1
    "5-4-1": [
      { position: "GK",  top: 80, left: 50 },
      // 5 Defans
      { position: "RWB", top: 60, left: 85 },
      { position: "RCB", top: 68, left: 60 },
      { position: "CB",  top: 68, left: 50 },
      { position: "LCB", top: 68, left: 40 },
      { position: "LWB", top: 60, left: 15 },
      // 4 Orta Saha (daha düz)
      { position: "RM",  top: 50, left: 75 },
      { position: "RCM", top: 50, left: 60 },
      { position: "LCM", top: 50, left: 40 },
      { position: "LM",  top: 50, left: 25 },
      // 1 Forvet
      { position: "ST",  top: 20, left: 50 },
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


useEffect(() => {
  console.log("🔥 Kullanıcı Takımı:", userTeam);
  console.log("🔥 Rakip Takımı:", opponentTeam);
}, [userTeam, opponentTeam]);

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
const getMatchSummary = () => {
  const goalDifference = Math.abs(team1Score - team2Score);
  const totalTournamentsUser1 = player1Tournaments;
  const totalTournamentsUser2 = player2Tournaments;
  const totalTrophiesUser1 = player1Trophies;
  const totalTrophiesUser2 = player2Trophies;

  // **🏆 Turnuva Başarıları**
  const tournamentInfo = (user, tournaments, trophies) => {
      return `${user} has participated in ${tournaments} tournaments and secured ${trophies} trophies so far.`;
  };

  // **⚽ Beraberlik Senaryoları**
  if (team1Score === team2Score) {
      if (team1Score === 0) {
          return `🛑 A goalless draw! Both teams displayed solid defensive performances, making it impossible to break the deadlock. 

${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}
${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}

Both teams will be looking for a breakthrough in their next game!`;
      } else {
          return `🔥 What a thrilling match! The game ended in an exciting ${team1Score}-${team2Score} draw, keeping the fans at the edge of their seats! 

${user1} and ${user2} fought fiercely, trading goals back and forth throughout the game. Both teams had multiple chances to take the lead, but neither could secure a decisive advantage. 

${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}
${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}

A well-earned point for both sides, but they’ll surely be hungry for victory in their upcoming matches!`;
      }
  }

  // **🏆 Galibiyet Senaryoları**
  if (team1Score > team2Score) {
      if (goalDifference >= 4) {
          return `⚡ DOMINANT VICTORY! ${user1} completely outclassed ${user2}, securing a massive ${team1Score}-${team2Score} win! 

${user1} was in total control from the start, showcasing their attacking prowess with relentless pressure. ${user2} tried to respond, but their defense collapsed under the relentless attacks. 

${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}
${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}

A statement win for ${user1}!`;
      } else if (goalDifference === 3) {
          return `🔥 Convincing Win! ${user1} put on a solid performance to claim a ${team1Score}-${team2Score} victory over ${user2}. 

The game was tightly contested in the first half, but ${user1} stepped up their game in the second half, showing why they are a force to be reckoned with. 

${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}
${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}

${user2} will need to bounce back stronger in the next match!`;
      } else {
          return `⚔️ Narrow Victory! ${user1} edged past ${user2} with a hard-fought ${team1Score}-${team2Score} win! 

Both teams gave everything on the pitch, but in the end, ${user1} found the extra edge to secure the three points. 

${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}
${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}

A fantastic battle, and ${user2} will be looking to get revenge in the next encounter!`;
      }
  } else {
      if (goalDifference >= 4) {
          return `🚀 CRUSHING VICTORY! ${user2} annihilated ${user1} with a staggering ${team2Score}-${team1Score} scoreline! 

From the opening whistle, ${user2} was on fire, tearing through the defense of ${user1} with precision and power. 

${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}
${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}

A humiliating defeat for ${user1}, who will need to regroup and recover fast!`;
      } else if (goalDifference === 3) {
          return `🔥 Commanding Win! ${user2} delivered a statement victory over ${user1} with a solid ${team2Score}-${team1Score} scoreline. 

Despite a few resistance moments from ${user1}, ${user2} controlled the majority of the match, showcasing great teamwork and finishing ability. 

${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}
${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}

A performance worthy of champions!`;
      } else {
          return `⚖️ Tightly Contested Battle! ${user2} emerged victorious with a close ${team2Score}-${team1Score} win over ${user1}. 

This was a game of fine margins, and ${user2} made the most of their opportunities. ${user1} had their chances but couldn’t capitalize when it mattered most. 

${tournamentInfo(user2, totalTournamentsUser2, totalTrophiesUser2)}
${tournamentInfo(user1, totalTournamentsUser1, totalTrophiesUser1)}

An intense match that could have gone either way!`;
      }
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
    <Text style={styles.matchInfo}>{getMatchSummary()}</Text>
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
                    <Image source={require("./assets/potch.png")} style={styles.lineupImage} />
                    {userTeam.length > 0 ? (
    userTeam.map((player, index) => (
        <View key={index} style={[styles.playerPosition, { 
            top: `${formations[formation][index]?.top}%`, 
            left: `${formations[formation][index]?.left}%` 
        }]}> 
            {/* 🏆 Oyuncu Kartı ve Overall Puanı */}
            <View style={styles.playerCard}>
                <Image source={{ uri: player?.images?.PlayerCard }} style={styles.playerImage} />
                <Text style={styles.overallText}>{player?.player_info?.Overall || "??"}</Text>
            </View>
            <Text style={styles.playerText}>{player?.player_info?.Name || "Unknown"}</Text>
        </View>
    ))
) : (
    <Text style={styles.noPlayerText}>THERE IS NO PLAYER ON TEAM</Text>
)}



                </View>
    
  </View>
)}

{selectedTab === 'Stats' && (
  <View style={styles.statsContainer}>
    <Text style={styles.sectionTitle}>Player Tournament Stats</Text>

    {/* Turnuva Katılım Sayısı */}
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>Tournaments Played</Text>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.statBar, styles.player1Bar, { width: `${(player1Tournaments / (player1Tournaments + player2Tournaments) * 100) || 0}%` }]} />
        <Animated.View style={[styles.statBar, styles.player2Bar, { width: `${(player2Tournaments / (player1Tournaments + player2Tournaments) * 100) || 0}%` }]} />
      </View>
      <View style={styles.statNumbers}>
        <Text style={styles.player1Stat}>{player1Tournaments}</Text>
        <Text style={styles.player2Stat}>{player2Tournaments}</Text>
      </View>
    </View>

    {/* Ödül Kazanma Sayısı */}
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>Trophies Won</Text>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.statBar, styles.player1Bar, { width: `${(player1Trophies / (player1Trophies + player2Trophies) * 100) || 0}%` }]} />
        <Animated.View style={[styles.statBar, styles.player2Bar, { width: `${(player2Trophies / (player1Trophies + player2Trophies) * 100) || 0}%` }]} />
      </View>
      <View style={styles.statNumbers}>
        <Text style={styles.player1Stat}>{player1Trophies}</Text>
        <Text style={styles.player2Stat}>{player2Trophies}</Text>
      </View>
    </View>

    {/* Kazanılan Ödüller (Prize) */}
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>Total Earned Prize</Text>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.statBar, styles.player1Bar, { width: `${(player1TotalPrize / (player1TotalPrize + player2TotalPrize) * 100) || 0}%` }]} />
        <Animated.View style={[styles.statBar, styles.player2Bar, { width: `${(player2TotalPrize / (player1TotalPrize + player2TotalPrize) * 100) || 0}%` }]} />
      </View>
      <View style={styles.statNumbers}>
        <Text style={styles.player1Stat}>{player1TotalPrize}TL</Text>
        <Text style={styles.player2Stat}>{player2TotalPrize}TL</Text>
      </View>
    </View>

    {/* Kazanılan XP */}
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>Total Earned XP</Text>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.statBar, styles.player1Bar, { width: `${(player1TotalXP / (player1TotalXP + player2TotalXP) * 100) || 0}%` }]} />
        <Animated.View style={[styles.statBar, styles.player2Bar, { width: `${(player2TotalXP / (player1TotalXP + player2TotalXP) * 100) || 0}%` }]} />
      </View>
      <View style={styles.statNumbers}>
        <Text style={styles.player1Stat}>{player1TotalXP}xp</Text>
        <Text style={styles.player2Stat}>{player2TotalXP}xp</Text>
      </View>
    </View>
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

  noPlayerText: {
    position: "absolute",
    top: "40%",
    left: "38%",
    transform: [{ translateX: -100 }, { translateY: -20 }],
    fontSize: 24,
    color: "white",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 5,
  },
  playerCard: {
    position: "relative", // 🔥 İçindeki öğeleri konumlandırmak için
    justifyContent: "center",
    alignItems: "center",
},

overallText: {
    position: "absolute",
    top: 5, // 📍 Overall değeri kartın üstünde olacak
    right: 5, // 📍 Sağ üst köşeye konumlandırıldı
    backgroundColor: "rgba(0, 0, 0, 0.7)", // 🎭 Hafif saydam arkaplan
    color: "#FFCC00", // 🏆 Altın sarısı renk
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
},

  statsContainer: {
    padding: 15,
    backgroundColor: '#111111',
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
  loadingText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
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
      width: 50, // 🔥 Daha uzun dikdörtgen
      height: 70, // 🔥 Uzunluk artırıldı
      borderRadius: 10, // 🔥 Kenarları biraz yuvarlak
      backgroundColor: "#000", 
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#ffcc00", 
      transform: [{ translateX: -40 }, { translateY: -30 }], // 🔥 Ortalamak için güncellendi
      shadowColor: "#ffcc00", 
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      elevation: 6,
  },
  
  playerImage: {
      width: 50, // 🔥 Fotoğraf uzun dikdörtgene uyacak şekilde ayarlandı
      height: 50,
      borderRadius: 10, // 🔥 Kenarlar yuvarlatıldı ama tam yuvarlak değil
  },
  
  playerText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 10,
      textAlign: "center",
      marginTop: 2, // 🔥 Daha iyi hizalama
      textShadowColor: "#ffcc00", 
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
    width: "140%",
    height: 450,
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
    padding:20,
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
    borderRadius: 10,
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
