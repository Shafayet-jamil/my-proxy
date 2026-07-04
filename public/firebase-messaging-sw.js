import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyBe4exW0UpJX4PvIU-HcH6GS0KcbA9Fbkk",
  authDomain: "my-proxy-b15ee.firebaseapp.com",
  projectId: "my-proxy-b15ee",
  storageBucket: "my-proxy-b15ee.firebasestorage.app",
  messagingSenderId: "172311892979",
  appId: "1:172311892979:web:4262bd72d3138274a33886"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)
