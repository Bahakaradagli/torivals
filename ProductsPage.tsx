import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './navigationTypes';
import * as Clipboard from 'expo-clipboard';
type Product = {
  id: string;
  productName: string;
  productDescription: string;
  productPrice: string;
  images: string;
  sizes: string; // Comma-separated string for available sizes
};


const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'ProductsPage'>>();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = ref(database, `companies`);
      setLoading(true);
  
      onValue(productsRef, (snapshot) => {
        const companiesData = snapshot.val();
        const allProducts: Product[] = [];
  
        if (companiesData) {
          // Tüm şirketleri dolaşarak turnuvaları topluyoruz
          Object.keys(companiesData).forEach((companyKey) => {
            const tournaments = companiesData[companyKey]?.Tournaments;
  
            if (tournaments) {
              Object.keys(tournaments).forEach((tournamentKey) => {
                const tournamentData = tournaments[tournamentKey];
                allProducts.push({
                  id: tournamentKey,
                  productName: tournamentData.tournamentName || 'Unknown Tournament',
                  productDescription: tournamentData.tournamentDescription || '',
                  productPrice: tournamentData.participationFee || 'N/A',
                  tournamentId: tournamentData.tournamentId || '',
                  sizes: tournamentData.participantCount || '0', // Örnek boyut olarak participantCount
                });
              });
            }
          });
  
          setProducts(allProducts);
        } else {
          setProducts([]);
        }
        setLoading(false);
      });
    };
  
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f39c12" />
      </View>
    );
  }

  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#f39c12" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your product"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
  data={filteredProducts}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => {
    const imageUrls = item.images ? item.images.split(',') : [];

    return (
  <TouchableOpacity
    style={styles.productCard}
    onPress={() => {
      Clipboard.setStringAsync(item.id); // ID'yi kopyala
      alert('ID kopyalandı!'); // Kullanıcıya bilgi ver
    }}
  >
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.tournamentId}
      </Text>
    </View>
  </TouchableOpacity>
    );
  }}
/>



    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
  },
  searchIcon: {
    color: '#f39c12',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  productDescription: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow sizes to wrap to a new line
    maxWidth: '60%',  // Limit width so that price stays on the right
  },
  sizeBox: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  sizeText: {
    color: '#000000',
  },
  priceButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 60, // Set a minimum width to keep it stable
    alignItems: 'center',
  },
  priceButtonText: {
    color: '#000000',
    fontSize: 15,
  },
  moreSizesText: {
    fontSize: 14,
    color: '#ffffff',
    alignSelf: 'center',
  },
  
  

});


export default ProductsPage;
