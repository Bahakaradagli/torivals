import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './navigationTypes';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const ProductDetails = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const { product } = route.params;

  const [currentTab, setCurrentTab] = useState("productInfo");
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 3;
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch product details from the database
    const fetchProductData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const db = getDatabase();
        const productRef = ref(db, `companies/${user.uid}/ZZZProducts/${product.productName}`);

        onValue(productRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.sizes) {
            setAvailableSizes(data.sizes.split(',').map(size => size.trim())); // Set available sizes
          }
        });
      }
    };

    fetchProductData();
  }, [product.productName]);

  // Toggle size status and update Firebase
  const handleSizeToggle = (size: string) => {
    setAvailableSizes(prevSizes => {
      const updatedSizes = prevSizes.includes(size)
        ? prevSizes.filter(s => s !== size) // Remove size if already selected
        : [...prevSizes, size]; // Add size if not already selected

      // Update the database
      const user = getAuth().currentUser;
      if (user) {
        const productRef = ref(getDatabase(), `companies/${user.uid}/ZZZProducts/${product.productName}`);
        update(productRef, { sizes: updatedSizes.join(',') })
          .then(() => console.log('Sizes updated successfully'))
          .catch(error => console.error('Error updating sizes:', error));
      }

      return updatedSizes;
    });
  };

  const imageUrls = product.images ? product.images.split(',') : [];

  return (
    <ScrollView style={styles.container}>


      <View style={styles.imageCarouselContainer}>
        <FlatList
          data={imageUrls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={[styles.productImage, { width: screenWidth }]} />
          )}
        />
      </View>

      <View style={styles.tabContainer}>
        {["productInfo", "campaigns", "orderInfo"].map((tab, index) => (
          <TouchableOpacity key={tab} onPress={() => handleTabPress(tab, index)} style={[styles.tab, { width: tabWidth }]}>
            <Text style={[styles.tabText, currentTab === tab && styles.activeTabText]}>
              {tab === "productInfo" ? "Ürün Bilgisi" : tab === "campaigns" ? "Kampanyalar" : "Sipariş Bilgisi"}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View style={[styles.underline, { left: underlinePosition, width: tabWidth }]} />
      </View>

      {currentTab === "productInfo" && (
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.productName}</Text>
          <Text style={styles.sectionHeader}>Ürün Açıklaması</Text>
          <Text style={styles.productDescription}>{product.productDescription}</Text>

          <Text style={styles.sectionHeader}>Stok Durumu</Text>
          <View style={styles.sizeContainer}>
            {["7-9", "9-12", "XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => handleSizeToggle(size)}
                style={[
                  styles.sizeButton,
                  availableSizes.includes(size) ? styles.sizeButtonActive : styles.sizeButtonInactive,
                ]}
              >
                <Text style={availableSizes.includes(size) ? styles.sizeTextActive : styles.sizeTextInactive}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeader}>Ürün Renkleri</Text>
          <View style={styles.colorContainer}>
            <View style={[styles.colorDot, { backgroundColor: '#5D4037' }]} />
            <View style={[styles.colorDot, { backgroundColor: '#8D6E63' }]} />
            <View style={[styles.colorDot, { backgroundColor: '#D7CCC8' }]} />
          </View>

          <Text style={styles.sectionHeader}>Ürün Dokusu</Text>
          <Text style={styles.productTexture}>{product.productTexture}</Text>
          <Text style={styles.price}>Fiyat: {product.productPrice}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#000', flex: 1 },
  backButton: { position: 'absolute', top: 40, left: 16, zIndex: 1 },
  imageCarouselContainer: { width: '100%', height: 250, marginBottom: 16 },
  productImage: { height: '100%', resizeMode: 'cover' },
  tabContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginLeft: -15,
  },
  tab: { alignItems: 'center', paddingVertical: 8 },
  tabText: { fontSize: 16, color: '#888' },
  activeTabText: { color: '#f39c12' },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#f39c12',
  },
  infoContainer: { paddingHorizontal: 16, paddingTop: 16 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  sectionHeader: { fontSize: 12, color: '#f39c12', marginTop: 16, marginBottom: 5 },
  productDescription: { fontSize: 16, color: '#ccc', marginBottom: 8, lineHeight: 22 },
  colorContainer: { flexDirection: 'row', marginTop: 8 },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  sizeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  productTexture: { fontSize: 18, color: '#ccc', marginTop: 4 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#f39c12', marginTop: 16, marginBottom:50},
  sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  sizeBox: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 15,
  },
  sizeButtonActive: { backgroundColor: '#f39c12', borderColor: '#f39c12' },
  sizeButtonInactive: { backgroundColor: '#555', borderColor: '#555' },
  sizeTextActive: { color: '#000' },
  sizeTextInactive: { color: '#ccc' },
});

export default ProductDetails;
