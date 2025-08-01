// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzFVSzilkvNNiuoYQHyImZMLVqP9ElRj4",
  authDomain: "krystal-cloud-ui.firebaseapp.com",
  projectId: "krystal-cloud-ui",
  storageBucket: "krystal-cloud-ui.firebasestorage.app",
  messagingSenderId: "527652328978",
  appId: "1:527652328978:web:d8bfd7db5b037318cdeacb",
  measurementId: "G-5PGHRL7M5D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side with better error handling
let analytics: any = null;

if (typeof window !== "undefined") {
  try {
    // Check if analytics is supported before initializing
    isSupported()
      .then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("Firebase Analytics initialized successfully");
        } else {
          console.warn(
            "Firebase Analytics is not supported in this environment"
          );
        }
      })
      .catch(error => {
        console.warn("Firebase Analytics initialization failed:", error);
      });
  } catch (error) {
    console.warn("Firebase Analytics failed to initialize:", error);
  }
}

export { app, analytics };
