import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';
const screenWidth = Dimensions.get('window').width;

const liveChancesData = [
  { id: '1', image: require('./assets/1.png'), text: 'Özellikle bu kart size özel!' },
  { id: '2', image: require('./assets/2.png'), text: 'Özellikle 1 kartınız artırıldı!' },
  { id: '3', image: require('./assets/3.png'), text: 'Haftalık sürenizi artırabilirsiniz!' },
  { id: '4', image: require('./assets/3.png'), text: 'Bir sonraki ödülünüz burada.' },
];
const handlePurchase = async () => {
  const auth = getAuth(); // Get Firebase Authentication instance
  const db = getDatabase(); // Get Firebase Database instance
  const user = auth.currentUser; // Get the currently logged-in user

  if (user) {
    const companyRef = ref(db, `companies/${user.uid}`); // Reference to the user's data in Firebase

    // Update the SubsProductCount field
    await update(companyRef, {
      SubsProductCount: 'dıwdnoqı1ndaknsdıuawd8bdoa9', // New value
    });

    alert('Satın alma başarılı! SubsProductCount güncellendi.');
  } else {
    alert('Kullanıcı giriş yapmamış!');
  }
};
const videoPosts = [
  { id: '1', video: require('./assets/post1.mp4') },
  { id: '2', video: require('./assets/post2.mp4') },
  { id: '3', video: require('./assets/post3.mp4') },
  { id: '4', video: require('./assets/post4.mp4') },
];

export default function CompanyHomePage() {
  const videoRef = React.useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.header}>
      <Image
            ref={videoRef}
            source={require('./assets/BannerToRivals.png')} // Your video file
            style={styles.video}
            resizeMode="cover"

          />
      </View>

      {/* Live Chances Section */}
      <View style={styles.liveChancesContainer}>
        <Text style={styles.liveChancesTitle}>
          <Ionicons name="wifi" size={18} color="#fff" /> Live Chances
        </Text>
        <FlatList
          data={liveChancesData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsList}
          renderItem={({ item }) => (
            <ImageBackground source={item.image} style={styles.card} imageStyle={styles.cardImage}>
              <Text style={styles.cardText}>{item.text}</Text>
            </ImageBackground>
          )}
        />
      </View>

      {/* Video Banner Section */}
      <View style={styles.videoBannerContainer}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Video
            ref={videoRef}
            source={require('./assets/9addproduct.mp4')} // Your video file
            style={styles.video}
            resizeMode="cover"
            isLooping
            shouldPlay
          />
        </TouchableOpacity>
      </View>

      <Modal
  transparent
  visible={isModalVisible}
  animationType="slide"
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Video
        source={require('./assets/9addproduct.mp4')}
        style={styles.modalVideo}
        resizeMode="cover"
        isLooping
        shouldPlay
      />

      <Text style={styles.modalTitle}>Mağazanı Geliştir</Text>

      {/* Modal Açıklama */}
      <Text style={styles.modalDescription}>
        Mağazanıza 9 ürün daha ekleyebilmek için bu özelliği satın alın! Üstelik bu özellik anlık 100 TL.
      </Text>

      {/* Düğmeler */}
      <View style={styles.modalButtonContainer}>
        {/* Kapat Düğmesi */}
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={() => setIsModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Kapat</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.button, styles.buyButton]}
  onPress={handlePurchase}
>
  <Text style={styles.buyButtonText}>Satın Al</Text>
</TouchableOpacity>

      </View>
    </View>
  </View>
</Modal>


      <View style={styles.horizontalVideosContainer}>
      <Text style={styles.liveChancesTitle}>
          <Ionicons name="wifi" size={18} color="#fff" /> 3D Ürün Fırsatları 
        </Text>
        <FlatList
          data={videoPosts}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Video
              source={item.video}
              style={styles.horizontalVideo}
              resizeMode="cover"
              isLooping
              shouldPlay
            />
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({


  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'left',
  },
  modalDescription: {
    fontSize: 16,
    color: '#ccc',
    marginVertical: 10,
    textAlign: 'left',
    lineHeight: 22, // Daha okunaklı bir görünüm için
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
 
  closeButton: {
    backgroundColor: '#000',
    marginBottom:20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyButton: {
    backgroundColor: '#000000',
    marginBottom:20,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  


  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Aligns the modal content to the bottom
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
  },
  modalContent: {
    width: '100%', // Stretches to the full width of the screen
    backgroundColor: '#121212', // Background color for the modal content
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20, // Rounded corners at the top
    padding: 20, // Adds spacing inside the modal
    alignItems: 'flex-start', // Aligns title and description to the left
  },
  modalVideo: {
    width: '100%', 
    height: 200, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    overflow: 'hidden', 
  },
 

  

  

  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
    paddingBottom: 20, // Add spacing at the bottom
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 5,
  },
  headerDiscount: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  discountPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  liveChancesContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  liveChancesTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  cardsList: {
    paddingHorizontal: 10,
  },
  card: {
    width: screenWidth * 0.3,
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  cardImage: {
    borderRadius: 10,
  },
  cardText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 2,
    borderRadius: 5,
  },
  videoBannerContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: screenWidth,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
 

  horizontalVideosContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  horizontalVideo: {
    width: screenWidth * 0.4,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
