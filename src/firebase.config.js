import { getFirestore } from 'firebase/firestore'
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAfQ5nwTLxMpw7foWbaJeOs0XWgt0fqGmE",
    authDomain: "house-marketolace-app.firebaseapp.com",
    projectId: "house-marketolace-app",
    storageBucket: "house-marketolace-app.appspot.com",
    messagingSenderId: "75922973474",
    appId: "1:75922973474:web:fdb5fa75314e60c10bbb7b"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore()





