/* =========================
   HUNDO — APP.JS
========================= */


/* =========================
   SUPABASE CONNECTION
========================= */

const SUPABASE_URL = "https://vdrjynreworkifysxuhd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zq-tc602UONo5fg90pfebg_57-WM8cC";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


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
   REAL SUPABASE LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;


    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });


    if (error) {

        alert(error.message);
        return;

    }


    openApp();

});


/* =========================
   REAL SUPABASE SIGNUP
========================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name =
        document.getElementById("signup-name").value.trim();

    const age =
        Number(document.getElementById("signup-age").value);

    const email =
        document.getElementById("signup-email").value.trim();

    const password =
        document.getElementById("signup-password").value;


    /* Basic validation */

    if (!name || !age || !email || !password) {

        alert("Please fill in all fields.");
        return;

    }


    if (age < 1 || age > 120) {

        alert("Please enter a valid age.");
        return;

    }


    if (password.length < 8) {

        alert("Password must be at least 8 characters.");
        return;

    }


    /* Create Supabase account */

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

        alert("Account could not be created.");
        return;

    }


    /* Save profile information */

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

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");


navItems.forEach((navItem) => {

    navItem.addEventListener("click", () => {

        const pageId =
            navItem.dataset.page;


        /* Hide every page */

        pages.forEach((page) => {

            page.classList.add("hidden");

        });


        /* Show selected page */

        const selectedPage =
            document.getElementById(pageId);


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


        console.log(
            "Selected activity:",
            selectedActivityType
        );

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
