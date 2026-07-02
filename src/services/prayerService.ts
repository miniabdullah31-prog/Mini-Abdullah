import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { PermissionsAndroid, Platform } from 'react-native';

async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // Pehle check karein ke kahin permission pehle se toh allow nahi hai?
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    
    if (alreadyGranted) return true;

    // Agar pehle se allow nahi hai, toh pop-up dikhayein
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location access',
        message: 'We use your location to show accurate prayer times.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return (
      granted === PermissionsAndroid.RESULTS.GRANTED || 
      granted === 'granted' // Kuch emulators string directly de dete hain
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export async function getPrayerTimes(city: string, baseURL = 'http://10.0.2.2:5000') {
  try {
    console.log('🔄 Fetching prayer times for city:', city);
    const response = await axios.get(`${baseURL}/api/prayer`, {
      params: { city },
      timeout: 10000,
    });

    console.log('✅ Prayer API response:', response.data);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch prayer times');
  } catch (error: any) {
    console.log('❌ Error fetching prayer times:', error.message);
    throw error;
  }
}

export async function getPrayerTimesByCoordinates(latitude: number, longitude: number, baseURL = 'http://10.0.2.2:5000') {
  try {
    const response = await axios.get(`${baseURL}/api/prayer`, {
      params: { lat: latitude, lng: longitude },
      timeout: 10000,
    });

    if (response.data.success) {
      return {
        city: 'Current Location',
        prayerTimes: response.data.data,
      };
    }

    throw new Error(response.data.message || 'Failed to fetch prayer times');
  } catch (error: any) {
    console.log('❌ Error fetching prayer times by coordinates:', error.message);
    throw error;
  }
}

export async function getPrayerTimesFromCurrentLocation(baseURL = 'http://10.0.2.2:5000') {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission was not granted');
    }

    return await new Promise((resolve, reject) => {
      // 🌟 TypeScript warning hatane ke liye simple check
      if (!Geolocation) {
        return reject(new Error('Location service module is missing. Please rebuild the app using npx react-native run-android.'));
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await getPrayerTimesByCoordinates(position.coords.latitude, position.coords.longitude, baseURL);
            resolve(result);
          } catch (error: any) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(error.message || 'Could not get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  } catch (error: any) {
    console.log('❌ Error in getPrayerTimesFromCurrentLocation:', error.message);
    throw error;
  }
}

// 🌟 FIX: Is function ko bahar nikal diya taake ab ye properly export ho sakay!
export async function getPrayerTimesByCity(city: string, baseURL = 'http://10.0.2.2:5000') {
  try {
    console.log('📍 Getting prayer times for city:', city);
    const prayerTimes = await getPrayerTimes(city, baseURL);
    return {
      city,
      prayerTimes,
    };
  } catch (error: any) {
    console.log('❌ Error fetching prayer times by city:', error.message);
    throw error;
  }
}