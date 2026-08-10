/**
 * Patches outdated native module Gradle files for RN 0.85 / Gradle 9.
 * Runs after npm install so jcenter() and old support libs do not break Android builds.
 */
const fs = require("fs");
const path = require("path");

function write(rel, contents) {
  const full = path.join(__dirname, "..", rel);
  if (!fs.existsSync(path.dirname(full))) {
    console.log("skip missing:", rel);
    return;
  }
  fs.writeFileSync(full, contents);
  console.log("patched:", rel);
}

write(
  "node_modules/react-native-tts/android/build.gradle",
  `def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

apply plugin: 'com.android.library'

android {
    namespace "net.no_mad.tts"
    compileSdkVersion safeExtGet('compileSdkVersion', 36)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 24)
        targetSdkVersion safeExtGet('targetSdkVersion', 36)
        versionCode 1
        versionName "1.0"
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`,
);

write(
  "node_modules/@react-native-voice/voice/android/build.gradle",
  `apply plugin: 'com.android.library'

android {
    namespace "com.wenkesj.voice"
    compileSdkVersion rootProject.hasProperty('compileSdkVersion') ? rootProject.compileSdkVersion : 36

    defaultConfig {
        minSdkVersion rootProject.hasProperty('minSdkVersion') ? rootProject.minSdkVersion : 24
        targetSdkVersion rootProject.hasProperty('targetSdkVersion') ? rootProject.targetSdkVersion : 36
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`,
);
