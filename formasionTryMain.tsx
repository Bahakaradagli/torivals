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

const categoryMap = {
  goalkeeper: 'Goalkeeper',
  defense: 'Defender',
  midfield: 'Midfielder',
  forwards: 'Striker'
};

const formations = {
  "4-4-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.92 },
      defense: [
        { x: 0.2, y: 0.75 }, { x: 0.4, y: 0.75 }, { x: 0.6, y: 0.75 }, { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 }, { x: 0.3, y: 0.55 }, { x: 0.7, y: 0.55 }, { x: 0.9, y: 0.55 }
      ],
      forwards: [
        { x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }
      ]
    }
  },
  "3-5-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.92 },
      defense: [
        { x: 0.3, y: 0.75 }, { x: 0.5, y: 0.75 }, { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 }, { x: 0.3, y: 0.55 }, { x: 0.5, y: 0.55 }, { x: 0.7, y: 0.55 }, { x: 0.9, y: 0.55 }
      ],
      forwards: [
        { x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }
      ]
    }
  },
  "4-3-3": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.92 },
      defense: [
        { x: 0.2, y: 0.75 }, { x: 0.4, y: 0.75 }, { x: 0.6, y: 0.75 }, { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 }, { x: 0.5, y: 0.55 }, { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.2, y: 0.3 }, { x: 0.5, y: 0.3 }, { x: 0.8, y: 0.3 }
      ]
    }
  },
  "5-3-2": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.92 },
      defense: [
        { x: 0.15, y: 0.75 }, { x: 0.3, y: 0.75 }, { x: 0.5, y: 0.75 }, { x: 0.7, y: 0.75 }, { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 }, { x: 0.5, y: 0.55 }, { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }
      ]
    }
  },
  "4-2-4": {
    positions: {
      goalkeeper: { x: 0.5, y: 0.92 },
      defense: [
        { x: 0.2, y: 0.75 }, { x: 0.4, y: 0.75 }, { x: 0.6, y: 0.75 }, { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 }, { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.1, y: 0.3 }, { x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.9, y: 0.3 }
      ]
    }
  }
};

const FootballField = () => {
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [squad, setSquad] = useState({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: [],
  });

  const onFieldLayout = useCallback(event => {
    const { width, height } = event.nativeEvent.layout;
    setFieldDimensions({ width, height });
  }, []);

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
            onPress={() => setSelectedPlayer({
              number: index + 1,
              category: category,
              positionIndex: index,
              position: `${(pos.x * 100).toFixed(1)}%, ${(pos.y * 100).toFixed(1)}%`
            })}
            style={[
              styles.player,
              {
                left: pos.x * fieldDimensions.width - 20, // Adjust for player size (40x40)
                top: pos.y * fieldDimensions.height - 20,
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
                {categoryMap[category]}
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
      {/* Formasyon seçiciyi ekranın üstünde sabitle */}
      <View style={styles.formationSelectorContainer}>
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
        </ScrollView>
      </View>


      <View style={styles.rectangle}>
        <View style={styles.spectatorArea}>
          <View style={styles.spectators}></View>
        </View>
        <View style={styles.arenaBorderOval}>
          <View
            style={styles.arenaBorder}
            onLayout={onFieldLayout}
          >
            <View style={styles.arenaMiddleCircle}></View>
            <View style={styles.centerLine}></View>
            <View style={[styles.penaltyBox, styles.upPenaltyBox]}></View>
            <View style={[styles.penaltyBox, styles.downPenaltyBox]}></View>
            {renderPlayers()}
          </View>
        </View>
      </View>
      {/* Oyuncu Detay Modalı */}
      <Modal visible={!!selectedPlayer}>
        <View style={styles.modalContent}>
          <PlayerRequest
            onSelect={(card) => {
              if (selectedPlayer) {
                const { category, positionIndex } = selectedPlayer;
                setSquad(prev => {
                  const newSquad = { ...prev };
                  if (category === 'goalkeeper') {
                    newSquad.goalkeeper = card;
                  } else {
                    const positions = [...newSquad[category]];
                    positions[positionIndex] = card;
                    newSquad[category] = positions;
                  }
                  return newSquad;
                });
                setSelectedPlayer(null);
              }
            }}
          />
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  formationSelectorContainer: {
    height: 70, // Sabit yükseklikW
    backgroundColor: "white", // Arkaplan rengi
    zIndex: 100, // En yüksek katman
    elevation: 10, // Android için gölge
  },
  formationScrollContent: {
    paddingHorizontal: 1,
    alignItems: "center",
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
  formationButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
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
  },
  selectedFormationText: {
    color: "white",
  },
  field: {
    flex: 1,
    backgroundColor: "#4CAF50",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    position: "relative",
    zIndex: 1, // Saha en altta
  },
  player: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 5,
    width: 80,
    alignItems: 'center',
  },
  infoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  rectangle: {
    width: width, // Genişlik
    height: height, // Yükseklik
    backgroundColor: 'white', // Saha rengi
    justifyContent: "center",
    alignItems: "center",
  },
  spectatorArea: {
    position: 'absolute',
    width: width * 0.98,
    height: height * 0.92,
    backgroundColor: '#1A1E24', // Seyirci alanı arka plan rengi
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 140,
  },
  spectators: {
    width: width * 0.9,
    height: height * 0.85,
    backgroundColor: '#3E434F', // Seyirci grupları rengi
    borderRadius: 130,
  },
  arenaBorderOval: {
    position: 'absolute',
    width: width * 0.85,
    height: height * 0.8,
    backgroundColor: '#2C333D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 120,
  },
  arenaBorder: {
    height: height * 0.7,
    width: width * 0.75,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    position: 'relative', // EKLENDİ
  },
  arenaMiddleCircle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
  },
  centerLine: {
    width: width * 0.75,
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
  },
  penaltyBox: {
    width: width * 0.3,
    height: height * 0.08,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
  },
  upPenaltyBox: {
    top: 0,
  },
  downPenaltyBox: {
    bottom: 0,
  },
  // Yeni eklenen modal stilleri
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
