import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Dimensions,
  ScrollView
} from "react-native";
import PlayerRequest from "./API/footbalPlayerRequest";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const { width, height } = Dimensions.get("window");

// Formation definitions with positions
const formations = {
  "4-4-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 },
        { x: 0.3, y: 0.55 },
        { x: 0.7, y: 0.55 },
        { x: 0.9, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "3-5-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 },
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 },
        { x: 0.9, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-3-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.15, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.85, y: 0.3 }
      ]
    }
  },
  "5-3-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.1, y: 0.65 },
        { x: 0.25, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.75, y: 0.75 },
        { x: 0.9, y: 0.65 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-2-4": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.1, y: 0.3 },
        { x: 0.3, y: 0.3 },
        { x: 0.7, y: 0.3 },
        { x: 0.9, y: 0.3 }
      ]
    }
  }
};

// Category mapping for player positions
const categoryMap = {
  goalkeeper: "Goalkeeper",
  defense: "Defender",
  midfield: "Midfielder",
  forwards: "Striker"
};

// Helper function to determine category from position string
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
  const [showFormationDropdown, setShowFormationDropdown] = useState(false);
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

  // State for player selection and creation
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

  // Active squad based on mode
  const activeSquad = isProclubsMode ? proclubsSquad : normalSquad;
  const setActiveSquad = isProclubsMode ? setProclubsSquad : setNormalSquad;

  // Load team data from Firebase
  const loadTeamFromFirebase = async (isProclub: boolean) => {
    if (!user) return;
    const teamRef = isProclub
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);

    try {
      const snapshot = await get(teamRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.squad) {
          if (isProclub) {
            setProclubsSquad(data.squad);
          } else {
            setNormalSquad(data.squad);
          }
        }
        setSelectedFormation(data.formation || "4-4-2");
      }
    } catch (error) {
      console.error("Error loading team:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTeamFromFirebase(false);
      loadTeamFromFirebase(true);
    }
  }, [user]);

  // Save team data to Firebase
  const saveTeamToFirebase = async (squadData: any) => {
    if (!user) return;

    const teamRef = isProclubsMode
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);

    const teamData = {
      formation: selectedFormation,
      squad: squadData,
    };

    try {
      await set(teamRef, teamData);
      console.log("Takım başarıyla kaydedildi!");
      loadTeamFromFirebase(isProclubsMode);
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  // Handle player selection from the list
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

  // Create player for Proclubs mode
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

  // Handle player press for selecting or creating a player
  const handlePlayerPress = (category: string, index: number) => {
    if (isProclubsMode) {
      setSelectedPosition({ category, index });
      setCreatePlayerModal(true);
    } else {
      setSelectedPlayer({ category, positionIndex: index });
    }
  };

  // Get field dimensions on layout
  const onFieldLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setFieldDimensions({ width, height });
  };

  // Render players on the field
  const renderPlayers = () => {
    if (!fieldDimensions.width || !fieldDimensions.height) return null;

    const playerCardWidth = 42 * (2 / 3);
    const playerCardHeight = 56 * (2 / 3);
    const halfWidth = playerCardWidth / 2;
    const halfHeight = playerCardHeight / 2;

    const formation = formations[selectedFormation].positions;

    const generatePositions = (positions: any, category: string) => {
      return positions.map((pos: any, index: number) => {
        const playerData =
          category === "goalkeeper"
            ? activeSquad.goalkeeper
            : activeSquad[category][index];

        return (
          <TouchableOpacity
            key={`${category}-${index}`}
            onPress={() => handlePlayerPress(category, index)}
            style={[
              styles.player,
              {
                left: pos.x * fieldDimensions.width - halfWidth,
                top: pos.y * fieldDimensions.height - halfHeight - 70
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
        {generatePositions(formation.goalkeeper, "goalkeeper")}
        {generatePositions(formation.defense, "defense")}
        {generatePositions(formation.midfield, "midfield")}
        {generatePositions(formation.forwards, "forwards")}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar with formation dropdown and mode selection */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowFormationDropdown(!showFormationDropdown)}
        >
          <Text style={styles.dropdownButtonText}>{selectedFormation}</Text>
          <Ionicons name={showFormationDropdown ? "chevron-up" : "chevron-down"} size={20} color="white" />
        </TouchableOpacity>
        {showFormationDropdown && (
          <View style={styles.dropdown}>
            {Object.keys(formations).map((formation) => (
              <TouchableOpacity
                key={formation}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedFormation(formation);
                  setShowFormationDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{formation}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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

      {/* Field rectangle and players */}
      <View style={styles.rectangle}>
        <View style={styles.arenaBorder} onLayout={onFieldLayout}>
          {renderPlayers()}
        </View>
      </View>

      {/* Bottom action bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          onPress={() => saveTeamToFirebase(activeSquad)}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Takımı Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for player selection */}
      <Modal visible={!!selectedPlayer} animationType="slide">
        <View style={styles.modalContent}>
          <PlayerRequest onSelect={handlePlayerSelect} />
        </View>
      </Modal>

      {/* Modal for creating a new player in Proclubs mode */}
      <Modal visible={createPlayerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Oyuncu Oluştur</Text>
            <TextInput
              style={styles.input}
              placeholder="Oyuncu Adı"
              placeholderTextColor="#ccc"
              value={newPlayer.name}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Overall (1-100)"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={newPlayer.overall}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, overall: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pozisyon"
              placeholderTextColor="#ccc"
              value={newPlayer.position}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, position: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Kart Adı"
              placeholderTextColor="#ccc"
              value={newPlayer.cardName}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, cardName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Kart Teması"
              placeholderTextColor="#ccc"
              value={newPlayer.cardThema}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, cardThema: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Oyuncu Resmi URL"
              placeholderTextColor="#ccc"
              value={newPlayer.playerImage}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, playerImage: text })}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={savePlayerToFirebaseForProclubs}
            >
              <Text style={styles.createButtonText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCreatePlayerModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 10
  },
  topBar: {
    backgroundColor: "#2C2C2C",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 3
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#444",
    borderRadius: 8
  },
  dropdownButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  dropdown: {
    backgroundColor: "#333",
    borderRadius: 8,
    marginTop: 5,
    overflow: "hidden"
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444"
  },
  dropdownItemText: {
    color: "white",
    fontSize: 16
  },
  modeSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20
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
  rectangle: {
    width: width * 0.95,
    height: height * 0.60,
    alignSelf: "center",
    backgroundColor: "#2D5F2A",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden"
  },
  arenaBorder: {
    width: width * 0.95,
    height: height * 0.60,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  player: {
    width: 42 * (2 / 3),
    height: 56 * (2 / 3),
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
  bottomActionBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center"
  },
  saveButton: {
    backgroundColor: "#2E5EAA",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "95%",
    maxHeight: "90%"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    width: "100%",
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderColor: "#2E5EAA",
    color: "white"
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
  closeButton: {
    marginTop: 10,
    alignItems: "center"
  },
  closeButtonText: {
    color: "#333"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default FootballField;