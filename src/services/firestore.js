import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

function ensureDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Check your VITE_FIREBASE_* settings.');
  }

  return db;
}

const userWatchlist = (uid) => collection(db, 'users', uid, 'watchlist');
const userLogs = (uid) => collection(db, 'users', uid, 'logs');
const globalLogs = () => collection(db, 'movieLogs');

export async function addMovieToWatchlist(uid, movie) {
  ensureDb();
  const watchlistDoc = doc(userWatchlist(uid), String(movie.id));
  await setDoc(watchlistDoc, {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path || null,
    release_date: movie.release_date || null,
    addedAt: Timestamp.now(),
  });
}

export async function removeMovieFromWatchlist(uid, movieId) {
  ensureDb();
  await deleteDoc(doc(userWatchlist(uid), String(movieId)));
}

export async function getWatchlist(uid) {
  ensureDb();
  const q = query(userWatchlist(uid), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => docSnapshot.data());
}

export async function logWatchedMovie(uid, movie) {
  ensureDb();
  const movieId = movie.movieId || movie.id || `manual-${Date.now()}`;
  const logData = {
    uid,
    movieId,
    title: movie.title,
    rating: movie.rating ?? null,
    review: movie.review || null,
    poster_path: movie.poster_path || null,
    watchedAt: movie.watchedAt ? Timestamp.fromDate(new Date(movie.watchedAt)) : Timestamp.now(),
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(userLogs(uid), String(movieId)), logData);
  try {
    await addDoc(globalLogs(), logData);
  } catch (error) {
    console.warn('Unable to share log to Discover:', error.message);
  }
}

export async function getUserLogs(uid) {
  ensureDb();
  const snapshot = await getDocs(userLogs(uid));
  return snapshot.docs.map((docSnapshot) => docSnapshot.data());
}

export async function getDiscoverLogs() {
  ensureDb();
  const q = query(globalLogs(), orderBy('watchedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => docSnapshot.data());
}
