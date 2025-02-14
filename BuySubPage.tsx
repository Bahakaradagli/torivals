import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Text,
  FlatList,
  ImageBackground,
  Linking 
} from 'react-native';

export default function BuySubPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const subscriptionPlans = [
    {
      id: '1',
      title: 'Temel Plan',
      image: require('./assets/plan1.png'),
    },
    {
      id: '2',
      title: 'Standart Plan',
      image: require('./assets/plan2.png'),
    },
    {
      id: '3',
      title: 'Premium Plan',
      image: require('./assets/plan3.png'),
    },
  ];

  const handlePurchase = async () => {
    try {
      const shopierUrl = 'https://www.shopier.com/ShowProductNew/products.php?id=30915080';
      await Linking.openURL(shopierUrl);
      alert('Ödeme işlemi için Shopier sayfasına yönlendiriliyorsunuz.');
    } catch (error) {
      console.error('Yönlendirme sırasında hata oluştu:', error);
      alert('Yönlendirme başarısız oldu.');
    }
  };

  const openModal = (plan) => {
    setSelectedPlan(plan);
    setIsModalVisible(true);
  };

  const renderPlan = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.planButton}>
      <Image source={item.image} style={styles.planImage} />
    </TouchableOpacity>
  );

  return (
    

    <ImageBackground
      source={require('./assets/subs-background.png')} // Replace with your background image path
      style={styles.background}
    >
    <View style={styles.container}>

      {/* Horizontal Scrollable Plans */}
      <FlatList
        data={subscriptionPlans}
        horizontal
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal View */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedPlan?.title} Aboneliği Satın Al
            </Text>
            <Text style={styles.modalMessage}>
              Bu planı satın alarak özelliklere erişim sağlayabilirsiniz.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handlePurchase}>
                <Text style={styles.modalButtonText}>Satın Al</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensures the image covers the screen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  listContainer: {
    marginTop: 150,
    paddingHorizontal: 10,
  },
  planButton: {
    marginHorizontal: 20,
  },
  planImage: {
    width: 330,
    height: 330,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#f39c12',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#555',
  },
});
