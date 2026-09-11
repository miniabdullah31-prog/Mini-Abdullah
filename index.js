/**
 * @format
 */

import "@react-native-firebase/app";
import { AppRegistry } from "react-native";
import { registerBackgroundMessageHandler } from "./src/services/fcmService";
import App from "./App";
import { name as appName } from "./app.json";

console.log("[FCM] index.js entry — registering background handler");
registerBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
