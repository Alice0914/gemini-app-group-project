import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Add your own Firebase config here
const firebaseConfig = {
    apiKey: "AIzaSyAUdtZqCmSCps4rLsKPh_1fG_Ie1Myj550",
    authDomain: "auth-67bfc.firebaseapp.com",
    projectId: "auth-67bfc",
    storageBucket: "auth-67bfc.appspot.com",
    messagingSenderId: "191801840633",
    appId: "1:191801840633:web:d08245816c80e687fa2328"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider()

const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const message = document.getElementById("signInMessage");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const compareButton = document.getElementById("btn-compare");
const descriptionResultsButton = document.getElementById("description-results");

signOutButton.style.display = "none";
message.style.display = "none";

const userSignIn = async() => {
    signInWithPopup(auth, provider)
    .then((result) => {
        signInButton.style.display = "none";
        const user = result.user
        console.log(user);
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message
    })
}

const userSignOut = async() => {
    signOut(auth).then(() => {
        sessionStorage.removeItem('user');
        alert("You have signed out successfully!");
        signInButton.style.display = "block";
    }).catch((error) => {})
}

onAuthStateChanged(auth, (user) => {
    if(user) {
        signOutButton.style.display = "block";
        message.style.display = "block";
        userName.innerHTML = user.displayName;
        //userEmail.innerHTML = user.email
        compareButton.style.display = "block";
        descriptionResultsButton.style.display = "block";
    } else {
        signOutButton.style.display = "none";
        message.style.display = "none";
        compareButton.style.display = "none";
        descriptionResultsButton.style.display = "none";
    }
})

signInButton.addEventListener('click', userSignIn);
signOutButton.addEventListener('click', userSignOut);