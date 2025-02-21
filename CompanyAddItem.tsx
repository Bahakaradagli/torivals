import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button, TextInput, ScrollView, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update, push } from 'firebase/database';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';



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


export default function TournamentCreator() {
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentDescription, setTournamentDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [participantCount, setParticipantCount] = useState('');
  const [selectedContent, setSelectedContent] = useState('87 Rating'); // Varsayılan içerik
  const [selectedImage, setSelectedImage] = useState(''); // Seçilen görsel URI
  const [shopierLink, setShopierLink] = useState(''); // Shopier Linki
  const [participationFee, setParticipationFee] = useState(''); // Katılım Ücreti
  const [sponsorName, setSponsorName] = useState(''); // Sponsor İsmi
  const [prizePercentage, setPrizePercentage] = useState(''); // Ödül yüzdesi
  const [firstPlaceGP, setFirstPlaceGP] = useState(''); // 1. için GP
  const [secondPlaceGP, setSecondPlaceGP] = useState(''); // 2. için GP
  const [thirdPlaceGP, setThirdPlaceGP] = useState(''); // 3. için GP
  const [tournamentType, setTournamentType] = useState('ProClubs'); // Turnuva Türü
  const [tournamentMode, setTournamentMode] = useState('Turnuva'); // 📌 Lig mi Turnuva mı?
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [teamRule, setTeamRule] = useState('');
const [tournamentRule, setTournamentRule] = useState('');
const [teamRulesList, setTeamRulesList] = useState([]);
const [tournamentRulesList, setTournamentRulesList] = useState([]);  
const [selectedCard, setSelectedCard] = useState(null);
  const [cardCount, setCardCount] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(Object.keys(cardThemeColors).map(card => ({ label: card, value: card })));

  const contentOptions = [
    'Min85 Rating','Max85 Rating','End of the Month','Free Rules','Made in Turkey'
  ];

  


  const addTeamRule = () => {
    const totalCards = teamRulesList.reduce((sum, rule) => sum + parseInt(rule.count, 10), 0);
    
    if (!selectedCard || !cardCount) {
      alert('Lütfen bir kart tipi ve kart adedi seçin.');
      return;
    }
  
    if (totalCards + parseInt(cardCount, 10) > 11) {
      alert('Toplam kart sayısı 11\'i geçemez!');
      return;
    }
  
    setTeamRulesList([...teamRulesList, { card: selectedCard, count: parseInt(cardCount, 10) }]);
    setSelectedCard(null);
    setCardCount('');
  };
  

  const removeTeamRule = (index) => {
    const updatedRules = [...teamRulesList];
    updatedRules.splice(index, 1);
    setTeamRulesList(updatedRules);
  };


// Turnuva Kurallarına Kural Ekleme
const addTournamentRule = () => {
  if (tournamentRule.trim() !== '') {
    setTournamentRulesList([...tournamentRulesList, tournamentRule]);
    setTournamentRule('');
  }
};


// Turnuva Kurallarından Kural Silme
const removeTournamentRule = (index) => {
  const updatedRules = [...tournamentRulesList];
  updatedRules.splice(index, 1);
  setTournamentRulesList(updatedRules);
};

  const imageMap = {
    'turnuva1.png': require('./assets/turnuva1.png'),
    'turnuva2.png': require('./assets/turnuva2.png'),
    'turnuva3.png': require('./assets/turnuva3.png'),
    'turnuva4.png': require('./assets/turnuva4.png'),
    'turnuva5.png': require('./assets/turnuva5.png'),
    'turnuva6.png': require('./assets/turnuva6.png'),
    'turnuva7.png': require('./assets/turnuva7.png'),
  };
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Gün/Ay/Yıl formatını düzelt
      const formattedDate = selectedDate.toLocaleDateString('tr-TR').replace(/\./g, '/');
      
      // Saat ve dakika için sıfır dolgulu format
      const formattedTime = selectedDate.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
  
      setStartDate(`${formattedDate} ${formattedTime}`); // 📌 Firebase formatına uygun kaydediyoruz
    }
  };
  
  const handleSaveTournament = () => {
    const user = getAuth().currentUser;
  
    if (user) {
      const uid = user.uid;
  
      // 📌 Seçime göre /Tournaments veya /Leagues dizinine kaydet
      const savePath = tournamentMode === 'Turnuva' ? `companies/${uid}/Tournaments` : `companies/${uid}/Leagues`;
  
      const tournamentRef = ref(getDatabase(), savePath);
      const newTournamentRef = push(tournamentRef);
      const tournamentId = newTournamentRef.key;
  
      const newTournament = {
        tournamentId,
        tournamentName,
        tournamentDescription,
        startDate,
        participantCount,
        shopierLink,
        participationFee,
        sponsorName,
        prizePercentage,
        firstPlaceGP,
        secondPlaceGP,
        thirdPlaceGP,
        tournamentType,
        tournamentMode,
        content: selectedContent,
        imageUrl: selectedImage,
        teamRules: teamRulesList, // 📌 Takım kuralları Firebase'e kaydediliyor
        tournamentRules: tournamentRulesList, // 📌 Turnuva kuralları Firebase'e kaydediliyor
      };
      
  
      update(newTournamentRef, newTournament)
        .then(() => {
          alert(`${tournamentMode} başarıyla oluşturuldu!`);
  
          // 📌 Tüm state'leri temizle
          setTournamentName('');
          setTournamentDescription('');
          setStartDate('');
          setParticipantCount('');
          setShopierLink('');
          setParticipationFee('');
          setSponsorName('');
          setPrizePercentage('');
          setFirstPlaceGP('');
          setSecondPlaceGP('');
          setThirdPlaceGP('');
          setTournamentType('ProClubs');
          setTournamentMode('Turnuva');
          setSelectedContent('87 Rating');
          setSelectedImage('');
        })
        .catch((error) => {
          console.error(`${tournamentMode} kaydedilirken hata oluştu:`, error);
          alert(`${tournamentMode} kaydedilirken hata oluştu.`);
        });
    } else {
      alert('Kullanıcı giriş yapmamış.');
    }
  };
  


  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>Turnuva Oluştur</Text>

      {/* Turnuva Adı */}
      <TextInput
        style={styles.input}
        value={tournamentName}
        onChangeText={setTournamentName}
        placeholder="Turnuva Adı"
        placeholderTextColor="gray"
      />

      {/* Turnuva Türü */}
      <Text style={styles.label}>Turnuva Türü</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeOption,
            tournamentType === 'ProClubs' && styles.selectedType,
          ]}
          onPress={() => setTournamentType('ProClubs')}
        >
          <Text style={styles.typeText}>ProClubs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeOption,
            tournamentType === 'FUT' && styles.selectedType,
          ]}
          onPress={() => setTournamentType('FUT')}
        >
          <Text style={styles.typeText}>FUT</Text>
        </TouchableOpacity>
      </View>

      {/* Turnuva İçeriği */}
      <Text style={styles.label}>Turnuva İçeriği</Text>
      <ScrollView horizontal style={styles.contentScroll}>
        {contentOptions.map((content, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.contentOption,
              selectedContent === content && styles.selectedContent,
            ]}
            onPress={() => setSelectedContent(content)}
          >
            <Text style={styles.contentText}>{content}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ödül Yüzdesi */}
      <TextInput
        style={styles.input}
        value={prizePercentage}
        onChangeText={setPrizePercentage}
        placeholder="Ödül Yüzdesi (%)"
        placeholderTextColor="gray"
        keyboardType="numeric"
      />

      {/* GP Kazanımları */}
      <TextInput
  style={styles.input}
  value={firstPlaceGP}
  onChangeText={(text) => setFirstPlaceGP(text.replace(/[^0-9]/g, ''))} // Sadece rakam girilsin
  placeholder="1.'nin Kazanacağı GP"
  placeholderTextColor="gray"
  keyboardType="numeric"
/>
<TextInput
  style={styles.input}
  value={participationFee}
  onChangeText={(text) => setParticipationFee(text.replace(/[^0-9]/g, ''))}
  placeholder="Katılım Ücreti (TL)"
  placeholderTextColor="gray"
  keyboardType="numeric"
/>

      <TextInput
        style={styles.input}
        value={secondPlaceGP}
        onChangeText={setSecondPlaceGP}
        placeholder="2.'nin Kazanacağı GP"
        placeholderTextColor="gray"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={thirdPlaceGP}
        onChangeText={setThirdPlaceGP}
        placeholder="3.'nin Kazanacağı GP"
        placeholderTextColor="gray"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Turnuva Fotoğrafı</Text>
      <ScrollView horizontal style={styles.imageScroll}>
        {Object.keys(imageMap).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.imageOption,
              selectedImage === key && styles.selectedImage,
            ]}
            onPress={() => setSelectedImage(key)}
          >
            <Image source={imageMap[key]} style={styles.image} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Turnuva Bilgileri */}
      <TextInput
        style={styles.input}
        value={tournamentDescription}
        onChangeText={setTournamentDescription}
        placeholder="Turnuva Açıklaması"
        placeholderTextColor="gray"
        multiline
      />
     
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
  <Text style={{ color: 'gray' }}>{startDate || "Başlangıç Tarihi (GG/AA/YYYY HH:mm)"}</Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={date}
    mode="datetime"
    display="default"
    onChange={onChangeDate}
  />
)}
      <TextInput
        style={styles.input}
        value={participantCount}
        onChangeText={setParticipantCount}
        placeholder="Katılımcı Sayısı"
        placeholderTextColor="gray"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={shopierLink}
        onChangeText={setShopierLink}
        placeholder="Shopier Linki"
        placeholderTextColor="gray"
      />
      <Text style={styles.label}>Takım Kuralları</Text>
      <DropDownPicker
        open={open}
        value={selectedCard}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedCard}
        setItems={setItems}
        style={styles.dropdown}
        placeholder="Kart Tipi Seç"
      />
      <TextInput
        style={styles.input}
        value={cardCount}
        onChangeText={(text) => setCardCount(text.replace(/[^0-9]/g, ''))}
        placeholder="Kart adedi"
        placeholderTextColor="gray"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addButton} onPress={addTeamRule}>
        <Text style={styles.addButtonText}>+ Kural Ekle</Text>
      </TouchableOpacity>
      <FlatList
  data={teamRulesList}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item, index }) => (
    <View style={styles.ruleItem}>
      <Text style={styles.ruleText}>{`${item.count} adet ${item.card.toString()}`}</Text>
      <TouchableOpacity onPress={() => removeTeamRule(index)}>
        <Text style={styles.removeButton}>X</Text>
      </TouchableOpacity>
    </View>
  )}
  ListEmptyComponent={<Text style={styles.noRuleText}>Takım kuralı yok.</Text>}
/>





{/* Turnuva Kuralları */}
<Text style={styles.label}>Turnuva Kuralları</Text>
<View style={styles.rulesContainer}>
  <TextInput
    style={styles.input}
    value={tournamentRule}
    onChangeText={setTournamentRule}
    placeholder="Turnuva kuralı girin..."
    placeholderTextColor="gray"
  />
  <TouchableOpacity style={styles.addButton} onPress={addTournamentRule}>
    <Text style={styles.addButtonText}>+ Ekle</Text>
  </TouchableOpacity>
</View>

{/* Turnuva Kuralları Listesi */}
{tournamentRulesList.map((rule, index) => (
  <View key={index} style={styles.ruleItem}>
    <Text style={styles.ruleText}>{index + 1}. {rule}</Text>
    <TouchableOpacity onPress={() => removeTournamentRule(index)}>
      <Text style={styles.removeButton}>X</Text>
    </TouchableOpacity>
  </View>
))}
      <TextInput
        style={styles.input}
        value={sponsorName}
        onChangeText={setSponsorName}
        placeholder="Sponsor İsmi (Varsa)"
        placeholderTextColor="gray"
      />
            <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeOption, tournamentMode === 'Turnuva' && styles.selectedMode]}
          onPress={() => setTournamentMode('Turnuva')}
        >
          <Text style={styles.modeText}>Turnuva</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeOption, tournamentMode === 'Lig' && styles.selectedMode]}
          onPress={() => setTournamentMode('Lig')}
        >
          <Text style={styles.modeText}>Lig</Text>
        </TouchableOpacity>
      </View>

      {/* Turnuva Kaydet */}
      <View style={styles.buttonContainer}>
        <Button title="Turnuvayı Kaydet" onPress={handleSaveTournament} color="#3498db" />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  modeSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  modeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  selectedMode: { backgroundColor: 'rgba(1, 39, 85, 0.6)', borderColor: '#fff' },
  modeText: { color: 'white' },
  typeSelector: { flexDirection: 'row', marginBottom: 10 },
  typeOption: { padding: 10, marginHorizontal: 5, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
  selectedType: { backgroundColor: 'rgba(1, 39, 85, 0.6)', borderColor: '#fff' },
  typeText: { color: 'white' },
 
  container: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { padding: 20 },
  header: { fontSize: 24, color:  'rgb(255, 255, 255)', textAlign: 'center', marginBottom: 20 },
  contentScroll: { marginVertical: 20, flexDirection: 'row' },
  contentOption: {
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: '#222',
  },
  label: { color: 'white', fontSize: 16, marginBottom: 10 },
  picker: { height: 50, color: 'white', backgroundColor: '#000' },
  input: { borderBottomWidth: 1, borderBottomColor: '#444', padding: 10, marginBottom: 10, color: 'white', backgroundColor: '#000' },
  addButton: { marginVertical: 10, padding: 10, backgroundColor: '#3498db', borderRadius: 5 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  ruleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 10, borderRadius: 5, marginVertical: 5 },
  ruleText: { color: 'white', flex: 1 },
  removeButton: { color: 'red', fontWeight: 'bold', marginLeft: 10 },
  noRuleText: { color: 'gray', textAlign: 'center', marginVertical: 10 },
  selectedContent: { backgroundColor: 'rgba(1, 39, 85, 0.6)', borderColor: '#fff' },
  contentText: { color: 'white' },
  imageScroll: { marginVertical: 20 },
  imageOption: {
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 5,
    overflow: 'hidden',
  },
  selectedImage: { borderColor: 'rgba(1, 39, 85, 0.6)' },
  image: { width: 100, height: 100 },
  
 
  
});
