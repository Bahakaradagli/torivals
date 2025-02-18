import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Modal,
  TextInput
} from "react-native";
import PlayerRequest from "./API/footbalPlayerRequest";
const { width, height } = Dimensions.get("window");
import Ionicons from "react-native-vector-icons/Ionicons";

import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';

const saveTeamToFirebase = (squad, selectedFormation) => {

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error("User not authenticated");
    return;
  }

  const db = getDatabase();
  const userTeamRef = (ref(db, `users/${user.uid}/MyTeam`));

  // Tüm oyuncuları tek bir array'de topla
  const allPlayers = [
    squad.goalkeeper,
    ...squad.defense,
    ...squad.midfield,
    ...squad.forwards
  ].filter(player => player !== null && player !== undefined);

  console.log("All Players:", allPlayers.map(p => Number(p.player_info.Overall))); // Sayıya çevrildi

  const totalOverall = allPlayers.length > 0
    ? Math.round(allPlayers.reduce((sum, player) => sum + Number(player.player_info.Overall || 0), 0) / allPlayers.length)
    : 0; // 11 yerine gerçek oyuncu sayısına böl

  console.log("sum", totalOverall);




  const playersData = {};
  allPlayers.forEach((player, index) => {
    playersData[`Player${index + 1}`] = {
      cardName: player?.card_name || "Default",  // `player_info` içinde değil, direkt erişilmeli
      cardThema: player?.card_thema || "Default",
      playerName: player?.player_info?.Name || "Unknown",
      overall: parseInt(player?.player_info?.Overall, 10) || 0, // String yerine tam sayı yap
      playerImage: player?.images?.["Player Card"] || "", // Boşluklu key için [] kullan
      position: player?.player_info?.Position || "Unknown"
    };
  });

  const teamData = {
    formation: selectedFormation,
    totalOverall,
    Players: playersData
  };

  set(userTeamRef, teamData)
    .then(() => console.log("Team saved successfully!"))
    .catch(error => console.error("Error saving team:", error));
};

const formatPlayerData = (player) => {
  console.log("Gelen oyuncu verisi:", player?.player_info); // Debug için ekledim
  return {
    name: player?.player_info?.Name || "Unknown",
    overall: player?.player_info?.Overall || 0,
    position: player?.player_info?.Position || "Unknown",
    cardName: player?.player_info?.CardName || "Default",
    cardThema: player?.player_info?.CardThema || "Default",
    playerImage: player?.player_info?.PlayerImage || ""
  };
};




const categoryMap = {
  goalkeeper: 'Goalkeeper',
  defense: 'Defender',
  midfield: 'Midfielder',
  forwards: 'Striker'
};



const formations = {
  "4-4-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.87 }, // 0.92 → 0.87
      defense: [
        { x: 0.2, y: 0.70 }, { x: 0.4, y: 0.70 }, { x: 0.6, y: 0.70 }, { x: 0.8, y: 0.70 }
      ], // 0.75 → 0.70
      midfield: [
        { x: 0.1, y: 0.50 }, { x: 0.3, y: 0.50 }, { x: 0.7, y: 0.50 }, { x: 0.9, y: 0.50 }
      ], // 0.55 → 0.50
      forwards: [
        { x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }
      ] // 0.30 → 0.25
    }
  },
  "3-5-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.87 },
      defense: [
        { x: 0.3, y: 0.70 }, { x: 0.5, y: 0.70 }, { x: 0.7, y: 0.70 }
      ],
      midfield: [
        { x: 0.1, y: 0.50 }, { x: 0.3, y: 0.50 }, { x: 0.5, y: 0.50 }, { x: 0.7, y: 0.50 }, { x: 0.9, y: 0.50 }
      ],
      forwards: [
        { x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }
      ]
    }
  },
  "4-3-3": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.87 },
      defense: [
        { x: 0.2, y: 0.70 }, { x: 0.4, y: 0.70 }, { x: 0.6, y: 0.70 }, { x: 0.8, y: 0.70 }
      ],
      midfield: [
        { x: 0.3, y: 0.50 }, { x: 0.5, y: 0.50 }, { x: 0.7, y: 0.50 }
      ],
      forwards: [
        { x: 0.2, y: 0.25 }, { x: 0.5, y: 0.25 }, { x: 0.8, y: 0.25 }
      ]
    }
  },
  "5-3-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.80 },
      defense: [
        { x: 0.15, y: 0.55 }, { x: 0.3, y: 0.65 }, { x: 0.5, y: 0.675 }, { x: 0.7, y: 0.65 }, { x: 0.85, y: 0.55 }
      ],
      midfield: [
        { x: 0.3, y: 0.45 }, { x: 0.5, y: 0.50 }, { x: 0.7, y: 0.45 }
      ],
      forwards: [
        { x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }
      ]
    }
  },
  "4-2-4": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.87 },
      defense: [
        { x: 0.2, y: 0.70 }, { x: 0.4, y: 0.70 }, { x: 0.6, y: 0.70 }, { x: 0.8, y: 0.70 }
      ],
      midfield: [
        { x: 0.3, y: 0.50 }, { x: 0.7, y: 0.50 }
      ],
      forwards: [
        { x: 0.1, y: 0.25 }, { x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }, { x: 0.9, y: 0.25 }
      ]
    }
  }
};

const FootballField = () => {
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });
  const [selectedMode, setSelectedMode] = useState("normal"); // 📌 "normal" veya "proclubs"
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [isProclubsMode, setIsProclubsMode] = useState(false);
  const [squad, setSquad] = useState({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: [],
  });

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState({ name: "", overall: "50" });
  const [createPlayerModal, setCreatePlayerModal] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const savePlayerToFirebase = () => {
    if (!user) {
      alert("Giriş yapmalısınız!");
      return;
    }
  
    if (!selectedPosition) {
      alert("Pozisyon seçilmedi!");
      return;
    }
  
    const db = getDatabase();
    const proclubsRef = ref(db, `users/${user.uid}/MyTeam/Proclubs`);
  
    const newPlayerData = {
      name: newPlayer.name,
      position: selectedPosition.category, // 📌 Pozisyonu kaydet
      overall: parseInt(newPlayer.overall, 10),
    };
  
    push(proclubsRef, newPlayerData)
      .then(() => {
        alert("Oyuncu başarıyla eklendi!");
  
        setSquad(prev => {
          const updatedSquad = { ...prev };
  
          // 📌 Tıklanan pozisyona oyuncuyu ekle
          updatedSquad[selectedPosition.category][selectedPosition.index] = newPlayerData;
  
          return updatedSquad;
        });
  
        // 📌 State temizleme
        setSelectedPosition(null);
        setNewPlayer({ name: "", overall: "50" });
        setCreatePlayerModal(false);
      })
      .catch(error => console.error("Oyuncu kaydedilirken hata:", error));
  };

  const handlePlayerSelect = (card) => {
    if (!selectedPlayer) return;
    const { category, positionIndex } = selectedPlayer;
  
    setSquad(prev => {
      const updatedSquad = { ...prev };
      if (category === 'goalkeeper') {
        updatedSquad.goalkeeper = card; 
      } else {
        updatedSquad[category][positionIndex] = card;
      }
      console.log("✅ Güncellenmiş Kadro:", updatedSquad);
      return updatedSquad;
    });
  
    setSelectedPlayer(null);
  };
  
  
const handlePlayerPress = (category, index) => {
  console.log("Tıklanan pozisyon:", category, index); // ✅ Debug Log
  if (isProclubsMode) {
    setSelectedPosition({ category, index });
    setCreatePlayerModal(true);
    console.log("Proclubs için modal açılıyor..."); // ✅ Debug Log
  } else {
    setSelectedPlayer({ category, positionIndex: index });
  }
};





  const onFieldLayout = useCallback(event => {
    const { width, height } = event.nativeEvent.layout;
    setFieldDimensions({ width, height });
  }, []);

  const saveTeamToFirebase = (squad, selectedFormation) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
  
    const db = getDatabase();
    const userTeamRef = ref(db, `users/${user.uid}/MyTeam`);
  
    const allPlayers = [
      squad.goalkeeper,
      ...squad.defense,
      ...squad.midfield,
      ...squad.forwards
    ].filter(player => player !== null && player !== undefined);
  
    console.log("All Players:", allPlayers); // ✅ Tüm oyuncuları kontrol et
  
    const totalOverall = allPlayers.length > 0
      ? Math.round(allPlayers.reduce((sum, player) => sum + Number(player?.player_info?.Overall || 0), 0) / allPlayers.length)
      : 0;
  
    const playersData = {};
    allPlayers.forEach((player, index) => {
      playersData[`Player${index + 1}`] = {
        cardName: player?.card_name || "Default",
        cardThema: player?.card_thema || "Default",
        playerName: player?.player_info?.Name || "Unknown",  // ✅ Burada `player_info.Name` çekiliyor
        overall: parseInt(player?.player_info?.Overall, 10) || 0,
        playerImage: player?.images?.["Player Card"] || "",
        position: player?.player_info?.Position || "Unknown"
      };
    });
  
    console.log("Kaydedilecek takım verisi:", playersData); // ✅ Firebase'e kaydetmeden önce kontrol et
  
    const teamData = {
      formation: selectedFormation,
      totalOverall,
      Players: playersData
    };
  
    set(userTeamRef, teamData)
      .then(() => console.log("Team saved successfully!"))
      .catch(error => console.error("Error saving team:", error));
  };
  
  const renderPlayers = () => {
    if (!fieldDimensions.width || !fieldDimensions.height) return null;
  
    const formation = formations[selectedFormation].positions;
  
    const generatePositions = (positions, category) => {
      return positions.map((pos, index) => {
        const playerData = category === 'goalkeeper'
          ? squad.goalkeeper
          : squad[category][index];
  
        return (
          <TouchableOpacity
            key={`${category}-${index}`}
            onPress={() => handlePlayerPress(category, index)}
            style={[
              styles.player,
              {
                left: pos.x * fieldDimensions.width - 40,
                top: pos.y * fieldDimensions.height - 40,
                width: 80,
                height: 50,
              }
            ]}
          >
            <Text style={styles.playerNumber}>
              {playerData?.player_info?.Overall || index + 1}
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {playerData?.player_info?.Name || `Player ${index + 1}`}
              </Text>
              <Text style={styles.infoText}>
                {playerData?.player_info?.Position || categoryMap[category]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });
    };
  
    return (
      <>
        {generatePositions([formation.goalkeeper], 'goalkeeper')}
        {generatePositions(formation.defense, 'defense')}
        {generatePositions(formation.midfield, 'midfield')}
        {generatePositions(formation.forwards, 'forwards')}
      </>
    );
  };
  


  return (

    <View style={styles.container}>
  
    {/* Futbol sahası */}
    <View style={[styles.rectangle]}>
      <View style={styles.arenaBorderOval}>
        <View
          style={styles.arenaBorder}
          onLayout={onFieldLayout}
        >
          {renderPlayers()}
        </View>
      </View>
    </View>
  
    {/* Alt menü (Formasyon ve Kaydet) */}
    <View style={styles.bottomButtonsContainer}>
      {/* Formasyon Seçimi */}
      <ScrollView
        horizontal
        contentContainerStyle={styles.formationScrollContent}
        showsHorizontalScrollIndicator={false}
      >
        {Object.keys(formations).map((formation) => (
          <TouchableOpacity
            key={formation}
            style={[
              styles.formationButton,
              selectedFormation === formation && styles.selectedFormationButton,
            ]}
            onPress={() => setSelectedFormation(formation)}
          >
            <Text style={[
              styles.formationButtonText,
              selectedFormation === formation && styles.selectedFormationText
            ]}>
              {formation}
            </Text>
          </TouchableOpacity>
        ))}
      <View style={styles.modeSelection}>
        <TouchableOpacity
          style={[styles.modeButton, !isProclubsMode && styles.selectedMode]}
          onPress={() => setIsProclubsMode(false)}
        >
          <Text style={styles.modeButtonText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, isProclubsMode && styles.selectedMode]}
          onPress={() => setIsProclubsMode(true)}
        >
          <Text style={styles.modeButtonText}>Proclubs</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
  
      {/* Kaydet Butonu */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => saveTeamToFirebase(squad, selectedFormation)}
      >
        <Ionicons name="save-outline" size={24} color="white" />
      </TouchableOpacity>
      {isProclubsMode && (
          <TouchableOpacity style={styles.createPlayerButton} onPress={() => setCreatePlayerModal(true)}>
            <Ionicons name="person-add-outline" size={24} color="white" />
          </TouchableOpacity>
        )}
    </View>
    <Modal visible={!!selectedPlayer}>
        <View style={styles.modalContent}>
          <PlayerRequest onSelect={handlePlayerSelect} />
        </View>
      </Modal>

      <Modal visible={createPlayerModal} transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Yeni Oyuncu Oluştur</Text>
      <TextInput
        style={styles.input}
        placeholder="Oyuncu Adı"
        value={newPlayer.name}
        onChangeText={(text) => setNewPlayer({ ...newPlayer, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Overall (1-100)"
        keyboardType="numeric"
        value={newPlayer.overall}
        onChangeText={(text) => setNewPlayer({ ...newPlayer, overall: text })}
      />
      <TouchableOpacity style={styles.createButton} onPress={savePlayerToFirebase}>
        <Text style={styles.createButtonText}>Kaydet</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCreatePlayerModal(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>İptal</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


  </View>
  
  );
};


const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  bottomButtonsContainer: {
    flexDirection: "row", // Yana hizala
    alignItems: "center",
    justifyContent: "center", // Ortada hizala
    width: width * 0.95, // Ekranın genişliğine göre hizala
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute", // Sayfanın en altına yapıştır
    bottom: 10, // Alt boşluğu belirle
    alignSelf: "center", // Ortaya hizala
    gap: 10, // Butonlar arasında boşluk bırak
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },

  createPlayerButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#444",
    borderRadius: 10,
  },

  selectedMode: {
    backgroundColor: "#007AFF",
  },

  modeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  formationScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1, // İçerik taşmasını önle
  },
  
  formationButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  
  selectedFormationButton: {
    backgroundColor: "#007AFF",
  },
  
  formationButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  
  selectedFormationText: {
    color: "white",
  },
   
 
   

  formationSelectorContainer: {
    height: 90, // Daha fazla alan yarat
    backgroundColor: "white",
    zIndex: 100,
    elevation: 10,
    paddingVertical: 10, // Daha iyi hizalama
},
 


  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center"
  },
  
  fieldContainer: {
    flex: 1,
    marginTop: -10, // ScrollView ile overlap'i önle
  },
  formationSelector: {
    maxHeight: 50,
    marginBottom: 20,
    zIndex: 10, // En üstte olacak
  },
  

  player: {
    width: 80,  // Genişlik artırıldı
    height: 80, // Yükseklik artırıldı
    borderRadius: 10, // Oran korundu
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 5,
  },
  
  playerNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoBox: {
    position: 'absolute',
    bottom: 45,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    padding: 4,
    borderRadius: 5,
    width: 80,
    alignItems: 'center',
  },
  infoText: {
    color: "white",
    top:90,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  rectangle: {

    width: width, // Genişlik
    height: height, // Yükseklik
    backgroundColor: 'transparent', // Saha rengi
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scaleY: 0.8 }],
    marginTop: -40

  },
 
 

  arenaBorder: {
    height: height * 1.1,
    width: width * 1.1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    position: 'relative', // EKLENDİ
  },

  modalOverlay: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    height: 800,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '95%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    color: '#666',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }, 
});

export default FootballField;
