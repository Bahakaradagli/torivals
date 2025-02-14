import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Card } from 'react-native-elements';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export default function ProfileEditScreen() {
  const [workExperience, setWorkExperience] = useState('');
  const [educationExperience, setEducationExperience] = useState('');
  const [projects, setProjects] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      const db = getDatabase();
      const profileRef = ref(db, 'companies/' + user.uid);
      onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setWorkExperience(data.workExperience || '');
          setEducationExperience(data.educationExperience || '');
          setProjects(data.projects || '');
        }
      });
    }
  }, []);

  const handleUpdateProfile = () => {
    const db = getDatabase();
    update(ref(db, 'companies/' + userId), {
      workExperience: workExperience,
      educationExperience: educationExperience,
      projects: projects,
    })
    .then(() => {
      console.log('Profile updated successfully');
    })
    .catch((error) => {
      console.error('Error updating profile:', error);
    });
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title>Profilinizi Düzenleyin</Card.Title>
        <Card.Divider />

        <Input
          placeholder="İş Deneyimi"
          value={workExperience}
          onChangeText={setWorkExperience}
        />

        <Input
          placeholder="Eğitim Deneyimi"
          value={educationExperience}
          onChangeText={setEducationExperience}
        />

        <Input
          placeholder="Projeler"
          value={projects}
          onChangeText={setProjects}
        />

        <Button title="Profili Güncelle" onPress={handleUpdateProfile} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
