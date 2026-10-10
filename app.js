/* =========================
   HUNDO — APP.JS
========================= */

/* =========================
   SUPABASE CONFIG
========================= */

const SUPABASE_URL = "https://vdrjynreworkifysxuhd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zq-tc602UONo5fg90pfebg_57-WM8cC";

let supabaseClient = null;


/* =========================
   SUPABASE LOADER
========================= */

function loadSupabase() {
    return new Promise((resolve, reject) => {

        // Already loaded
        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            resolve();
            return;
        }

        // Try loading Supabase from another CDN
        const script = document.createElement("script");

        script.src =
            "https://unpkg.com/@supabase/supabase-js@2";

        script.onload = () => {
            if (
                window.supabase &&
                typeof window.supabase.createClient === "function"
            ) {
                resolve();
            } else {
                reject(
                    new Error("Supabase loaded but could not be initialized.")
                );
            }
        };

        script.onerror = () => {
            reject(
                new Error("Could not load Supabase.")
            );
        };

        document.head.appendChild(script);
    });
}


async function getSupabase() {

    if (supabaseClient) {
        return supabaseClient;
    }

    await loadSupabase();

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

    return supabaseClient;
}


/* =========================
   SCREEN ELEMENTS
========================= */

const authScreen =
    document.getElementById("auth-screen");

const signupScreen =
    document.getElementById("signup-screen");

const appScreen =
    document.getElementById("app-screen");

const loginForm =
    document.getElementById("login-form");

const signupForm =
    document.getElementById("signup-form");

const showSignupButton =
    document.getElementById("show-signup");

const backToLoginButton =
    document.getElementById("back-to-login");


/* =========================
   LOGIN / SIGNUP SCREEN
========================= */

// CREATE ACCOUNT BUTTON
showSignupButton.addEventListener("click", () => {

    authScreen.classList.add("hidden");

    signupScreen.classList.remove("hidden");

});


// BACK TO LOGIN
backToLoginButton.addEventListener("click", () => {

    signupScreen.classList.add("hidden");

    authScreen.classList.remove("hidden");

});


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;

    try {

        const supabase = await getSupabase();

        const { error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            alert(error.message);
            return;
        }

        openApp();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to HUNDO right now. Please try again."
        );

    }

});


/* =========================
   SIGNUP
========================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("signup-name").value.trim();

    const age =
        Number(
            document.getElementById("signup-age").value
        );

    const email =
        document.getElementById("signup-email").value.trim();

    const password =
        document.getElementById("signup-password").value;


    /* =========================
       VALIDATION
    ========================= */

    if (!name || !age || !email || !password) {

        alert("Please fill in all fields.");

        return;
    }


    if (age < 1 || age > 120) {

        alert("Please enter a valid age.");

        return;
    }


    if (password.length < 8) {

        alert(
            "Password must be at least 8 characters."
        );

        return;
    }


    try {

        const supabase = await getSupabase();


        /* =========================
           CREATE AUTH ACCOUNT
        ========================= */

        const { data, error } =
            await supabase.auth.signUp({
                email: email,
                password: password
            });


        if (error) {

            alert(error.message);

            return;
        }


        if (!data.user) {

            alert(
                "Account could not be created."
            );

            return;
        }


        /* =========================
           SAVE PROFILE
        ========================= */

        const { error: profileError } =
            await supabase
                .from("profiles")
                .update({
                    name: name,
                    age: age
                })
                .eq("id", data.user.id);


        if (profileError) {

            alert(profileError.message);

            return;
        }


        /* =========================
           OPEN APP
        ========================= */

        openApp();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to HUNDO right now. Please try again."
        );

    }

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

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");


navItems.forEach((navItem) => {

    navItem.addEventListener("click", () => {

        const pageId =
            navItem.dataset.page;


        pages.forEach((page) => {

            page.classList.add("hidden");

        });


        const selectedPage =
            document.getElementById(pageId);


        if (selectedPage) {

            selectedPage.classList.remove("hidden");

        }


        navItems.forEach((item) => {

            item.classList.remove("active");

        });


        navItem.classList.add("active");

    });

});


/* =========================
   HOME → LOG ACTIVITY
========================= */

const homeLogButton =
    document.getElementById("home-log-button");


homeLogButton.addEventListener("click", () => {

    pages.forEach((page) => {

        page.classList.add("hidden");

    });


    document
        .getElementById("log-page")
        .classList.remove("hidden");


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

const activityTypes =
    document.querySelectorAll(".activity-type");

let selectedActivityType = "run";


activityTypes.forEach((button) => {

    button.addEventListener("click", () => {

        activityTypes.forEach((item) => {

            item.classList.remove("active");

        });


        button.classList.add("active");


        selectedActivityType =
            button.dataset.type;

    });

});


/* =========================
   TEMPORARY ACTIVITY POST
========================= */

const activityForm =
    document.getElementById("activity-form");


activityForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const distance =
        document.getElementById("distance").value;

    const duration =
        document.getElementById("duration").value;

    const caption =
        document.getElementById("caption").value;


    console.log({
        activityType: selectedActivityType,
        distance: distance,
        duration: duration,
        caption: caption
    });


    alert(
        "Activity logged! Supabase activity connection comes next."
    );


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


/* =========================
   STARTUP
========================= */

console.log("HUNDO loaded successfully.");
