import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { PermissionsAndroid, Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (alreadyGranted) return true;

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
      granted === 'granted'
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export async function getPrayerTimes(city: string, baseURL = API_BASE_URL) {
  try {
    const response = await axios.get(`${baseURL}/api/prayer`, {
      params: { city },
      timeout: 10000,
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch prayer times');
  } catch (error: any) {
    throw error;
  }
}

export async function getPrayerTimesByCoordinates(latitude: number, longitude: number, baseURL = API_BASE_URL) {
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
    throw error;
  }
}

export async function getPrayerTimesFromCurrentLocation(baseURL = API_BASE_URL) {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission was not granted');
  }

  return await new Promise((resolve, reject) => {
    if (!Geolocation) {
      return reject(
        new Error(
          'Location service module is missing. Please rebuild the app using npx react-native run-android.',
        ),
      );
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await getPrayerTimesByCoordinates(
            position.coords.latitude,
            position.coords.longitude,
            baseURL,
          );
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
}

export async function getPrayerTimesByCity(city: string, baseURL = API_BASE_URL) {
  const prayerTimes = await getPrayerTimes(city, baseURL);
  return {
    city,
    prayerTimes,
  };
}
