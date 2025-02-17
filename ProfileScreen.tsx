import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Avatar } from 'react-native-elements';
import { Swipeable } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary } from 'react-native-image-picker'; // Profil fotoğrafı için
import { Ionicons } from '@expo/vector-icons'; // + butonu için kullanılıyor
import * as ImagePicker from 'expo-image-picker';
import * as AuthSession from 'expo-auth-session';
import { Video } from 'expo-av';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage için
export default function ProfileScreen() {
  // Work experience state'leri
  const [workExperiences, setWorkExperiences] = useState([]);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showProjectsForm, setShowProjectsForm] = useState(false);
  const [showCertificatesForm, setShowCertificatesForm] = useState(false);
  const [idInformations, setidInformations] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [workLocation, setWorkLocation] = useState('');
  const [remoteOrOffice, setRemoteOrOffice] = useState('Uzaktan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [iban, setIban] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');

  // Eğitim deneyimleri için gün, ay, yıl state'leri
  const [educationStartDay, setEducationStartDay] = useState('');
  const [educationStartMonth, setEducationStartMonth] = useState('');
  const [educationStartYear, setEducationStartYear] = useState('');
  const [educationEndDay, setEducationEndDay] = useState('');
  const [educationEndMonth, setEducationEndMonth] = useState('');
  const [educationEndYear, setEducationEndYear] = useState('');

  // Education experience state'leri
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [educationExperiences, setEducationExperiences] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [educationLevel, setEducationLevel] = useState('Lise');
  const [educationStartDate, setEducationStartDate] = useState('');
  const [educationEndDate, setEducationEndDate] = useState('');
  const [isEducationOngoing, setIsEducationOngoing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectSubject, setProjectSubject] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [certificateName, setCertificateName] = useState('');
  const [certificateAuthority, setCertificateAuthority] = useState('');
  const [certificateLink, setCertificateLink] = useState('');

  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const toggleWorkForm = () => setShowWorkForm(!showWorkForm);
  const toggleEducationForm = () => setShowEducationForm(!showEducationForm);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [field, setField] = useState('');
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [eaVerified, setEaVerified] = useState(false);
  // State for Firebase auth and database
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();
 
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const IDRef = ref(db, 'users/' + user.uid);
      const workExpRef = ref(db, 'users/' + user.uid + '/zzzCardInformation');

      onValue(workExpRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const experiencesArray = Object.entries(data);
          setWorkExperiences(experiencesArray);
        }
      });


    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const IDRef = ref(db, 'users/' + user.uid + '/personalInfo');
      onValue(IDRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setName(data.name || '');
          setLocation(data.location || '');
          const [day, month, year] = data.birthdate?.split('/') || [];
          setProfileImageUrl(data.profileImage || null);
        }
      });
    } else {
      console.error('User is not authenticated.');
    }
  }, [user]);
  


 const handleSaveWorkExperience = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const uid = user.uid;
    const db = getDatabase();

    // EA Username doğrulama işlemi (örnek olarak sadece doğrulanmış kabul ediliyor)
    const newWorkExperience = {
      companyName,
      eaVerified: true, // Otomatik olarak doğrulanmış kabul ediliyor
    };

    const newRef = ref(db, 'users/' + uid + '/zzzCardInformation/companyName');

    update(newRef, { ...newWorkExperience })
      .then(() => {
        // Formu sıfırla ve `eaVerified` durumunu güncelle
        setCompanyName('');
        setEaVerified(true); // Doğrulama tamamlandı
      })
      .catch((error) => {
        console.error('Error saving EA Username:', error);
      });
  }
};

useEffect(() => {
  if (user) {
    const workExpRef = ref(db, 'users/' + user.uid + '/zzzCardInformation');

    onValue(workExpRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCompanyName(data.companyName.companyName || "Not Set");
      }
    });
  }
}, [user]);

 

 
  useEffect(() => {
    if (user) {
      const IDRef = ref(db, 'users/' + user.uid + '/personalInfo');
      onValue(IDRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setName(data.name || '');
          setLocation(data.location || '');
          setProfession(data.profession || '');
          setField(data.field || '');
          setProfileImageUrl(data.profileImage || null); // Profil resmini yükle
        }
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user) {
      const personalInfoRef = ref(db, 'users/' + user.uid + '/personalInfo');

      update(personalInfoRef, {
        name,
        location,
        profession,
        profileImage: profileImageUrl,
      })
      .then(() => {
        console.log('Profil bilgileri güncellendi');
        setEditMode(false); // Kaydetmeden sonra düzenleme modundan çık
      })
      .catch((error) => {
        console.error('Profil güncellenirken hata:', error);
      });
    }
  };
  
 

  const { width: cardWidth, height: cardHeight } = Dimensions.get('window');
  const aspectRatio = cardWidth / cardHeight;

  const handleChooseProfileImage = async () => {
    // Medya erişim izni
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Medya galerisine erişim izni gerekiyor!');
      return;
    }

    // Resmi seçin ve kartın aspect ratio'suna göre kırpın
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [cardWidth, cardHeight],  // Kart boyutlarına göre aspect ratio
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImage = result.assets[0].uri;
      uploadProfileImage(selectedImage);
    }
  };

  const uploadProfileImage = async (uri) => {
    if (user) {
      try {
        const storage = getStorage();
        const imageRef = storageRef(storage, `profileImages/${user.uid}.jpg`);

        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);

        const downloadUrl = await getDownloadURL(imageRef);
        setProfileImageUrl(downloadUrl);

        const db = getDatabase();
        await update(ref(db, 'users/' + user.uid + '/personalInfo'), {
          profileImage: downloadUrl,
        });
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
      }
    }
  };
   

  

  const handleDeleteWorkExperience = (companyId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const workRef = ref(db, 'users/' + user.uid + '/zzzworkExperience/' + companyId);

      remove(workRef)
        .then(() => {
          setWorkExperiences(workExperiences.filter(([id]) => id !== companyId));
        })
        .catch((error) => {
          console.error('Error removing work experience:', error);
        });
    }
  };

  const handleDeleteEducationExperience = (schoolId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const eduRef = ref(db, 'users/' + user.uid + '/zzzeducationExperience/' + schoolId);

      remove(eduRef)
        .then(() => {
          setEducationExperiences(educationExperiences.filter(([id]) => id !== schoolId));
        })
        .catch((error) => {
          console.error('Error removing education experience:', error);
        });
    }
  };

  const handleDeleteProject = (projectId) => {
    if (user) {
      const projectRef = ref(db, 'users/' + user.uid + '/zzzprojects/' + projectId);
      remove(projectRef).then(() => {
        setProjects(projects.filter(([id]) => id !== projectId));
      });
    }
  };

  const handleDeleteCertificate = (certificateId) => {
    if (user) {
      const certRef = ref(db, 'users/' + user.uid + '/zzzcertificates/' + certificateId);
      remove(certRef).then(() => {
        setCertificates(certificates.filter(([id]) => id !== certificateId));
      });
    }
  };







  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleChooseProfileImage}>
          <Avatar
            rounded
            size="xlarge"
            source={{ uri: profileImageUrl || 'https://placekitten.com/200/200' }}
          />
        </TouchableOpacity>

        {/* Profile Display Mode */}
        {!editMode ? (
          
          <View style={styles.profileInfoContainer}>            
     <View style={styles.sectionHeaderContainer}>
  <Text style={[styles.sectionHeader]}>
    User Information
  </Text>
  <TouchableOpacity onPress={() => setEditMode(true)} style={styles.addIcon}>
    <Ionicons name={showWorkForm ? "create" : "create"} size={24} color="white" />
  </TouchableOpacity>

</View>
<View style={styles.separator} />
        <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.profileName}>{name}</Text>
        </View>
            <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.profileText}>{location}</Text>
        </View>
            <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Adress</Text>
          <Text style={styles.profileText}>{profession}</Text>
        </View>
        <View style={styles.infoBox}>
  <Text style={styles.infoLabel}>EA Username</Text>
  <Text style={styles.profileText}>
  {companyName && typeof companyName === "object" ? JSON.stringify(companyName?.companyName) : companyName || "Not Set"}
</Text>


</View>

          </View>
        ) : (
<View style={styles.formContainer}>
  <View style={styles.inputContainer}>
    <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      value={name}
      onChangeText={setName}
      placeholder="Name"
      placeholderTextColor="gray"
    />
  </View>

  <View style={styles.inputContainer}>
    <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      value={location}
      onChangeText={setLocation}
      placeholder="Phone Number"
      placeholderTextColor="gray"
    />
  </View>

  <View style={styles.inputContainer}>
    <Ionicons name="home-outline" size={20} color="#888" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      value={profession}
      onChangeText={setProfession}
      placeholder="Address"
      placeholderTextColor="gray"
    />
  </View>

  <View style={styles.inputContainer}>
    <Ionicons name="game-controller-outline" size={20} color="#888" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      value={companyName}
      onChangeText={setCompanyName}
      placeholder="EA Username"
      placeholderTextColor="gray"
    />
  </View>

  <TouchableOpacity 
    style={styles.saveButton} 
    onPress={() => {
      handleSaveProfile();
      handleSaveWorkExperience();
    }}
  >
    <Text style={styles.saveButtonText}>Save</Text>
  </TouchableOpacity>
</View>

        )}
      </View>









    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#111',
    borderRadius: 15,
    width: '100%',
    elevation: 5, // Hafif gölge efekti
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00343f',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  
  inputIcon: {
    marginRight: 10,
  },
  
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  
  saveButton: {
    backgroundColor: '#00343f', 
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  workExperienceContainer: {
    backgroundColor: '#222', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444', 
  },
  
  workExperienceDetails: {
    flexDirection: 'column',
    flex: 1, 
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  
  companyValue: {
    fontSize: 16,
    color: '#bbb',
  },
  
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  noDataText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  

  eaAuthContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  verifiedText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  
  backgroundVideo3: {
    position: 'absolute',
    top:-100,
    left: -20,
    bottom: 0,
    right: 0,
    borderRadius:8,
    width: '120%',
    height: '120%',
    opacity: 1, // Videoyu biraz şeffaf yaparak içeriği görünür kıl
  },
  optionsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#222', // Koyu arka plan
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around', // Seçenekleri yatayda yayar
    alignItems: 'center',
  },
  
  optionItem: {
    alignItems: 'center', // İkon ve metni ortalar
  },
  
  optionText: {
    color: 'white',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  
  
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  profileInfoContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  infoLabel: {
    position: 'absolute',
    top: 5,
    left: 10,
    fontSize: 12,
    color: '#ccc', 
  },
  profileName: {
    fontSize: 18,
    top: 9,
    color: '#fff',
    textAlign: 'left',
  },
  profileText: {
    color: '#fff',
    fontSize: 16,
    top: 10,
    textAlign: 'left',
  },
  editButtonText: {
    color: '#00FF00',
    marginTop: 20,
    textAlign: 'left',
  },


  educationSectionHeaderContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', // This ensures the + icon is next to the text
    alignSelf: 'stretch', // Full width
  },


  
  sectionContainer: {
    backgroundColor: '#333', 
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    alignSelf: 'stretch', // Ensure section takes full width
  },
  sectionHeaderContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    alignSelf: 'stretch', // Full width
  },
  sectionHeader: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
    marginBottom: 10,
    marginTop: 10,  // Başlıkların altına boşluk ekliyoruz
  },

selectedHeader: {
  color: '#00343f', // Seçili olduğunda turuncu
},

  addIcon: {
    marginRight: 10,
  },
 on: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  addButtonText: {
    fontWeight: 'bold',
    color: 'white',
  },







  workExperience: {
    flexDirection: 'column',
  },
  dates: {
    color: 'gray',
  },
  role: {
    fontStyle: 'italic',
    color: '#ccc',  // Gri-beyaz arası renk
  },
  experienceTitle: {
    fontSize: 14,
    color: '#ccc',  // Gri-beyaz arası renk
  },
  formLabel: {
    fontSize: 12,
    color: '#fff', // Beyaz başlıklar
    marginBottom: 5,
  },
  
 
 
  addPhotoText: {
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateInputRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 10,
    width: 60,
    textAlign: 'center',
    borderRadius: 5,
    marginRight: 5,
    color: '#fff',  // Tarih girişlerinde beyaz renk
    backgroundColor: '#222',
  },



  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    color: 'gray',
  },
  swipeableContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  separator: {
    borderBottomWidth: 0.6, // Çizginin kalınlığı
    borderBottomColor: '#fff', // Çizginin rengi (beyaz)
    bottom:5,
    marginVertical: 10, // Yukarıdan ve aşağıdan boşluk
  },

  switchContainer: {
    flexDirection: 'row', // Yatayda hizalama
    justifyContent: 'space-between', // İçerikleri iki tarafa yay
    alignItems: 'center', // Dikeyde ortala
    marginVertical: 10, // Üst ve alt boşluk
  },
  experienceItem: {
    marginLeft: 10,
    marginVertical: 2,
  },
  experienceList: {
    marginVertical: 10,
  },


});

