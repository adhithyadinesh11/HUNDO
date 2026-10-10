/* =====================================================
   HUNDO — APP.JS
   Cross-platform / mobile-safe version
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://vdrjynreworkifysxuhd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zq-tc602UONo5fg90pfebg_57-WM8cC";


let supabaseClient = null;


/* =====================================================
   SUPABASE INITIALIZATION
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

        console.log(
            "HUNDO: Supabase initialized."
        );

        return true;
    }


    console.error(
        "HUNDO: Supabase library was not loaded."
    );

    return false;
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSupabase();

        initializeApp();

    }
);


/* =====================================================
   APP INITIALIZATION
===================================================== */

function initializeApp() {


    /* =================================================
       SCREENS
    ================================================= */

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


    /* =================================================
       AUTH BUTTONS
    ================================================= */

    const showSignupButton =
        document.getElementById(
            "show-signup"
        );

    const backToLoginButton =
        document.getElementById(
            "back-to-login"
        );


    /* =================================================
       SHOW SIGNUP
    ================================================= */

    if (showSignupButton) {

        showSignupButton.addEventListener(
            "click",
            function () {

                authScreen.classList.add(
                    "hidden"
                );

                signupScreen.classList.remove(
                    "hidden"
                );

                window.scrollTo(
                    0,
                    0
                );

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

                signupScreen.classList.add(
                    "hidden"
                );

                authScreen.classList.remove(
                    "hidden"
                );

                window.scrollTo(
                    0,
                    0
                );

            }
        );

    }


    /* =================================================
       LOGIN FORM
    ================================================= */

    const loginForm =
        document.getElementById(
            "login-form"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!supabaseClient) {

                    const connected =
                        initializeSupabase();


                    if (!connected) {

                        alert(
                            "HUNDO could not connect to Supabase. Please refresh and try again."
                        );

                        return;
                    }

                }


                const email =
                    document
                        .getElementById(
                            "login-email"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "login-password"
                        )
                        .value;


                try {

                    const {
                        error
                    } =
                        await supabaseClient.auth
                            .signInWithPassword({

                                email:
                                    email,

                                password:
                                    password

                            });


                    if (error) {

                        alert(
                            error.message
                        );

                        return;
                    }


                    openApp();

                }
                catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    alert(
                        "Something went wrong while logging in."
                    );

                }

            }
        );

    }


    /* =================================================
       SIGNUP FORM
    ================================================= */

    const signupForm =
        document.getElementById(
            "signup-form"
        );


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!supabaseClient) {

                    const connected =
                        initializeSupabase();


                    if (!connected) {

                        alert(
                            "HUNDO could not connect to Supabase. Please refresh and try again."
                        );

                        return;
                    }

                }


                const name =
                    document
                        .getElementById(
                            "signup-name"
                        )
                        .value
                        .trim();


                const age =
                    Number(
                        document
                            .getElementById(
                                "signup-age"
                            )
                            .value
                    );


                const email =
                    document
                        .getElementById(
                            "signup-email"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "signup-password"
                        )
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
                       CREATE ACCOUNT
                    ------------------------------------- */

                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth
                            .signUp({

                                email:
                                    email,

                                password:
                                    password

                            });


                    if (error) {

                        console.error(
                            "Signup error:",
                            error
                        );


                        alert(
                            error.message
                        );

                        return;
                    }


                    if (
                        !data ||
                        !data.user
                    ) {

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
                            .from(
                                "profiles"
                            )
                            .update({

                                name:
                                    name,

                                age:
                                    age

                            })
                            .eq(
                                "id",
                                data.user.id
                            );


                    if (profileError) {

                        console.error(
                            "Profile error:",
                            profileError
                        );


                        alert(
                            "Your account was created, but your profile could not be saved."
                        );

                        return;
                    }


                    /* -------------------------------------
                       OPEN HUNDO
                    ------------------------------------- */

                    openApp();

                }
                catch (error) {

                    console.error(
                        "Signup exception:",
                        error
                    );


                    alert(
                        "Something went wrong while creating your account."
                    );

                }

            }
        );

    }


    /* =================================================
       NAVIGATION
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


                    window.scrollTo(
                        0,
                        0
                    );

                }
            );

        }
    );


    /* =================================================
       HOME → LOG ACTIVITY
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


                const logPage =
                    document.getElementById(
                        "log-page"
                    );


                if (logPage) {

                    logPage.classList.remove(
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


                const logNav =
                    document.querySelector(
                        '[data-page="log-page"]'
                    );


                if (logNav) {

                    logNav.classList.add(
                        "active"
                    );

                }


                window.scrollTo(
                    0,
                    0
                );

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
            function (event) {

                event.preventDefault();


                const distance =
                    Number(
                        document
                            .getElementById(
                                "distance"
                            )
                            .value
                    );


                const duration =
                    document
                        .getElementById(
                            "duration"
                        )
                        .value;


                const caption =
                    document
                        .getElementById(
                            "caption"
                        )
                        .value
                        .trim();


                if (
                    !distance ||
                    distance <= 0
                ) {

                    alert(
                        "Please enter a valid distance."
                    );

                    return;
                }


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


                const runButton =
                    document.querySelector(
                        '[data-type="run"]'
                    );


                if (runButton) {

                    runButton.classList.add(
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
       EXISTING SESSION
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


    window.scrollTo(
        0,
        0
    );

}


/* =====================================================
   SESSION CHECK
===================================================== */

async function checkExistingSession() {

    if (!supabaseClient) {

        return;
    }


    try {

        const {
            data
        } =
            await supabaseClient.auth
                .getSession();


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
   HUNDO READY
===================================================== */

console.log(
    "HUNDO loaded."
);
