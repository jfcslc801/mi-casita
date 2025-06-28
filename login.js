import { auth } from './firebase-config.js';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("login-name");
const phoneInput = document.getElementById("login-phone");
const codeSection = document.getElementById("code-section");
const codeInput = document.getElementById("code");
const verifyButton = document.getElementById("verify-code");

let confirmationResult = null;

// Format phone input
phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
});

// Initialize invisible reCAPTCHA
window.addEventListener("DOMContentLoaded", () => {
  window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  }, auth);
});

// Submit phone number and name
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const rawPhone = phoneInput.value.trim();

  if (rawPhone.length !== 10) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  const formattedPhone = "+1" + rawPhone;

  try {
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    localStorage.setItem("userName", name);
    localStorage.setItem("rawPhone", rawPhone);
    codeSection.style.display = "block";
    alert("Verification code sent to " + formattedPhone);
  } catch (error) {
    console.error("Error sending SMS:", error);
    alert("Failed to send code. Try again later.");
  }
});

// Verify the code
verifyButton.addEventListener("click", async () => {
  const code = codeInput.value.trim();
  if (!code) return alert("Please enter the verification code.");

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const phone = user.phoneNumber;
    const displayName = localStorage.getItem("userName") || "Customer";

    // Save phone for later logic
    localStorage.setItem("userPhone", phone);

    // If user has no displayName, update it
    if (!user.displayName || user.displayName === "") {
      await updateProfile(user, { displayName });
    }

    // Redirect based on admin
    const rawPhone = localStorage.getItem("rawPhone");
    if (rawPhone === "8013474922") {
      window.location.href = "kitchen.html";
    } else {
      window.location.href = "order-status.html";
    }
  } catch (error) {
    console.error("Code verification failed:", error);
    alert("Invalid code. Please try again.");
  }
});
