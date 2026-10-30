const scene = document.querySelector("#scene");
const card = document.querySelector("#login-card");
const form = document.querySelector("#auth-form");
const signInTab = document.querySelector("#signin-tab");
const signUpTab = document.querySelector("#signup-tab");
const title = document.querySelector("#form-title");
const intro = document.querySelector("#form-intro");
const submitLabel = document.querySelector("#submit-label");
const password = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const lampSwitch = document.querySelector("#lamp-switch");
const lampHint = document.querySelector("#lamp-hint");
const codeConsole = document.querySelector(".code-console");
const formMessage = document.querySelector("#form-message");

let isSignup = true;
let switchTimer;
let pullTimer;
let humContext;
let humOscillator;
let humGain;

function showMessage(message) {
    formMessage.textContent = message;
    formMessage.hidden = false;
}

function setMode(signup) {
    if (signup === isSignup) {
        return;
    }

    isSignup = signup;
    signInTab.classList.toggle("is-active", !signup);
    signUpTab.classList.toggle("is-active", signup);
    signInTab.setAttribute("aria-pressed", String(!signup));
    signUpTab.setAttribute("aria-pressed", String(signup));
    title.textContent = signup ? "Sign Up" : "Welcome Back";
    intro.textContent = signup
        ? "Create an account to get started"
        : "Sign in to pick up where you left off";
    submitLabel.textContent = signup ? "Create Account" : "Sign In";
    password.autocomplete = signup ? "new-password" : "current-password";
    formMessage.hidden = true;
    formMessage.textContent = "";

    card.classList.remove("is-switching");
    window.clearTimeout(switchTimer);
    void card.offsetWidth;
    card.classList.add("is-switching");
    switchTimer = window.setTimeout(() => card.classList.remove("is-switching"), 480);
}

function startLampHum() {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
        return;
    }

    humContext ??= new AudioContextConstructor();
    if (humContext.state === "suspended") {
        humContext.resume();
    }

    const now = humContext.currentTime;
    humOscillator = humContext.createOscillator();
    humGain = humContext.createGain();
    humOscillator.type = "sine";
    humOscillator.frequency.setValueAtTime(120, now);
    humGain.gain.setValueAtTime(0.0001, now);
    humGain.gain.exponentialRampToValueAtTime(0.018, now + 0.12);
    humOscillator.connect(humGain);
    humGain.connect(humContext.destination);
    humOscillator.start(now);
}

function stopLampHum() {
    if (!humContext || !humOscillator || !humGain) {
        return;
    }

    const now = humContext.currentTime;
    humGain.gain.cancelScheduledValues(now);
    humGain.gain.setValueAtTime(Math.max(humGain.gain.value, 0.0001), now);
    humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    humOscillator.stop(now + 0.11);
    humOscillator = null;
    humGain = null;
}

signInTab.addEventListener("click", () => setMode(false));
signUpTab.addEventListener("click", () => setMode(true));

passwordToggle.addEventListener("click", () => {
    const showPassword = password.type === "password";
    password.type = showPassword ? "text" : "password";
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
    passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
});

lampSwitch.addEventListener("click", () => {
    const turnOn = lampSwitch.getAttribute("aria-pressed") !== "true";
    scene.classList.toggle("is-lamp-off", !turnOn);
    codeConsole.classList.toggle("is-lit", turnOn);
    lampSwitch.setAttribute("aria-pressed", String(turnOn));
    const nextAction = turnOn ? "off" : "on";
    lampSwitch.setAttribute("aria-label", `Pull to turn the desk lamp ${nextAction}`);
    lampSwitch.title = `Pull to turn the desk lamp ${nextAction}`;
    lampHint.textContent = `Pull to turn ${nextAction}`;
    lampSwitch.classList.remove("is-pulling");
    window.clearTimeout(pullTimer);
    void lampSwitch.offsetWidth;
    lampSwitch.classList.add("is-pulling");
    pullTimer = window.setTimeout(() => lampSwitch.classList.remove("is-pulling"), 420);

    if (turnOn) {
        startLampHum();
    } else {
        stopLampHum();
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage(
        isSignup
            ? "This is a visual preview. Connect an authentication service to create your account."
            : "This is a visual preview. Connect an authentication service to sign in."
    );
});

document.querySelector("#forgot-link").addEventListener("click", () => {
    showMessage("Password recovery is available when an authentication service is connected.");
});

document.querySelectorAll("[data-provider]").forEach((button) => {
    button.addEventListener("click", () => {
        showMessage(`${button.dataset.provider} sign-in is not connected in this preview.`);
    });
});
