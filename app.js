/* =====================================================
   HUNDO — APP.JS
   Cross-platform version
   iPhone + Android + Desktop
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://vdrjynreworkifysxuhd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zq-tc602UONo5fg90pfeb_57-WM8cC";


let supabaseClient = null;


/* =====================================================
   SAFE SUPABASE INITIALIZATION
===================================================== */

function initializeSupabase() {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        console.log("Supabase initialized.");

        return true;
    }

    console.error(
        "Supabase library did not load."
    );

    return false;
}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeSupabase();

        initializeHUNDO();

    }
);


/* =====================================================
   INITIALIZE APP
===================================================== */

function initializeHUNDO() {

    /* ---------------------------------------------
       SCREEN ELEMENTS
    --------------------------------------------- */

    const authScreen =
        document.getElementById("auth-screen");

    const signupScreen =
        document.getElementById("signup-screen");

    const appScreen =
        document.getElementById("app-screen");


    /* ---------------------------------------------
       AUTH ELEMENTS
    --------------------------------------------- */

    const loginForm =
        document.getElementById("login-form");

    const signupForm =
        document.getElementById("signup-form");

    const showSignupButton =
        document.getElementById("show-signup");

    const backToLoginButton =
        document.getElementById("back-to-login");


    /* =================================================
       SHOW SIGNUP
    ================================================= */

    if (showSignupButton) {

        showSignupButton.addEventListener(
            "click",
            function () {

                authScreen.classList.add("hidden");

                signupScreen.classList.remove("hidden");

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =================================================
       BACK TO LOGIN
    ================================================= */

    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            function () {

                signupScreen.classList.add("hidden");

                authScreen.classList.remove("hidden");

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =================================================
       LOGIN
    ================================================= */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (!supabaseClient) {

                    alert(
                        "HUNDO is still connecting. Please try again."
                    );

                    initializeSupabase();

                    return;
                }


                const email =
                    document
                        .getElementById("login-email")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("login-password")
                        .value;


                try {

                    const {
                        error
                    } =
                        await supabaseClient.auth.signInWithPassword({

                            email: email,

                            password: password

                        });


                    if (error) {

                        alert(error.message);

                        return;
                    }


                    openApp();

                }
                catch (error) {

                    console.error(error);

                    alert(
                        "Unable to connect. Please try again."
                    );

                }

            }
        );

    }


    /* =================================================
       SIGNUP
    ================================================= */

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!supabaseClient) {

                    initializeSupabase();

                }


                if (!supabaseClient) {

                    alert(
                        "HUNDO is still connecting. Please try again."
                    );

                    return;
                }


                const name =
                    document
                        .getElementById("signup-name")
                        .value
                        .trim();

                const age =
                    Number(
                        document
                            .getElementById("signup-age")
                            .value
                    );

                const email =
                    document
                        .getElementById("signup-email")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("signup-password")
                        .value;


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (
                    !name ||
                    !age ||
                    !email ||
                    !password
                ) {

                    alert(
                        "Please fill in all fields."
                    );

                    return;
                }


                if (
                    age < 1 ||
                    age > 120
                ) {

                    alert(
                        "Please enter a valid age."
                    );

                    return;
                }


                if (
                    password.length < 8
                ) {

                    alert(
                        "Password must be at least 8 characters."
                    );

                    return;
                }


                try {

                    /* -------------------------------------
                       CREATE AUTH USER
                    ------------------------------------- */

                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth.signUp({

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


                    /* -------------------------------------
                       SAVE PROFILE
                    ------------------------------------- */

                    const {
                        error: profileError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({

                                name: name,

                                age: age

                            })
                            .eq(
                                "id",
                                data.user.id
                            );


                    if (profileError) {

                        console.error(
                            profileError
                        );

                        alert(
                            "Account created, but profile could not be saved."
                        );

                        return;
                    }


                    /* -------------------------------------
                       OPEN APP
                    ------------------------------------- */

                    openApp();

                }
                catch (error) {

                    console.error(error);

                    alert(
                        "Something went wrong. Please try again."
                    );

                }

            }
        );

    }


    /* =================================================
       BOTTOM NAVIGATION
    ================================================= */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    const pages =
        document.querySelectorAll(
            ".page"
        );


    navItems.forEach(
        function (navItem) {

            navItem.addEventListener(
                "click",
                function () {

                    const pageId =
                        navItem.dataset.page;


                    pages.forEach(
                        function (page) {

                            page.classList.add(
                                "hidden"
                            );

                        }
                    );


                    const selectedPage =
                        document.getElementById(
                            pageId
                        );


                    if (selectedPage) {

                        selectedPage.classList.remove(
                            "hidden"
                        );

                    }


                    navItems.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    navItem.classList.add(
                        "active"
                    );


                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

        }
    );


    /* =================================================
       HOME LOG BUTTON
    ================================================= */

    const homeLogButton =
        document.getElementById(
            "home-log-button"
        );


    if (homeLogButton) {

        homeLogButton.addEventListener(
            "click",
            function () {

                pages.forEach(
                    function (page) {

                        page.classList.add(
                            "hidden"
                        );

                    }
                );


                document
                    .getElementById("log-page")
                    .classList.remove(
                        "hidden"
                    );


                navItems.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                const logNav =
                    document.querySelector(
                        '[data-page="log-page"]'
                    );


                if (logNav) {

                    logNav.classList.add(
                        "active"
                    );

                }


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =================================================
       ACTIVITY TYPE
    ================================================= */

    const activityTypes =
        document.querySelectorAll(
            ".activity-type"
        );


    let selectedActivityType =
        "run";


    activityTypes.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    activityTypes.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedActivityType =
                        button.dataset.type;

                }
            );

        }
    );


    /* =================================================
       ACTIVITY FORM
    ================================================= */

    const activityForm =
        document.getElementById(
            "activity-form"
        );


    if (activityForm) {

        activityForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const distance =
                    Number(
                        document
                            .getElementById("distance")
                            .value
                    );


                if (
                    !distance ||
                    distance <= 0
                ) {

                    alert(
                        "Please enter a valid distance."
                    );

                    return;
                }


                const durationValue =
                    document
                        .getElementById("duration")
                        .value;


                const duration =
                    durationValue
                        ? Number(durationValue)
                        : null;


                const caption =
                    document
                        .getElementById("caption")
                        .value
                        .trim();


                console.log({

                    activityType:
                        selectedActivityType,

                    distance:
                        distance,

                    duration:
                        duration,

                    caption:
                        caption

                });


                alert(
                    "Activity logging will be connected to Supabase next."
                );


                activityForm.reset();


                activityTypes.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                const firstActivity =
                    document.querySelector(
                        ".activity-type[data-type='run']"
                    );


                if (firstActivity) {

                    firstActivity.classList.add(
                        "active"
                    );

                }


                selectedActivityType =
                    "run";

            }
        );

    }


    /* =================================================
       LEADERBOARD TABS
    ================================================= */

    const leaderboardTabs =
        document.querySelectorAll(
            ".leaderboard-tab"
        );


    leaderboardTabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    leaderboardTabs.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );

                }
            );

        }
    );


    /* =================================================
       LOGOUT
    ================================================= */

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                if (supabaseClient) {

                    await supabaseClient.auth.signOut();

                }


                appScreen.classList.add(
                    "hidden"
                );

                signupScreen.classList.add(
                    "hidden"
                );

                authScreen.classList.remove(
                    "hidden"
                );

            }
        );

    }


    /* =================================================
       WEIGHT FORM
    ================================================= */

    const weightForm =
        document.getElementById(
            "weight-form"
        );


    if (weightForm) {

        weightForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const weight =
                    document
                        .getElementById("weight")
                        .value;


                if (!weight) {

                    alert(
                        "Please enter your weight."
                    );

                    return;
                }


                alert(
                    "Weight tracker will be connected to Supabase next."
                );


                weightForm.reset();

            }
        );

    }


    /* =================================================
       INITIAL SESSION CHECK
    ================================================= */

    checkExistingSession();

}


/* =====================================================
   OPEN APP
===================================================== */

function openApp() {

    const authScreen =
        document.getElementById(
            "auth-screen"
        );

    const signupScreen =
        document.getElementById(
            "signup-screen"
        );

    const appScreen =
        document.getElementById(
            "app-screen"
        );


    authScreen.classList.add(
        "hidden"
    );

    signupScreen.classList.add(
        "hidden"
    );

    appScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   EXISTING SESSION
===================================================== */

async function checkExistingSession() {

    if (!supabaseClient) {

        return;
    }


    try {

        const {
            data
        } =
            await supabaseClient.auth.getSession();


        if (
            data &&
            data.session
        ) {

            openApp();

        }

    }
    catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

}


/* =====================================================
   PREVENT IOS DOUBLE-TAP / BUTTON WEIRDNESS
===================================================== */

document.addEventListener(
    "touchstart",
    function () {},
    {
        passive: true
    }
);


/* =====================================================
   HUNDO LOADED
===================================================== */

console.log(
    "HUNDO cross-platform app loaded."
);
