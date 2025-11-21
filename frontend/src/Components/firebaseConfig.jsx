import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_LagvYj2O-hZrzJaiF0GgjFvzE1ACku8",
  authDomain: "samplehub-3296.firebaseapp.com",
  projectId: "samplehub-3296",
  storageBucket: "samplehub-3296.firebasestorage.app",
  messagingSenderId: "263496867495",
  appId: "1:263496867495:web:dd22ccc94f342ff25a8582",
  measurementId: "G-TCFGYXXJBP",
};

const app = initializeApp(firebaseConfig);

// avoid analytics errors in local dev
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export const auth = getAuth(app);
