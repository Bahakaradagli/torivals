import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

interface PlayerInfo {
  Name: string;
  Overall: string;
  Position: string;
  'Alternative Positions': string[];
  'Skill Moves': string;
  'Weak Foot': string;
  'Strong Foot': string;
}

interface FaceStats {
  Pace: number;
  Shooting: number;
  Passing: number;
  Dribbling: number;
  Defending: number;
  Physicality: number;
}

export interface Player {
  card_name: string;
  card_thema: string;
  player_info: PlayerInfo;
  face_stats: FaceStats;
  images: {
    'Player Card': string;
  };
}

interface PlayerRequestProps {
  onSelect: (player: Player) => void;
}

const PAGE_SIZE = 15;

// Kart tema–renk eşleşmeleri
const cardThemeColors: { [key: string]: string } = {
  "Special Item": "#FFFFFF",
  "Grassroot Greats Evolution": "#008000",
  "Grassroot Greats Hero": "#006400",
  "Grassroot Greats Icon": "#32CD32",
  "Grassroot Greats": "#228B22",
  "FC Pro Open Champion ICON": "#8B0000",
  "Future Stars Academy Icon": "#FFD700",
  "Future Stars Evolution": "#FF69B4",
  "Future Stars Icon": "#FF1493",
  "Future Stars": "#DB7093",
  "UEFA Conference League RTTF": "#0000FF",
  "UEFA Europa League RTTF": "#FF4500",
  "UEFA Women's Champions League RTTF": "#800080",
  "TOTY Honourable Mentions": "#1E90FF",
  "TOTY Icon": "#FFD700",
  "TOTY Eras 2002 ICON": "#DAA520",
  "TOTY Evolution": "#4682B4",
  "NumeroFUT": "#FFA500",
  "Winter Wildcards Evolution": "#A52A2A",
  "Winter Wildcards Icon": "#8B4513",
  "Winter Wildcards Hero": "#D2691E",
  "Ultimate Cover Star": "#FF4500",
  "Ultimate Succession Icon": "#FFD700",
  "Ultimate Succession Hero": "#FFA500",
  "Ultimate Succession": "#FF8C00",
  "Globetrotters": "#2E8B57",
  "Champions Mastery": "#00008B",
  "Mode Mastery": "#8A2BE2",
  "Squad Battles Mastery": "#7B68EE",
  "Rivals Mastery": "#4B0082",
  "Thunderstruck ICON": "#FF0000",
  "Thunderstruck": "#DC143C",
  "Winter Champions": "#00BFFF",
  "FC Pro Live": "#00CED1",
  "On This Day Icon": "#FFD700",
  "Track Stars Hero": "#C71585",
  "Track Stars": "#800000",
  "Centurions Icon": "#8B0000",
  "Ballon d'Or": "#FFD700",
  "Centurions Evolution": "#8B4513",
  "Centurions": "#D2691E",
  "On This Day Hero": "#FF4500",
  "Trailblazers": "#B22222",
  "Liga F POTM": "#FF69B4",
  "Bundesliga POTM": "#DC143C",
  "Purple Evo": "#800080",
  "Total Rush": "#FF4500",
  "Dynamic Duos": "#00FA9A",
  "UCL Road to the Final": "#0000CD",
  "Legendary": "#FFD700",
  "Standard": "#808080",
  "Winter Wildcards": "#A52A2A",
  "POTM EREDIVISIE": "#008000",
  "POTM SERIE A": "#0000FF",
  "UECL Road to the Knockouts": "#8B008B",
  "Ultimate": "#FF4500",
  "Premium": "#FFD700",
  "Vintage": "#8B4513",
  "Epic": "#DC143C",
  "World Tour": "#4169E1",
  "Moments": "#DAA520",
  "SQUAD FOUNDATIONS": "#2F4F4F",
  "POTM LALIGA EA SPORTS": "#8B0000",
  "POTM Ligue 1": "#1E90FF",
  "UT Heroes": "#FF8C00",
  "SHOWDOWN": "#FF4500",
  "Showdown Plus": "#DC143C",
  "Select": "#4B0082",
  "Flashback Player": "#8B4513",
  "UCL Road to the Knockouts": "#0000CD",
  "UEL Road to the Knockouts": "#FF4500",
  "POTM Premier League": "#800080",
  "POTM Bundesliga": "#DC143C",
  "UWCL Road to the Knockouts": "#1E90FF",
  "End Of An Era": "#4682B4",
  "Squad Building Challenge": "#00CED1",
  "Ones to Watch": "#FF8C00",
  "Ultimate Team Champions": "#FFD700",
  "Ultimate Team Champions Pro": "#FF4500",
  "Pro Player": "#DAA520",
  "Domestic Man of the Match": "#B22222",
  "Team of the Year": "#FFD700",
  "Evolutions III": "#008080",
  "Evolutions II": "#20B2AA",
  "Evolutions I": "#2E8B57",
  "In-Progress Evolution": "#808000",
  "Prime Hero": "#FF8C00",
  "Origin Hero": "#FF4500",
  "Icon": "#FFD700",
  "Team of the Week": "#000000",
  "Rare": "#FF69B4",
  "Common": "#C0C0C0",
  "Bronze Common": "#CD853F",
  "Bronze Rare": "#8B4513",
  "Silver Common": "#C0C0C0",
  "Silver Rare": "#A9A9A9"
};

// Koyulaştırma fonksiyonu: Verilen hex renkten istenen yüzde kadar daha koyu renk üretir.
const darkenColor = (hex: string, percent: number): string => {
  const sanitizedHex = hex.replace('#', '');
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);

  const newR = Math.floor(r * (1 - percent / 100));
  const newG = Math.floor(g * (1 - percent / 100));
  const newB = Math.floor(b * (1 - percent / 100));

  return (
    '#' +
    [newR, newG, newB]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  );
};

const PlayerRequest: React.FC<PlayerRequestProps> = ({ onSelect }) => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iardnipdeqgxjkduvkwx.supabase.co/storage/v1/object/public/json-files//players_data.json'
      );
      if (!response.ok) throw new Error('Veri alınamadı');
      const jsonData = await response.json();
      if (!Array.isArray(jsonData)) throw new Error('Geçersiz veri formatı');
      setAllPlayers(jsonData);
      setError('');
    } catch (err: any) {
      setError(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const filteredPlayers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allPlayers.filter(
      (player) =>
        player.player_info.Name.toLowerCase().includes(term) ||
        player.card_name.toLowerCase().includes(term)
    );
  }, [allPlayers, searchTerm]);

  const visiblePlayers = useMemo(
    () => filteredPlayers.slice(0, page * PAGE_SIZE),
    [filteredPlayers, page]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlayers();
  };

  const handleLoadMore = () => {
    if (visiblePlayers.length < filteredPlayers.length) {
      setPage((prev) => prev + 1);
    }
  };

  const renderPlayerItem = ({ item }: { item: Player }) => {
    const cardBgColor = cardThemeColors[item.card_thema] || '#fff';
    const statBoxBgColor = darkenColor(cardBgColor, 20); // %20 daha koyu

    const stats = [
      { label: 'PAC', value: item.face_stats.Pace },
      { label: 'SHO', value: item.face_stats.Shooting },
      { label: 'PAS', value: item.face_stats.Passing },
      { label: 'DRI', value: item.face_stats.Dribbling },
      { label: 'DEF', value: item.face_stats.Defending },
      { label: 'PHY', value: item.face_stats.Physicality },
    ];

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: cardBgColor },
        ]}
        onPress={() => onSelect(item)}
      >
        <Image
          source={{ uri: item.images['Player Card'] }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <View style={styles.infoTop}>
            <Text style={[styles.cardTitle, styles.outlinedText]}>
              {item.player_info.Name}
            </Text>
            <Text style={[styles.cardSubtitle, styles.outlinedText]}>
              {item.card_thema}
            </Text>
            <Text style={[styles.stat, styles.outlinedText]}>
              OVR: {item.player_info.Overall}
            </Text>
          </View>
          <Text style={[styles.stat, styles.outlinedText]}>
            POS: {item.player_info.Position}
          </Text>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statBox, { backgroundColor: statBoxBgColor }]}
            >
              <Text style={[styles.statBoxLabel, styles.outlinedText]}>
                {stat.label}
              </Text>
              <Text style={[styles.statBoxValue, styles.outlinedText]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Oyuncu ara..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity onPress={() => setSearchTerm('')}>
          <Text style={styles.clearIcon}>×</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPlayers}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visiblePlayers}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => item.card_name}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            visiblePlayers.length < filteredPlayers.length ? (
              <ActivityIndicator size="small" style={styles.footerLoader} />
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    fontSize: 20,
    color: '#888',
    paddingHorizontal: 5,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 10,
  },
  retryText: {
    color: '#0d6efd',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginVertical: 6,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
  },
  infoTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    marginRight: 5,
  },
  stat: {
    fontSize: 12,
  },
  outlinedText: {
    color: 'black',
    textShadowColor: 'white',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  statsGrid: {
    width: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '30%',
    aspectRatio: 1, // Kare şeklinde olması için
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statBoxValue: {
    fontSize: 12,
  },
  footerLoader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default PlayerRequest;
