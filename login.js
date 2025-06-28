import { auth } from './firebase-config.js';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("login-name");
const phoneInput = document.getElementById("login-phone");
const codeSection = document.getElementById("code-section");
const codeInput = document.getElementById("code");
const verifyButton = document.getElementById("verify-code");

let confirmationResult = null;

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
});

document.addEventListener("DOMContentLoaded", () => {
  window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  }, auth);
});

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

verifyButton.addEventListener("click", async () => {
  const code = codeInput.value.trim();
  if (!code) return alert("Please enter the verification code.");

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const phone = user.phoneNumber;

    localStorage.setItem("userPhone", phone);
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
