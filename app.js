/* =========================
   HUNDO — APP.JS
========================= */


/* =========================
   SCREEN ELEMENTS
========================= */

const authScreen = document.getElementById("auth-screen");
const signupScreen = document.getElementById("signup-screen");
const appScreen = document.getElementById("app-screen");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const showSignupButton = document.getElementById("show-signup");
const backToLoginButton = document.getElementById("back-to-login");


/* =========================
   LOGIN / SIGNUP SCREEN
========================= */

showSignupButton.addEventListener("click", () => {
    authScreen.classList.add("hidden");
    signupScreen.classList.remove("hidden");
});

backToLoginButton.addEventListener("click", () => {
    signupScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");
});


/* =========================
   TEMPORARY LOGIN
   We'll connect Supabase here next.
========================= */

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    openApp();

});


/* =========================
   TEMPORARY SIGNUP
   We'll connect Supabase here next.
========================= */

signupForm.addEventListener("submit", (event) => {

    event.preventDefault();

    openApp();

});


/* =========================
   OPEN HUNDO APP
========================= */

function openApp() {

    authScreen.classList.add("hidden");
    signupScreen.classList.add("hidden");

    appScreen.classList.remove("hidden");

}


/* =========================
   BOTTOM NAVIGATION
========================= */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach((navItem) => {

    navItem.addEventListener("click", () => {

        const pageId = navItem.dataset.page;

        /* Hide every page */

        pages.forEach((page) => {
            page.classList.add("hidden");
        });

        /* Show selected page */

        const selectedPage = document.getElementById(pageId);

        if (selectedPage) {
            selectedPage.classList.remove("hidden");
        }

        /* Update active navigation item */

        navItems.forEach((item) => {
            item.classList.remove("active");
        });

        navItem.classList.add("active");

    });

});


/* =========================
   HOME → LOG ACTIVITY
========================= */

const homeLogButton = document.getElementById("home-log-button");

homeLogButton.addEventListener("click", () => {

    pages.forEach((page) => {
        page.classList.add("hidden");
    });

    document.getElementById("log-page").classList.remove("hidden");

    navItems.forEach((item) => {
        item.classList.remove("active");
    });

    document
        .querySelector('[data-page="log-page"]')
        .classList.add("active");

});


/* =========================
   ACTIVITY TYPE SELECTOR
========================= */

const activityTypes = document.querySelectorAll(".activity-type");

let selectedActivityType = "run";

activityTypes.forEach((button) => {

    button.addEventListener("click", () => {

        activityTypes.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedActivityType = button.dataset.type;

        console.log("Selected activity:", selectedActivityType);

    });

});


/* =========================
   TEMPORARY ACTIVITY POST
   Supabase connection comes next.
========================= */

const activityForm = document.getElementById("activity-form");

activityForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const distance = document.getElementById("distance").value;
    const duration = document.getElementById("duration").value;
    const caption = document.getElementById("caption").value;

    console.log({
        activityType: selectedActivityType,
        distance: distance,
        duration: duration,
        caption: caption
    });

    alert("Activity logged! Supabase connection coming next.");

    activityForm.reset();

});


/* =========================
   LEADERBOARD TABS
========================= */

const leaderboardTabs =
    document.querySelectorAll(".leaderboard-tab");

leaderboardTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        leaderboardTabs.forEach((item) => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

    });

});
