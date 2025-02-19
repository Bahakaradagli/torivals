import React, { useState, useEffect } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const { width, height } = Dimensions.get("window");

const categoryMap = {
  goalkeeper: "Goalkeeper",
  defense: "Defender",
  midfield: "Midfielder",
  forwards: "Striker"
};

const formations = {
  "4-4-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.87 }],
      defense: [
        { x: 0.2, y: 0.70 },
        { x: 0.4, y: 0.70 },
        { x: 0.6, y: 0.70 },
        { x: 0.8, y: 0.70 }
      ],
      midfield: [
        { x: 0.1, y: 0.50 },
        { x: 0.3, y: 0.50 },
        { x: 0.7, y: 0.50 },
        { x: 0.9, y: 0.50 }
      ],
      forwards: [
        { x: 0.3, y: 0.25 },
        { x: 0.7, y: 0.25 }
      ]
    }
  },
  "3-5-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.87 }],
      defense: [
        { x: 0.3, y: 0.70 },
        { x: 0.5, y: 0.70 },
        { x: 0.7, y: 0.70 }
      ],
      midfield: [
        { x: 0.1, y: 0.50 },
        { x: 0.3, y: 0.50 },
        { x: 0.5, y: 0.50 },
        { x: 0.7, y: 0.50 },
        { x: 0.9, y: 0.50 }
      ],
      forwards: [
        { x: 0.3, y: 0.25 },
        { x: 0.7, y: 0.25 }
      ]
    }
  },
  "4-3-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.87 }],
      defense: [
        { x: 0.2, y: 0.70 },
        { x: 0.4, y: 0.70 },
        { x: 0.6, y: 0.70 },
        { x: 0.8, y: 0.70 }
      ],
      midfield: [
        { x: 0.3, y: 0.50 },
        { x: 0.5, y: 0.50 },
        { x: 0.7, y: 0.50 }
      ],
      forwards: [
        { x: 0.2, y: 0.25 },
        { x: 0.5, y: 0.25 },
        { x: 0.8, y: 0.25 }
      ]
    }
  },
  "5-3-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.80 }],
      defense: [
        { x: 0.15, y: 0.55 },
        { x: 0.3, y: 0.65 },
        { x: 0.5, y: 0.675 },
        { x: 0.7, y: 0.65 },
        { x: 0.85, y: 0.55 }
      ],
      midfield: [
        { x: 0.3, y: 0.45 },
        { x: 0.5, y: 0.50 },
        { x: 0.7, y: 0.45 }
      ],
      forwards: [
        { x: 0.3, y: 0.25 },
        { x: 0.7, y: 0.25 }
      ]
    }
  },
  "4-2-4": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.87 }],
      defense: [
        { x: 0.2, y: 0.70 },
        { x: 0.4, y: 0.70 },
        { x: 0.6, y: 0.70 },
        { x: 0.8, y: 0.70 }
      ],
      midfield: [
        { x: 0.3, y: 0.50 },
        { x: 0.7, y: 0.50 }
      ],
      forwards: [
        { x: 0.1, y: 0.25 },
        { x: 0.3, y: 0.25 },
        { x: 0.7, y: 0.25 },
        { x: 0.9, y: 0.25 }
      ]
    }
  }
};

// Yardımcı: Kaydedilen pozisyon string'ine göre kategori belirleme
const getCategoryFromPosition = (pos: string | undefined) => {
  if (!pos) return null;
  const lower = pos.toLowerCase();
  if (lower.includes("kaleci")) return "goalkeeper";
  if (lower.includes("defans")) return "defense";
  if (lower.includes("orta")) return "midfield";
  if (lower.includes("forvet") || lower.includes("fotvet")) return "forwards";
  return null;
};

const FootballField = () => {
  const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [isProclubsMode, setIsProclubsMode] = useState(false);
  const [normalSquad, setNormalSquad] = useState({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: []
  });
  const [proclubsSquad, setProclubsSquad] = useState({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: []
  });
  const SCALE_FACTOR = 0.6;
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    overall: "50",
    position: "",
    cardName: "",
    cardThema: "",
    playerImage: ""
  });
  const [createPlayerModal, setCreatePlayerModal] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();

  // Aktif takımı seç
  const activeSquad = isProclubsMode ? proclubsSquad : normalSquad;
  const setActiveSquad = isProclubsMode ? setProclubsSquad : setNormalSquad;

  // Firebase'den takım yükle
  const loadTeamFromFirebase = async (isProclub: boolean) => {
    if (!user) return;
    const teamRef = isProclub
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);
      
    try {
      const snapshot = await get(teamRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newSquadState = { goalkeeper: null, defense: [], midfield: [], forwards: [] };
        
        if (data.Players) {
          const playersArray = Object.values(data.Players);
          playersArray.forEach((player: any) => {
            const posStr = isProclub ? player?.position : player?.player_info?.Position;
            const category = getCategoryFromPosition(posStr);
            if (category) {
              if (category === "goalkeeper") {
                newSquadState.goalkeeper = player;
              } else {
                newSquadState[category].push(player);
              }
            }
          });
        }
        
        if (isProclub) {
          setProclubsSquad(newSquadState);
          setSelectedFormation(data.formation || "4-4-2");
        } else {
          setNormalSquad(newSquadState);
          setSelectedFormation(data.formation || "4-4-2");
        }
      }
    } catch (error) {
      console.error("Error loading team:", error);
    }
  };

  useEffect(() => {
    loadTeamFromFirebase(isProclubsMode);
  }, [isProclubsMode, user]);

  // Takımı Firebase'e kaydet
  const saveTeamToFirebase = async (squadData: any) => {
    if (!user) return;

    const teamRef = isProclubsMode
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);

    const allPlayers = [
      squadData.goalkeeper,
      ...squadData.defense,
      ...squadData.midfield,
      ...squadData.forwards
    ].filter(Boolean);

    const teamData = {
      formation: selectedFormation,
      Players: allPlayers.reduce((acc: any, player, index) => {
        acc[`Player${index + 1}`] = isProclubsMode ? {
          ...player,
          overall: parseInt(player.overall, 10)
        } : player;
        return acc;
      }, {})
    };

    try {
      await set(teamRef, teamData);
      console.log("Takım başarıyla kaydedildi!");
      loadTeamFromFirebase(isProclubsMode);
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  // Oyuncu seçim işlemleri
  const handlePlayerSelect = (card: any) => {
    const updatedSquad = { ...activeSquad };
    if (selectedPlayer.category === "goalkeeper") {
      updatedSquad.goalkeeper = card;
    } else {
      const categoryArray = [...updatedSquad[selectedPlayer.category]];
      categoryArray[selectedPlayer.positionIndex] = card;
      updatedSquad[selectedPlayer.category] = categoryArray;
    }
    setActiveSquad(updatedSquad);
    setSelectedPlayer(null);
  };

  // Pro Clubs için oyuncu oluşturma
  const handleCreateProclubsPlayer = () => {
    const newPlayerData = {
      ...newPlayer,
      overall: parseInt(newPlayer.overall, 10)
    };

    const updatedSquad = { ...proclubsSquad };
    if (selectedPosition?.category === "goalkeeper") {
      updatedSquad.goalkeeper = newPlayerData;
    } else {
      updatedSquad[selectedPosition.category][selectedPosition.index] = newPlayerData;
    }
    
    setProclubsSquad(updatedSquad);
    setCreatePlayerModal(false);
    setNewPlayer({ name: "", overall: "50", position: "", cardName: "", cardThema: "", playerImage: "" });
    setSelectedPosition(null);
  };

  const savePlayerToFirebaseForProclubs = () => {
    handleCreateProclubsPlayer();
  };

  // Yeni oyuncu veya oyuncu değiştirme işlemi için pozisyon seçimi
  const handlePlayerPress = (category: string, index: number) => {
    if (isProclubsMode) {
      setSelectedPosition({ category, index });
      setCreatePlayerModal(true);
    } else {
      setSelectedPlayer({ category, positionIndex: index });
    }
  };

  // Sahanın ölçülerini belirlemek için onLayout
  const onFieldLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setFieldDimensions({ width, height });
  };

  const renderPlayers = () => {
    if (!fieldDimensions.width || !fieldDimensions.height) return null;
    const formation = formations[selectedFormation].positions;
    const playerCardWidth = 60 * 1.4;
    const playerCardHeight = 80 * 1.4;
    const halfWidth = playerCardWidth / 2;
    const halfHeight = playerCardHeight / 2;
    const generatePositions = (positions: any, category: string) => {
      return positions.map((pos: any, index: number) => {
        const playerData = category === "goalkeeper" ? activeSquad.goalkeeper : activeSquad[category][index];
        return (
          <TouchableOpacity
            key={`${category}-${index}`}
            onPress={() => handlePlayerPress(category, index)}
            style={[
              styles.player,
              {
                left: pos.x * fieldDimensions.width * SCALE_FACTOR - halfWidth,
                top: pos.y * fieldDimensions.height * SCALE_FACTOR - halfHeight,
                transform: [{ scale: SCALE_FACTOR }]
              }
            ]}
          >
            {isProclubsMode ? (
              playerData && playerData.overall ? (
                <Text style={styles.playerNumber}>{playerData.overall}</Text>
              ) : (
                <Ionicons name="person-add-outline" size={24} color="white" />
              )
            ) : (
              <Text style={styles.playerNumber}>
                {playerData?.player_info?.Overall || index + 1}
              </Text>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {isProclubsMode
                  ? playerData?.name || `Player ${index + 1}`
                  : playerData?.player_info?.Name || `Player ${index + 1}`}
              </Text>
              <Text style={styles.infoText}>
                {isProclubsMode
                  ? playerData?.position || categoryMap[category]
                  : playerData?.player_info?.Position || categoryMap[category]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });
    };
    return (
      <>
        {generatePositions(formations[selectedFormation].positions.goalkeeper, "goalkeeper")}
        {generatePositions(formations[selectedFormation].positions.defense, "defense")}
        {generatePositions(formations[selectedFormation].positions.midfield, "midfield")}
        {generatePositions(formations[selectedFormation].positions.forwards, "forwards")}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Üstte formation & mod seçimi */}
      <View style={styles.topBar}>
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
                selectedFormation === formation && styles.selectedFormationButton
              ]}
              onPress={() => {
                // Sadece formation local state güncellensin.
                setSelectedFormation(formation);
              }}
            >
              <Text style={styles.formationButtonText}>{formation}</Text>
              {selectedFormation === formation && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="white"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[styles.modeSelection, { marginTop: 20 }]}>
          <TouchableOpacity
            style={[styles.modeButton, !isProclubsMode && styles.selectedMode]}
            onPress={() => {
              setIsProclubsMode(false);
              loadTeamFromFirebase(false);
            }}
          >
            <Text style={styles.modeButtonText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, isProclubsMode && styles.selectedMode]}
            onPress={() => {
              setIsProclubsMode(true);
              loadTeamFromFirebase(true);
            }}
          >
            <Text style={styles.modeButtonText}>Proclubs</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Saha ve oyuncular */}
      <View style={styles.rectangle}>
        <View style={styles.arenaBorder} onLayout={onFieldLayout}>
          {renderPlayers()}
        </View>
      </View>
      {/* Alt kaydet & oyuncu ekle butonları */}
      {/* Kaydetme butonu */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          onPress={() => saveTeamToFirebase(activeSquad)}
          style={styles.saveButton}
        >
          <Text>Takımı Kaydet</Text>
        </TouchableOpacity>
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
            <TextInput
              style={styles.input}
              placeholder="Pozisyon"
              value={newPlayer.position}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, position: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Kart Adı"
              value={newPlayer.cardName}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, cardName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Kart Teması"
              value={newPlayer.cardThema}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, cardThema: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Oyuncu Resmi URL"
              value={newPlayer.playerImage}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, playerImage: text })}
            />
            <TouchableOpacity style={styles.createButton} onPress={savePlayerToFirebaseForProclubs}>
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
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderColor: "#2E5EAA"
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  saveButton: {
    backgroundColor: "#2E5EAA",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#444",
    borderRadius: 10
  },
  selectedMode: {
    backgroundColor: "#007AFF"
  },
  modeButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  formationScrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  formationButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#e0e0e0"
  },
  selectedFormationButton: {
    backgroundColor: "#007AFF"
  },
  formationButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 10
  },
  rectangle: {
    width: width * 0.9,
    height: height * 0.65,
    alignSelf: "center",
    backgroundColor: "#2D5F2A",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
    transform: [{ scale: 0.9 }]
  },
  arenaBorder: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  modalOverlay: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    height: 800,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "95%"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center"
  },
  infoBox: {
    position: "absolute",
    bottom: 45,
    padding: 4,
    borderRadius: 5,
    width: 80,
    alignItems: "center"
  },
  infoText: {
    color: "white",
    top: 90,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center"
  },
  player: {
    width: 60 * 1.4,
    height: 80 * 1.4,
    borderRadius: 10,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    backgroundColor: "#2E5EAA",
    borderColor: "#fff",
    borderWidth: 1
  },
  playerNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  topBar: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3
  },
  bottomActionBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    position: "absolute",
    bottom: 20,
    alignSelf: "center"
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8
  },
  modeSelection: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10
  }
});

export default FootballField;
