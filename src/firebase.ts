import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import type { Recipe } from "./types/recipe";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId as specified in skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Handling Schema as required by skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot as required by skill
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.warn("Please check your Firebase configuration / network.");
    }
  }
}

// Run connection test
testConnection();

// Store or update user profile document in Firestore
export async function syncUserProfileToFirestore(user: FirebaseUser, providerName?: string) {
  const userRef = doc(db, "users", user.uid);
  const data = {
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "Chef User",
    email: user.email || "",
    photoURL: user.photoURL || "",
    provider: providerName || user.providerData?.[0]?.providerId || "google",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Save recipe to Firestore under user subcollection
export async function saveRecipeToFirestore(userId: string, recipe: Recipe) {
  const recipeRef = doc(db, "users", userId, "savedRecipes", recipe.id);
  const payload = {
    userId,
    recipeId: recipe.id,
    title: recipe.title,
    tagline: recipe.tagline,
    badge: recipe.badge,
    totalTimeMinutes: recipe.totalTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    recipeData: recipe,
    savedAt: new Date().toISOString(),
  };

  try {
    await setDoc(recipeRef, payload);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.CREATE,
      `users/${userId}/savedRecipes/${recipe.id}`
    );
  }
}

// Remove recipe from Firestore
export async function removeRecipeFromFirestore(userId: string, recipeId: string) {
  const recipeRef = doc(db, "users", userId, "savedRecipes", recipeId);
  try {
    await deleteDoc(recipeRef);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.DELETE,
      `users/${userId}/savedRecipes/${recipeId}`
    );
  }
}

// Sync pantry ingredients to Firestore
export async function syncPantryToFirestore(userId: string, ingredients: string[]) {
  const pantryRef = doc(db, "users", userId, "pantry", "current");
  const payload = {
    userId,
    ingredients,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(pantryRef, payload);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `users/${userId}/pantry/current`
    );
  }
}

export {
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
};
