import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA4uJfwJNLDT2MLYMOe95ZV8ElM-qrptqQ',
  authDomain: 'bookshelf-96f4b.firebaseapp.com',
  databaseURL: 'https://bookshelf-96f4b.firebaseio.com',
  projectId: 'bookshelf-96f4b',
  storageBucket: 'bookshelf-96f4b.appspot.com',
  messagingSenderId: '997957418696',
  appId: '1:997957418696:web:9d28340f14b87eb7b2effd',
};
// config for dev environment
//
// const firebaseConfig = {
//   apiKey: 'AIzaSyAkxlqVasWYvOOwHbwXF0zZL-mSsjUrC2M',
//   authDomain: 'bookshelf-dev-437f7.firebaseapp.com',
//   projectId: 'bookshelf-dev-437f7',
//   storageBucket: 'bookshelf-dev-437f7.appspot.com',
//   messagingSenderId: '803118428326',
//   appId: '1:803118428326:web:350c0a159983badaec4467',
// };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
if (window.location.hostname === 'localhost') {
  db.useEmulator('localhost', 8080);
}

// For development
// Reduce request for firestore
// db.enablePersistence({ synchronizeTabs: true });
// db.enablePersistence();
// db.disableNetwork();

export { firebase, db };
