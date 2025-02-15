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

// Tür Tanımlamaları
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

const PlayerRequest: React.FC<PlayerRequestProps> = ({ onSelect }) => {
  // State'ler
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Veri Çekme
  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iardnipdeqgxjkduvkwx.supabase.co/storage/v1/object/public/json-files/players_data.json'
      );

      if (!response.ok) throw new Error('Veri alınamadı');
      const jsonData = await response.json();

      if (!Array.isArray(jsonData)) throw new Error('Geçersiz veri formatı');
      setAllPlayers(jsonData);
      setError('');
    } catch (err) {
      setError(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Arama ve Sayfalama
  const filteredPlayers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allPlayers.filter(player =>
      player.player_info.Name.toLowerCase().includes(term) ||
      player.card_name.toLowerCase().includes(term)
    );
  }, [allPlayers, searchTerm]);

  const visiblePlayers = useMemo(() =>
    filteredPlayers.slice(0, page * PAGE_SIZE),
    [filteredPlayers, page]);

  // Yardımcı Fonksiyonlar
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlayers();
  };

  const handleLoadMore = () => {
    if (visiblePlayers.length < filteredPlayers.length) {
      setPage(prev => prev + 1);
    }
  };

  // Render İşlemleri
  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(item)}
    >
      <Image
        source={{ uri: item.images['Player Card'] }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.player_info.Name}</Text>
        <Text style={styles.cardSubtitle}>{item.card_thema}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>OVR: {item.player_info.Overall}</Text>
          <Text style={styles.stat}>POS: {item.player_info.Position}</Text>
        </View>

        <View style={styles.statsGrid}>
          {Object.entries(item.face_stats).map(([key, value]) => (
            <View key={key} style={styles.statItem}>
              <Text style={styles.statLabel}>{key}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Oyuncu ara..."
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

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
          contentContainerStyle={styles.listContainer}
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
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    fontSize: 16,
    elevation: 2,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 3,
    alignItems: 'center',
    position: 'relative', // OVR ve POS için referans noktası olacak
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  ovrContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ovrText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  posText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  cardContent: {
    width: '100%',
    padding: 10,
    alignItems: 'flex-start', // Sol hizalama
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'left',
  },
  faceStatsContainer: {
    position: 'absolute',
    top: 20, // Görselin üstüne çıkması için ayarlandı
    left: '50%',
    transform: [{ translateX: -50 }], // Ortalamak için
    alignItems: 'center',
  },
  faceStat: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 5,
    marginVertical: 2, // Üst üste dizilmesi için
  },
  faceStatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  footerLoader: {
    marginVertical: 20,
  },
  listContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Boşluğu azalttık
  },
  stat: {
    fontSize: 12, // Yazı boyutunu küçülttük
    color: '#444',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    marginBottom: 6, // Boşluğu azalttık
    backgroundColor: '#f1f1f1',
    padding: 4, // Padding'i azalttık
    borderRadius: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

});



export default PlayerRequest;