/* =========================================================
   HUNDO APP
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://vdrjynreworkifysxuhd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zq-tc602UONo5fg90pfebg_57-WM8cC";

let supabaseClient = null;

let currentUser = null;
let currentProfile = null;
let currentChallenge = null;

let selectedActivityType = "run";
let selectedBoard = "runwalk";

let selectedActivityPhotos = [];

let toastTimer = null;


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        storage: window.localStorage,
                        storageKey: "hundo-auth",
                        flowType: "pkce"
                    }
                }
            );

    } else {

        console.error("Supabase failed to load.");

        hideSplash();

        showAuth();

        return;
    }


    setupUI();

    setupDurationPicker();

    setupPhotoInputs();

    setupAuthListener();


    /*
       Give the HUNDO logo time to reveal.
    */

    setTimeout(
        checkSession,
        1300
    );

});


/* =========================================================
   BASIC UI
========================================================= */

function setupUI() {

    const showSignup =
        document.getElementById("show-signup");

    const backLogin =
        document.getElementById("back-to-login");

    const loginForm =
        document.getElementById("login-form");

    const signupForm =
        document.getElementById("signup-form");

    const homeLogButton =
        document.getElementById("home-log-button");

    const activityForm =
        document.getElementById("activity-form");

    const saveProfileButton =
        document.getElementById("save-profile-button");

    const weightForm =
        document.getElementById("weight-form");

    const logoutButton =
        document.getElementById("logout-button");


    if (showSignup) {

        showSignup.addEventListener(
            "click",
            () => {

                document
                    .getElementById("auth-screen")
                    .classList.add("hidden");

                document
                    .getElementById("signup-screen")
                    .classList.remove("hidden");

            }
        );

    }


    if (backLogin) {

        backLogin.addEventListener(
            "click",
            () => {

                document
                    .getElementById("signup-screen")
                    .classList.add("hidden");

                document
                    .getElementById("auth-screen")
                    .classList.remove("hidden");

            }
        );

    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            handleSignup
        );

    }


    if (homeLogButton) {

        homeLogButton.addEventListener(
            "click",
            () => showPage("log-page")
        );

    }


    if (activityForm) {

        activityForm.addEventListener(
            "submit",
            handleActivitySubmit
        );

    }


    if (saveProfileButton) {

        saveProfileButton.addEventListener(
            "click",
            saveProfile
        );

    }


    if (weightForm) {

        weightForm.addEventListener(
            "submit",
            addWeight
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }


    /*
       Bottom navigation
    */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const page =
                            item.dataset.page;

                        showPage(page);

                    }
                );

            }
        );


    /*
       Activity types
    */

    document
        .querySelectorAll(".activity-type")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(".activity-type")
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
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


    /*
       Leaderboard tabs
    */

    document
        .querySelectorAll(".leaderboard-tab")
        .forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".leaderboard-tab"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        tab.classList.add(
                            "active"
                        );

                        selectedBoard =
                            tab.dataset.board;

                        loadLeaderboard();

                    }
                );

            }
        );

}


/* =========================================================
   AUTH
========================================================= */

function setupAuthListener() {

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (
                event === "SIGNED_OUT"
            ) {

                currentUser = null;
                currentProfile = null;
                currentChallenge = null;

                showAuth();

                return;
            }


            if (
                session &&
                (
                    event === "SIGNED_IN" ||
                    event === "INITIAL_SESSION"
                )
            ) {

                currentUser =
                    session.user;

            }

        }
    );

}


async function handleLogin(event) {

    event.preventDefault();

    const button =
        event.target.querySelector(
            "button[type='submit']"
        );

    button.disabled = true;
    button.textContent = "Logging in…";


    const email =
        document
            .getElementById("login-email")
            .value
            .trim();

    const password =
        document
            .getElementById("login-password")
            .value;


    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword(
            {
                email,
                password
            }
        );


    button.disabled = false;
    button.textContent = "Log in";


    if (error) {

        showToast(
            error.message
        );

        return;
    }


    currentUser =
        data.user;


    await openApp();

}


async function handleSignup(event) {

    event.preventDefault();


    const button =
        event.target.querySelector(
            "button[type='submit']"
        );

    button.disabled = true;
    button.textContent = "Creating…";


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


    if (
        !name ||
        age < 1 ||
        age > 120 ||
        password.length < 8
    ) {

        showToast(
            "Please check your name, age and password."
        );

        button.disabled = false;
        button.textContent = "Join HUNDO";

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.signUp(
            {
                email,
                password
            }
        );


    if (error) {

        showToast(
            error.message
        );

        button.disabled = false;
        button.textContent = "Join HUNDO";

        return;
    }


    if (!data.user) {

        showToast(
            "Account could not be created."
        );

        button.disabled = false;
        button.textContent = "Join HUNDO";

        return;
    }


    currentUser =
        data.user;


    /*
       The trigger creates the profile row.
       We now fill in the name and age.
    */

    const {
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .update(
                {
                    name,
                    age
                }
            )
            .eq(
                "id",
                data.user.id
            );


    if (profileError) {

        console.error(
            profileError
        );

        showToast(
            "Account created, but profile details could not be saved."
        );

        button.disabled = false;
        button.textContent = "Join HUNDO";

        return;
    }


    button.disabled = false;
    button.textContent = "Join HUNDO";


    await openApp();

}


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

    hideSplash();


    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            error
        );

        showAuth();

        return;
    }


    if (
        data &&
        data.session &&
        data.session.user
    ) {

        currentUser =
            data.session.user;

        await openApp();

    } else {

        showAuth();

    }

}


function showAuth() {

    document
        .getElementById("auth-screen")
        .classList.remove("hidden");

    document
        .getElementById("signup-screen")
        .classList.add("hidden");

    document
        .getElementById("app-screen")
        .classList.add("hidden");

}


function hideSplash() {

    const splash =
        document.getElementById(
            "splash-screen"
        );

    if (splash) {

        splash.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   OPEN APP
========================================================= */

async function openApp() {

    if (!currentUser) {

        const {
            data
        } =
            await supabaseClient.auth.getUser();

        currentUser =
            data.user;

    }


    if (!currentUser) {

        showAuth();

        return;
    }


    document
        .getElementById("auth-screen")
        .classList.add("hidden");

    document
        .getElementById("signup-screen")
        .classList.add("hidden");

    document
        .getElementById("app-screen")
        .classList.remove("hidden");


    await loadEverything();

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadEverything() {

    try {

        await loadChallenge();

        await loadProfile();

        await ensureParticipant();

        updateDayCounter();

        await loadHome();

        await loadLeaderboard();

        await loadProfilePage();

    } catch (error) {

        console.error(
            "HUNDO load error:",
            error
        );

        showToast(
            "Some HUNDO data could not be loaded."
        );

    }

}


/* =========================================================
   CHALLENGE
========================================================= */

async function loadChallenge() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("challenges")
            .select("*")
            .eq("name", "HUNDO")
            .order(
                "start_date",
                {
                    ascending: false
                }
            )
            .limit(1);


    if (error) {

        throw error;

    }


    if (!data || !data.length) {

        throw new Error(
            "HUNDO challenge not found."
        );

    }


    currentChallenge =
        data[0];

}


/* =========================================================
   PARTICIPANT
========================================================= */

async function ensureParticipant() {

    if (
        !currentUser ||
        !currentChallenge
    ) {

        return;
    }


    const {
        data: existing
    } =
        await supabaseClient
            .from("challenge_participants")
            .select("id")
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .limit(1);


    if (
        existing &&
        existing.length
    ) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("challenge_participants")
            .insert(
                {
                    challenge_id:
                        currentChallenge.id,

                    user_id:
                        currentUser.id
                }
            );


    /*
       Duplicate race condition is harmless.
    */

    if (
        error &&
        !String(error.message)
            .toLowerCase()
            .includes("duplicate")
    ) {

        console.error(
            "Participant error:",
            error
        );

    }

}


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    currentProfile =
        data || {
            id: currentUser.id
        };


    updateProfileUI();

}


function updateProfileUI() {

    const name =
        currentProfile?.name ||
        "Your Name";

    const age =
        currentProfile?.age;


    const profileName =
        document.getElementById(
            "profile-name"
        );

    const profileAge =
        document.getElementById(
            "profile-age"
        );

    const nameInput =
        document.getElementById(
            "profile-name-input"
        );

    const ageInput =
        document.getElementById(
            "profile-age-input"
        );


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileAge) {

        profileAge.textContent =
            age
                ? `Age ${age}`
                : "Age —";

    }


    if (nameInput) {

        nameInput.value =
            currentProfile?.name || "";

    }


    if (ageInput) {

        ageInput.value =
            currentProfile?.age || "";

    }


    updateProfilePhoto();

}


function updateProfilePhoto() {

    const image =
        document.getElementById(
            "profile-picture-image"
        );

    const placeholder =
        document.getElementById(
            "profile-picture-placeholder"
        );


    if (
        currentProfile &&
        currentProfile.profile_photo_url
    ) {

        image.src =
            currentProfile.profile_photo_url;

        image.classList.remove(
            "hidden"
        );

        placeholder.classList.add(
            "hidden"
        );

    } else {

        image.classList.add(
            "hidden"
        );

        placeholder.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile() {

    const name =
        document
            .getElementById(
                "profile-name-input"
            )
            .value
            .trim();

    const age =
        Number(
            document
                .getElementById(
                    "profile-age-input"
                )
                .value
        );


    if (!name) {

        showToast(
            "Please enter your name."
        );

        return;
    }


    if (
        !age ||
        age < 1 ||
        age > 120
    ) {

        showToast(
            "Please enter a valid age."
        );

        return;
    }


    const button =
        document.getElementById(
            "save-profile-button"
        );

    button.disabled = true;
    button.textContent = "Saving…";


    const {
        error
    } =
        await supabaseClient
            .from("profiles")
            .update(
                {
                    name,
                    age
                }
            )
            .eq(
                "id",
                currentUser.id
            );


    button.disabled = false;
    button.textContent = "Save profile";


    if (error) {

        console.error(
            error
        );

        showToast(
            error.message
        );

        return;
    }


    currentProfile.name =
        name;

    currentProfile.age =
        age;


    updateProfileUI();

    await loadHome();

    await loadLeaderboard();

    showToast(
        "Profile saved ✓"
    );

}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function setupPhotoInputs() {

    const profileInput =
        document.getElementById(
            "profile-photo-input"
        );

    const activityInput =
        document.getElementById(
            "activity-photos"
        );


    if (profileInput) {

        profileInput.addEventListener(
            "change",
            handleProfilePhoto
        );

    }


    if (activityInput) {

        activityInput.addEventListener(
            "change",
            handleActivityPhotoSelection
        );

    }

}


async function handleProfilePhoto(event) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;
    }


    if (!file.type.startsWith("image/")) {

        showToast(
            "Please choose an image."
        );

        return;
    }


    if (file.size > 15 * 1024 * 1024) {

        showToast(
            "Profile photo must be under 15 MB."
        );

        return;
    }


    showToast(
        "Uploading profile photo…"
    );


    const extension =
        getExtension(file.name);


    const path =
        `${currentUser.id}/${Date.now()}.${extension}`;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("Profile pictures")
            .upload(
                path,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {

        console.error(
            uploadError
        );

        showToast(
            "Photo upload failed. Check Storage policies."
        );

        return;
    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("Profile pictures")
            .getPublicUrl(path);


    const publicUrl =
        data.publicUrl;


    const {
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .update(
                {
                    profile_photo_url:
                        publicUrl
                }
            )
            .eq(
                "id",
                currentUser.id
            );


    if (profileError) {

        console.error(
            profileError
        );

        showToast(
            "Photo uploaded, but profile could not be updated."
        );

        return;
    }


    currentProfile.profile_photo_url =
        publicUrl;


    updateProfileUI();

    await loadHome();

    await loadLeaderboard();

    showToast(
        "Profile photo updated ✓"
    );

}


/* =========================================================
   ACTIVITY PHOTO SELECTION
========================================================= */

function handleActivityPhotoSelection(event) {

    const files =
        Array.from(
            event.target.files || []
        );


    if (files.length > 5) {

        showToast(
            "You can add up to 5 photos."
        );

    }


    selectedActivityPhotos =
        files
            .filter(
                file =>
                    file.type.startsWith("image/")
            )
            .slice(0, 5);


    renderActivityPhotoPreview();

}


function renderActivityPhotoPreview() {

    const container =
        document.getElementById(
            "activity-photo-preview"
        );


    container.innerHTML = "";


    selectedActivityPhotos.forEach(
        (file, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "photo-preview";


            const image =
                document.createElement(
                    "img"
                );

            image.src =
                URL.createObjectURL(
                    file
                );


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "photo-remove";

            remove.textContent =
                "×";


            remove.addEventListener(
                "click",
                () => {

                    selectedActivityPhotos
                        .splice(index, 1);

                    renderActivityPhotoPreview();

                }
            );


            wrapper.appendChild(
                image
            );

            wrapper.appendChild(
                remove
            );

            container.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   DURATION PICKER
========================================================= */

function setupDurationPicker() {

    const hours =
        document.getElementById(
            "duration-hours"
        );

    const minutes =
        document.getElementById(
            "duration-minutes"
        );


    if (!hours || !minutes) {

        return;
    }


    for (
        let hour = 1;
        hour <= 23;
        hour++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            hour;

        option.textContent =
            `${hour} hr`;

        hours.appendChild(
            option
        );

    }


    for (
        let minute = 5;
        minute < 60;
        minute += 5
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            minute;

        option.textContent =
            `${minute} min`;

        minutes.appendChild(
            option
        );

    }

}


/* =========================================================
   ACTIVITY SUBMIT
========================================================= */

async function handleActivitySubmit(event) {

    event.preventDefault();


    if (
        !currentUser ||
        !currentChallenge
    ) {

        showToast(
            "HUNDO is still loading. Try again."
        );

        return;
    }


    const distance =
        Number(
            document
                .getElementById(
                    "distance"
                )
                .value
        );


    const hours =
        Number(
            document
                .getElementById(
                    "duration-hours"
                )
                .value
        );


    const minutes =
        Number(
            document
                .getElementById(
                    "duration-minutes"
                )
                .value
        );


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

        showToast(
            "Enter a distance first."
        );

        return;
    }


    let durationMinutes =
        (hours * 60) + minutes;


    if (durationMinutes <= 0) {

        durationMinutes =
            null;

    }


    const button =
        document.getElementById(
            "post-activity-button"
        );


    button.disabled = true;
    button.textContent = "Posting…";


    /*
       First create the activity.
    */

    const {
        data: activity,
        error: activityError
    } =
        await supabaseClient
            .from("activities")
            .insert(
                {
                    user_id:
                        currentUser.id,

                    challenge_id:
                        currentChallenge.id,

                    activity_type:
                        selectedActivityType,

                    distance_km:
                        distance,

                    duration_minutes:
                        durationMinutes,

                    activity_date:
                        getLocalDateString(),

                    caption:
                        caption || null
                }
            )
            .select()
            .single();


    if (activityError) {

        console.error(
            activityError
        );

        button.disabled = false;
        button.textContent =
            "Post activity";

        showToast(
            activityError.message
        );

        return;
    }


    /*
       Upload activity photos.
    */

    let photoUploadFailed =
        false;


    for (
        const file of selectedActivityPhotos
    ) {

        try {

            if (
                file.size >
                15 * 1024 * 1024
            ) {

                photoUploadFailed = true;

                continue;

            }


            const extension =
                getExtension(file.name);


            const path =
                `${currentUser.id}/activities/${activity.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("activity pictures")
                    .upload(
                        path,
                        file,
                        {
                            cacheControl:
                                "3600",
                            upsert:
                                false
                        }
                    );


            if (uploadError) {

                console.error(
                    uploadError
                );

                photoUploadFailed = true;

                continue;

            }


            const {
                data
            } =
                supabaseClient
                    .storage
                    .from("activity pictures")
                    .getPublicUrl(
                        path
                    );


            const {
                error: photoRowError
            } =
                await supabaseClient
                    .from("activity_photos")
                    .insert(
                        {
                            activity_id:
                                activity.id,

                            photo_url:
                                data.publicUrl
                        }
                    );


            if (photoRowError) {

                console.error(
                    photoRowError
                );

                photoUploadFailed = true;

            }

        } catch (error) {

            console.error(
                error
            );

            photoUploadFailed = true;

        }

    }


    /*
       Reset form.
    */

    resetActivityForm();


    button.disabled = false;
    button.textContent =
        "Post activity";


    await loadHome();

    await loadLeaderboard();

    await loadProfilePage();


    showPage("home-page");


    if (photoUploadFailed) {

        showToast(
            "Activity posted. Some photos could not be uploaded."
        );

    } else {

        showToast(
            "Activity posted ✓"
        );

    }

}


/* =========================================================
   RESET ACTIVITY
========================================================= */

function resetActivityForm() {

    const form =
        document.getElementById(
            "activity-form"
        );

    if (form) {

        form.reset();

    }


    selectedActivityPhotos =
        [];


    document
        .getElementById(
            "activity-photo-preview"
        )
        .innerHTML = "";


    document
        .querySelectorAll(
            ".activity-type"
        )
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


    const run =
        document.querySelector(
            '[data-type="run"]'
        );


    if (run) {

        run.classList.add(
            "active"
        );

    }


    selectedActivityType =
        "run";


    document
        .getElementById(
            "duration-hours"
        )
        .value = "0";


    document
        .getElementById(
            "duration-minutes"
        )
        .value = "0";

}


/* =========================================================
   HOME
========================================================= */

async function loadHome() {

    if (
        !currentUser ||
        !currentChallenge
    ) {

        return;
    }


    const activities =
        await fetchChallengeActivities();


    const myActivities =
        activities.filter(
            activity =>
                activity.user_id ===
                currentUser.id
        );


    const runWalk =
        sumDistance(
            myActivities.filter(
                activity =>
                    activity.activity_type === "run" ||
                    activity.activity_type === "walk"
            )
        );


    const cycling =
        sumDistance(
            myActivities.filter(
                activity =>
                    activity.activity_type === "cycle"
            )
        );


    document
        .getElementById(
            "run-walk-total"
        )
        .textContent =
            `${runWalk.toFixed(1)} km`;


    document
        .getElementById(
            "cycling-total"
        )
        .textContent =
            `${cycling.toFixed(1)} km`;


    const rankings =
        calculateRankings(
            activities
        );


    const runWalkRank =
        rankings.runwalk.find(
            item =>
                item.user_id ===
                currentUser.id
        );


    const cyclingRank =
        rankings.cycle.find(
            item =>
                item.user_id ===
                currentUser.id
        );


    document
        .getElementById(
            "run-walk-rank"
        )
        .textContent =
            `Rank #${runWalkRank?.rank || "—"}`;


    document
        .getElementById(
            "cycling-rank"
        )
        .textContent =
            `Rank #${cyclingRank?.rank || "—"}`;


    const greeting =
        document.getElementById(
            "home-greeting"
        );


    if (greeting) {

        greeting.textContent =
            currentProfile?.name
                ? `Let's get moving, ${firstName(currentProfile.name)}.`
                : "Let's get moving.";

    }


    renderActivityFeed(
        activities
    );

}


/* =========================================================
   FETCH ACTIVITIES
========================================================= */

async function fetchChallengeActivities() {

    if (!currentChallenge) {

        return [];

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                `
                id,
                user_id,
                challenge_id,
                activity_type,
                distance_km,
                duration_minutes,
                activity_date,
                caption,
                created_at,
                updated_at,
                profiles (
                    id,
                    name,
                    age,
                    profile_photo_url
                ),
                activity_photos (
                    id,
                    photo_url
                )
                `
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(100);


    if (error) {

        console.error(
            "Activity fetch error:",
            error
        );

        return [];

    }


    return data || [];

}


/* =========================================================
   FEED
========================================================= */

function renderActivityFeed(
    activities
) {

    const container =
        document.getElementById(
            "activity-feed"
        );


    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏃</div>
                <h3>No activities yet</h3>
                <p>Be the first person to log today's activity.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        activities
            .map(
                activity =>
                    activityCardHTML(
                        activity,
                        true
                    )
            )
            .join("");

}


/* =========================================================
   ACTIVITY CARD HTML
========================================================= */

function activityCardHTML(
    activity,
    showDelete
) {

    const profile =
        activity.profiles || {};

    const name =
        profile.name ||
        "HUNDO athlete";


    const icon =
        activity.activity_type === "run"
            ? "🏃"
            : activity.activity_type === "walk"
                ? "🚶"
                : "🚴";


    const typeName =
        activity.activity_type === "run"
            ? "Run"
            : activity.activity_type === "walk"
                ? "Walk"
                : "Cycle";


    const avatar =
        profile.profile_photo_url
            ? `
                <img
                    src="${escapeAttribute(profile.profile_photo_url)}"
                    alt=""
                >
              `
            : "👤";


    const duration =
        formatDuration(
            activity.duration_minutes
        );


    const date =
        formatDate(
            activity.activity_date
        );


    const photos =
        Array.isArray(
            activity.activity_photos
        )
            ? activity.activity_photos
            : [];


    const photoHTML =
        photos.length
            ? `
                <div class="activity-photo-grid">
                    ${photos
                        .slice(0, 5)
                        .map(
                            photo =>
                                `
                                <img
                                    src="${escapeAttribute(photo.photo_url)}"
                                    alt="Activity photo"
                                    loading="lazy"
                                >
                                `
                        )
                        .join("")
                    }
                </div>
              `
            : "";


    const deleteHTML =
        showDelete &&
        activity.user_id === currentUser.id
            ? `
                <button
                    class="activity-delete"
                    type="button"
                    data-delete-activity="${activity.id}"
                >
                    Delete activity
                </button>
              `
            : "";


    return `
        <article class="activity-card">

            <div class="activity-card-header">

                <div class="feed-avatar">
                    ${avatar}
                </div>

                <div class="activity-user">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        ${date}
                    </span>

                </div>

            </div>


            <div class="activity-main">

                <div class="activity-title">

                    <div class="activity-type-name">
                        ${icon} ${typeName}
                    </div>

                    <div class="activity-distance">
                        ${Number(activity.distance_km).toFixed(1)} km
                    </div>

                </div>


                <div class="activity-meta">

                    ${
                        duration
                            ? `<span>⏱ ${duration}</span>`
                            : ""
                    }

                    <span>
                        Day ${getChallengeDay(
                            activity.activity_date
                        )}
                    </span>

                </div>


                ${
                    activity.caption
                        ? `
                            <div class="activity-caption">
                                ${escapeHTML(
                                    activity.caption
                                )}
                            </div>
                          `
                        : ""
                }


                ${photoHTML}


                ${deleteHTML}

            </div>

        </article>
    `;

}


/* =========================================================
   DELETE ACTIVITY
========================================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-delete-activity]"
            );


        if (!button) {

            return;
        }


        const activityId =
            button.dataset.deleteActivity;


        const confirmed =
            window.confirm(
                "Delete this activity?"
            );


        if (!confirmed) {

            return;
        }


        button.disabled =
            true;


        const {
            error
        } =
            await supabaseClient
                .from("activities")
                .delete()
                .eq(
                    "id",
                    activityId
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                error
            );

            showToast(
                error.message
            );

            button.disabled =
                false;

            return;

        }


        await loadHome();

        await loadLeaderboard();

        await loadProfilePage();

        showToast(
            "Activity deleted."
        );

    }
);


/* =========================================================
   LEADERBOARD
========================================================= */

async function loadLeaderboard() {

    if (!currentChallenge) {

        return;
    }


    const container =
        document.getElementById(
            "leaderboard-list"
        );


    container.innerHTML = `
        <div class="empty-state">
            Loading leaderboard…
        </div>
    `;


    /*
       Get EVERY participant.
    */

    const {
        data: participants,
        error: participantError
    } =
        await supabaseClient
            .from("challenge_participants")
            .select(
                `
                user_id,
                joined_at,
                profiles (
                    id,
                    name,
                    age,
                    profile_photo_url
                )
                `
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .order(
                "joined_at",
                {
                    ascending: true
                }
            );


    if (participantError) {

        console.error(
            participantError
        );

        container.innerHTML = `
            <div class="empty-state">
                Could not load leaderboard.
            </div>
        `;

        return;
    }


    /*
       Get all activities.
    */

    const activities =
        await fetchChallengeActivities();


    const totals = {};


    (participants || [])
        .forEach(
            participant => {

                totals[
                    participant.user_id
                ] = {
                    user_id:
                        participant.user_id,

                    name:
                        participant.profiles?.name ||
                        "HUNDO athlete",

                    photo:
                        participant.profiles?.profile_photo_url ||
                        null,

                    runwalk:
                        0,

                    cycle:
                        0
                };

            }
        );


    activities.forEach(
        activity => {

            if (
                !totals[
                    activity.user_id
                ]
            ) {

                return;
            }


            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type === "run" ||
                activity.activity_type === "walk"
            ) {

                totals[
                    activity.user_id
                ].runwalk +=
                    distance;

            }


            if (
                activity.activity_type === "cycle"
            ) {

                totals[
                    activity.user_id
                ].cycle +=
                    distance;

            }

        }
    );


    const list =
        Object.values(
            totals
        );


    list.sort(
        (a, b) =>
            b[selectedBoard] -
            a[selectedBoard]
    );


    container.innerHTML =
        list
            .map(
                (person, index) =>
                    leaderboardRowHTML(
                        person,
                        index + 1
                    )
            )
            .join("");


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No participants yet</h3>
                <p>Join HUNDO to appear here.</p>
            </div>
        `;

    }

}


/* =========================================================
   LEADERBOARD ROW
========================================================= */

function leaderboardRowHTML(
    person,
    rank
) {

    const distance =
        Number(
            person[selectedBoard]
        ) || 0;


    const avatar =
        person.photo
            ? `
                <img
                    src="${escapeAttribute(person.photo)}"
                    alt=""
                >
              `
            : "👤";


    const isMe =
        person.user_id ===
        currentUser.id;


    return `
        <div class="leaderboard-row ${isMe ? "me" : ""}">

            <div class="leaderboard-rank">
                #${rank}
            </div>


            <div class="leaderboard-person">

                <div class="leaderboard-avatar">
                    ${avatar}
                </div>

                <div>

                    <div class="leaderboard-name">
                        ${escapeHTML(person.name)}
                    </div>

                    ${
                        isMe
                            ? `
                                <div class="leaderboard-you">
                                    You
                                </div>
                              `
                            : ""
                    }

                </div>

            </div>


            <div class="leaderboard-distance">
                ${distance.toFixed(1)} km
            </div>

        </div>
    `;

}


/* =========================================================
   RANKINGS
========================================================= */

function calculateRankings(
    activities
) {

    const totals = {};


    activities.forEach(
        activity => {

            if (
                !totals[
                    activity.user_id
                ]
            ) {

                totals[
                    activity.user_id
                ] = {
                    user_id:
                        activity.user_id,

                    runwalk:
                        0,

                    cycle:
                        0
                };

            }


            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type === "run" ||
                activity.activity_type === "walk"
            ) {

                totals[
                    activity.user_id
                ].runwalk +=
                    distance;

            }


            if (
                activity.activity_type === "cycle"
            ) {

                totals[
                    activity.user_id
                ].cycle +=
                    distance;

            }

        }
    );


    const runwalk =
        Object.values(
            totals
        )
            .sort(
                (a, b) =>
                    b.runwalk -
                    a.runwalk
            )
            .map(
                (item, index) => ({
                    ...item,
                    rank:
                        index + 1
                })
            );


    const cycle =
        Object.values(
            totals
        )
            .sort(
                (a, b) =>
                    b.cycle -
                    a.cycle
            )
            .map(
                (item, index) => ({
                    ...item,
                    rank:
                        index + 1
                })
            );


    return {
        runwalk,
        cycle
    };

}


/* =========================================================
   PROFILE PAGE
========================================================= */

async function loadProfilePage() {

    if (!currentUser) {

        return;
    }


    const activities =
        await fetchChallengeActivities();


    const mine =
        activities
            .filter(
                activity =>
                    activity.user_id ===
                    currentUser.id
            )
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );


    const runWalk =
        sumDistance(
            mine.filter(
                activity =>
                    activity.activity_type === "run" ||
                    activity.activity_type === "walk"
            )
        );


    const cycling =
        sumDistance(
            mine.filter(
                activity =>
                    activity.activity_type === "cycle"
            )
        );


    document
        .getElementById(
            "profile-run-walk"
        )
        .textContent =
            `${runWalk.toFixed(1)} km`;


    document
        .getElementById(
            "profile-cycling"
        )
        .textContent =
            `${cycling.toFixed(1)} km`;


    const history =
        document.getElementById(
            "activity-history"
        );


    if (!mine.length) {

        history.innerHTML = `
            <div class="empty-state">
                No activities yet.
            </div>
        `;

    } else {

        history.innerHTML =
            mine
                .map(
                    activity => {

                        const icon =
                            activity.activity_type === "run"
                                ? "🏃 Run"
                                : activity.activity_type === "walk"
                                    ? "🚶 Walk"
                                    : "🚴 Cycle";


                        return `
                            <div class="history-item">

                                <div class="history-left">

                                    <strong>
                                        ${icon}
                                    </strong>

                                    <span>
                                        ${formatDate(
                                            activity.activity_date
                                        )}
                                    </span>

                                </div>


                                <div class="history-right">

                                    <div class="history-distance">
                                        ${Number(
                                            activity.distance_km
                                        ).toFixed(1)} km
                                    </div>

                                    ${
                                        activity.duration_minutes
                                            ? `
                                                <div class="history-duration">
                                                    ${formatDuration(
                                                        activity.duration_minutes
                                                    )}
                                                </div>
                                              `
                                            : ""
                                    }

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    await loadWeights();

}


/* =========================================================
   WEIGHT
========================================================= */

async function addWeight(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "weight-input"
        );


    const weight =
        Number(
            input.value
        );


    if (
        !weight ||
        weight <= 0
    ) {

        showToast(
            "Enter a valid weight."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("weight_logs")
            .insert(
                {
                    user_id:
                        currentUser.id,

                    weight_kg:
                        weight,

                    logged_date:
                        getLocalDateString()
                }
            );


    if (error) {

        console.error(
            error
        );

        showToast(
            error.message
        );

        return;
    }


    input.value = "";


    await loadWeights();


    showToast(
        "Weight added ✓"
    );

}


async function loadWeights() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("weight_logs")
            .select(
                "weight_kg, logged_date, created_at"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "logged_date",
                {
                    ascending: false
                }
            )
            .limit(30);


    if (error) {

        console.error(
            error
        );

        return;
    }


    const container =
        document.getElementById(
            "weight-history"
        );


    if (!data || !data.length) {

        container.innerHTML = `
            <div class="weight-entry">
                <span>No weight entries yet.</span>
                <span>Private</span>
            </div>
        `;

        return;
    }


    container.innerHTML =
        data
            .map(
                item =>
                    `
                    <div class="weight-entry">

                        <span>
                            ${formatDate(
                                item.logged_date
                            )}
                        </span>

                        <strong>
                            ${Number(
                                item.weight_kg
                            ).toFixed(1)} kg
                        </strong>

                    </div>
                    `
            )
            .join("");

}


/* =========================================================
   NAVIGATION
========================================================= */

async function showPage(
    pageId
) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.add(
                    "hidden"
                )
        );


    const page =
        document.getElementById(
            pageId
        );


    if (!page) {

        return;
    }


    page.classList.remove(
        "hidden"
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                        pageId
                );

            }
        );


    window.scrollTo(
        {
            top: 0,
            behavior: "instant"
        }
    );


    if (
        pageId ===
        "leaderboard-page"
    ) {

        await loadLeaderboard();

    }


    if (
        pageId ===
        "profile-page"
    ) {

        await loadProfilePage();

    }


    if (
        pageId ===
        "home-page"
    ) {

        await loadHome();

    }

}


/* =========================================================
   DAY COUNTER
========================================================= */

function updateDayCounter() {

    const day =
        getChallengeDay(
            getLocalDateString()
        );


    document
        .getElementById(
            "current-day"
        )
        .textContent =
            day;

}


function getChallengeDay(
    dateString
) {

    if (!currentChallenge) {

        return 1;
    }


    const start =
        parseLocalDate(
            currentChallenge.start_date
        );


    const date =
        parseLocalDate(
            dateString
        );


    const difference =
        Math.floor(
            (
                date.getTime() -
                start.getTime()
            ) /
            86400000
        );


    return Math.min(
        100,
        Math.max(
            1,
            difference + 1
        )
    );

}


/* =========================================================
   HELPERS
========================================================= */

function sumDistance(
    activities
) {

    return activities.reduce(
        (
            total,
            activity
        ) =>
            total +
            (
                Number(
                    activity.distance_km
                ) || 0
            ),
        0
    );

}


function formatDuration(
    totalMinutes
) {

    if (
        !totalMinutes ||
        totalMinutes <= 0
    ) {

        return "";

    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;


    if (hours && minutes) {

        return `${hours}h ${minutes}m`;

    }


    if (hours) {

        return `${hours}h`;

    }


    return `${minutes}m`;

}


function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        parseLocalDate(
            dateString
        );


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function parseLocalDate(
    dateString
) {

    const [
        year,
        month,
        day
    ] =
        String(
            dateString
        )
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}


function getLocalDateString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            now.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${year}-${month}-${day}`;

}


function getExtension(
    filename
) {

    const extension =
        filename
            .split(".")
            .pop()
            .toLowerCase();


    if (
        [
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif",
            "heic"
        ].includes(
            extension
        )
    ) {

        return extension;

    }


    return "jpg";

}


function firstName(
    name
) {

    return String(
        name
    )
        .trim()
        .split(/\s+/)[0];

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;
    }


    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    const confirmed =
        window.confirm(
            "Log out of HUNDO?"
        );


    if (!confirmed) {

        return;
    }


    await supabaseClient.auth.signOut();

}


/* =========================================================
   READY
========================================================= */

console.log(
    "HUNDO loaded."
);

/* =================================================
   EDIT PROFILE TOGGLE
================================================= */

const editProfileButton =
    document.getElementById("edit-profile-button");

const closeProfileEditor =
    document.getElementById("close-profile-editor");

const profileEditor =
    document.getElementById("profile-editor");

if (editProfileButton && profileEditor) {

    editProfileButton.addEventListener(
        "click",
        function () {

            profileEditor.classList.remove("hidden");

            editProfileButton.classList.add("hidden");

            window.scrollTo({
                top: profileEditor.offsetTop - 20,
                behavior: "smooth"
            });

        }
    );
}

if (closeProfileEditor && profileEditor) {

    closeProfileEditor.addEventListener(
        "click",
        function () {

            profileEditor.classList.add("hidden");

            if (editProfileButton) {
                editProfileButton.classList.remove("hidden");
            }

        }
    );
}
