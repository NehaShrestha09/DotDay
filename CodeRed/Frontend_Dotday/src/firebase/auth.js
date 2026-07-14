import { getAuth,GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc} from "firebase/firestore"; // already initialized in firebase.js
import app from "./config"
import db from "./firestore"

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Store user info in Firestore for new users
    if(!userSnap.exists()){
      await setDoc(userRef, {
      username: user.displayName,
      email: user.email,
      createdAt: serverTimestamp()
    });
  }

    // Check if user has completed onboarding
    const userData = userSnap.exists() ? userSnap.data() : {};
    const hasOnboarding = userData.normalMode?.onboarding || userData.tricyclingMode?.onboarding;

    return {
      user, 
      onboarding: hasOnboarding,
      isNewUser: !userSnap.exists()
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

