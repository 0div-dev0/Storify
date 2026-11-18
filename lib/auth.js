import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Register a new user with email and password,
 * updates Firebase Auth displayName, and creates a user record in Firestore.
 */
export async function signup(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  if (name) {
    await updateProfile(user, { displayName: name });
  }

  // Create or merge user document in Firestore "users" collection
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name || user.displayName || "Writer",
    email: user.email,
    createdAt: serverTimestamp(),
  }, { merge: true });

  return user;
}

/**
 * Sign in an existing user with email and password.
 */
export async function login(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign out the currently authenticated user.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Fetch extra user profile details stored in Firestore.
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Subscribe to Firebase Auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the currently signed-in user object (synchronous).
 */
export function getCurrentUser() {
  return auth.currentUser;
}