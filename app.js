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
                password,
                options: {
                    data: {
                        name,
                        age
                    }
                }
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


    currentUser =
        data.user;


    if (currentUser) {

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


        await joinChallenge();

        await openApp();

    }


    button.disabled = false;
    button.textContent = "Join HUNDO";

}


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

    try {

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

            hideSplash();

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

            hideSplash();

        }

    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showAuth();

        hideSplash();

    }

}


/* =========================================================
   APP OPEN
========================================================= */

async function openApp() {

    if (!currentUser) {

        showAuth();

        hideSplash();

        return;
    }


    document
        .getElementById("auth-screen")
        ?.classList.add("hidden");

    document
        .getElementById("signup-screen")
        ?.classList.add("hidden");

    document
        .getElementById("app-screen")
        ?.classList.remove("hidden");


    await loadCurrentProfile();

    await loadChallenge();

    await ensureChallengeParticipation();

    await loadHome();

    await loadProfile();

    hideSplash();

}


/* =========================================================
   SHOW AUTH
========================================================= */

function showAuth() {

    document
        .getElementById("app-screen")
        ?.classList.add("hidden");

    document
        .getElementById("signup-screen")
        ?.classList.add("hidden");

    document
        .getElementById("auth-screen")
        ?.classList.remove("hidden");

}


/* =========================================================
   SPLASH
========================================================= */

function hideSplash() {

    const splash =
        document.getElementById(
            "hundo-splash"
        );

    if (!splash) {
        return;
    }

    splash.classList.add(
        "hidden"
    );

}


/* =========================================================
   PROFILE
========================================================= */

async function loadCurrentProfile() {

    if (!currentUser) {
        return;
    }


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
            .single();


    if (error) {

        console.error(
            "Profile load error:",
            error
        );

        return;
    }


    currentProfile =
        data;

}


async function saveProfile() {

    if (!currentUser) {
        return;
    }


    const nameInput =
        document.getElementById(
            "profile-name-input"
        );

    const ageInput =
        document.getElementById(
            "profile-age-input"
        );

    const photoInput =
        document.getElementById(
            "profile-photo-input"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const age =
        ageInput
            ? Number(ageInput.value)
            : null;


    if (
        !name ||
        !age ||
        age < 1 ||
        age > 120
    ) {

        showToast(
            "Please enter a valid name and age."
        );

        return;
    }


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


    if (error) {

        showToast(
            error.message
        );

        return;
    }


    if (
        photoInput &&
        photoInput.files &&
        photoInput.files.length
    ) {

        await uploadProfilePhoto(
            photoInput.files[0]
        );

    }


    await loadCurrentProfile();

    await loadProfile();

    await loadLeaderboard();

    showToast(
        "Profile updated."
    );

}


async function uploadProfilePhoto(file) {

    if (!currentUser || !file) {
        return;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const filePath =
        `${currentUser.id}/profile-${Date.now()}.${extension}`;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("Profile pictures")
            .upload(
                filePath,
                file,
                {
                    upsert: true,
                    contentType: file.type
                }
            );


    if (uploadError) {

        showToast(
            uploadError.message
        );

        return;
    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("Profile pictures")
            .getPublicUrl(
                filePath
            );


    if (
        !data ||
        !data.publicUrl
    ) {

        showToast(
            "Could not create photo URL."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("profiles")
            .update(
                {
                    profile_photo_url:
                        data.publicUrl
                }
            )
            .eq(
                "id",
                currentUser.id
            );


    if (error) {

        showToast(
            error.message
        );

        return;
    }


    currentProfile = {
        ...currentProfile,
        profile_photo_url:
            data.publicUrl
    };

}


async function loadProfile() {

    if (!currentUser) {
        return;
    }


    await loadCurrentProfile();


    const name =
        currentProfile?.name ||
        "Your Name";

    const age =
        currentProfile?.age
            ? `Age ${currentProfile.age}`
            : "Age —";


    const profileName =
        document.getElementById(
            "profile-name"
        );

    const profileAge =
        document.getElementById(
            "profile-age"
        );


    if (profileName) {
        profileName.textContent =
            name;
    }


    if (profileAge) {
        profileAge.textContent =
            age;
    }


    const profilePicture =
        document.getElementById(
            "profile-picture"
        );


    if (profilePicture) {

        if (
            currentProfile?.profile_photo_url
        ) {

            profilePicture.innerHTML =
                `
                <img
                    src="${escapeAttribute(
                        currentProfile.profile_photo_url +
                        (
                            currentProfile.profile_photo_url.includes("?")
                                ? "&"
                                : "?"
                        ) +
                        "v=" +
                        Date.now()
                    )}"
                    alt="Profile"
                >
                `;

        } else {

            profilePicture.textContent =
                "👤";

        }

    }


    const nameInput =
        document.getElementById(
            "profile-name-input"
        );

    const ageInput =
        document.getElementById(
            "profile-age-input"
        );


    if (nameInput) {
        nameInput.value =
            currentProfile?.name || "";
    }


    if (ageInput) {
        ageInput.value =
            currentProfile?.age || "";
    }


    await loadProfileTotals();

    await loadWeights();

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
            .order(
                "start_date",
                {
                    ascending: false
                }
            )
            .limit(1)
            .maybeSingle();


    if (error) {

        console.error(
            "Challenge error:",
            error
        );

        return;
    }


    currentChallenge =
        data;

    updateDayCounter();

}


function updateDayCounter() {

    if (!currentChallenge) {
        return;
    }


    const start =
        new Date(
            `${currentChallenge.start_date}T00:00:00`
        );

    const end =
        new Date(
            `${currentChallenge.end_date}T23:59:59`
        );

    const now =
        new Date();


    let day =
        Math.floor(
            (
                now - start
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1;


    if (day < 1) {
        day = 1;
    }


    if (
        now > end
    ) {

        day =
            Math.floor(
                (
                    end - start
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            ) + 1;

    }


    const dayCounter =
        document.getElementById(
            "day-counter"
        );


    if (dayCounter) {

        dayCounter.textContent =
            `DAY ${day} / 100`;

    }


    const homeDay =
        document.getElementById(
            "home-day"
        );


    if (homeDay) {

        homeDay.textContent =
            `DAY ${day} / 100`;

    }

}


/* =========================================================
   CHALLENGE PARTICIPATION
========================================================= */

async function ensureChallengeParticipation() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const {
        data
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
            .maybeSingle();


    if (data) {
        return;
    }


    await joinChallenge();

}


async function joinChallenge() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from(
                "challenge_participants"
            )
            .insert(
                {
                    challenge_id:
                        currentChallenge.id,

                    user_id:
                        currentUser.id
                }
            );


    if (
        error &&
        !error.message.includes(
            "duplicate"
        )
    ) {

        console.error(
            "Join challenge error:",
            error
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

async function showPage(pageId) {

    document
        .querySelectorAll(
            ".page"
        )
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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                        pageId
                );

            }
        );


    if (
        pageId ===
        "home-page"
    ) {

        await loadHome();

    }


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

        await loadProfile();

    }


    if (
        pageId ===
        "log-page"
    ) {

        setupDurationPicker();

    }

}


/* =========================================================
   HOME
========================================================= */

async function loadHome() {

    await loadHomeTotals();

    await loadActivityFeed();

    await loadStreak();

}


/* =========================================================
   HOME TOTALS
========================================================= */

async function loadHomeTotals() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                "activity_type,distance_km"
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            error
        );

        return;
    }


    let runWalk =
        0;

    let cycle =
        0;


    (data || []).forEach(
        activity => {

            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type ===
                    "run" ||
                activity.activity_type ===
                    "walk"
            ) {

                runWalk +=
                    distance;

            }


            if (
                activity.activity_type ===
                    "cycle"
            ) {

                cycle +=
                    distance;

            }

        }
    );


    const runWalkElement =
        document.getElementById(
            "home-runwalk-total"
        );

    const cycleElement =
        document.getElementById(
            "home-cycle-total"
        );


    if (runWalkElement) {

        runWalkElement.textContent =
            `${runWalk.toFixed(1)} km`;

    }


    if (cycleElement) {

        cycleElement.textContent =
            `${cycle.toFixed(1)} km`;

    }

}


/* =========================================================
   PROFILE TOTALS
========================================================= */

async function loadProfileTotals() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                "activity_type,distance_km"
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            error
        );

        return;
    }


    let runWalk =
        0;

    let cycle =
        0;


    (data || []).forEach(
        activity => {

            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type ===
                    "run" ||
                activity.activity_type ===
                    "walk"
            ) {

                runWalk +=
                    distance;

            }


            if (
                activity.activity_type ===
                    "cycle"
            ) {

                cycle +=
                    distance;

            }

        }
    );


    const runWalkElement =
        document.getElementById(
            "profile-runwalk-total"
        );

    const cycleElement =
        document.getElementById(
            "profile-cycle-total"
        );


    if (runWalkElement) {

        runWalkElement.textContent =
            `${runWalk.toFixed(1)} km`;

    }


    if (cycleElement) {

        cycleElement.textContent =
            `${cycle.toFixed(1)} km`;

    }


    await loadActivityHistory();

}


/* =========================================================
   ACTIVITY HISTORY
========================================================= */

async function loadActivityHistory() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const container =
        document.getElementById(
            "activity-history"
        );


    if (!container) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select("*")
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "activity_date",
                {
                    ascending: false
                }
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            error
        );

        return;
    }


    if (
        !data ||
        !data.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                No activities yet.
            </div>
            `;

        return;
    }


    container.innerHTML =
        data
            .map(
                activity =>
                    renderProfileActivity(
                        activity
                    )
            )
            .join("");

}


function renderProfileActivity(activity) {

    const emoji =
        activity.activity_type === "run"
            ? "🏃"
            : activity.activity_type === "walk"
                ? "🚶"
                : "🚴";


    const duration =
        formatDuration(
            activity.duration_seconds ||
            (
                Number(
                    activity.duration_minutes
                ) * 60
            )
        );


    return `
        <div class="history-item">

            <div class="history-icon">
                ${emoji}
            </div>

            <div class="history-content">

                <strong>
                    ${capitalize(
                        activity.activity_type
                    )}
                </strong>

                <span>
                    ${Number(
                        activity.distance_km
                    ).toFixed(1)} km
                </span>

                ${
                    duration
                        ? `
                            <span>
                                ${duration}
                            </span>
                          `
                        : ""
                }

            </div>

            <div class="history-date">
                ${formatDate(
                    activity.activity_date
                )}
            </div>

        </div>
    `;

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
            "Please log in first."
        );

        return;
    }


    const form =
        event.target;


    const button =
        form.querySelector(
            "button[type='submit']"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Posting…";

    }


    const distanceInput =
        document.getElementById(
            "activity-distance"
        );


    const captionInput =
        document.getElementById(
            "activity-caption"
        );


    const activityDateInput =
        document.getElementById(
            "activity-date"
        );


    const distance =
        Number(
            distanceInput?.value
        );


    const caption =
        captionInput?.value
            ?.trim() || null;


    const activityDate =
        activityDateInput?.value ||
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    if (
        !distance ||
        distance <= 0
    ) {

        showToast(
            "Please enter a valid distance."
        );

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Post Activity";

        }

        return;
    }


    const durationSeconds =
        getSelectedDurationSeconds();


    const {
        data: activity,
        error
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

                    duration_seconds:
                        durationSeconds,

                    duration_minutes:
                        durationSeconds
                            ? Math.ceil(
                                durationSeconds /
                                60
                            )
                            : null,

                    activity_date:
                        activityDate,

                    caption
                }
            )
            .select()
            .single();


    if (error) {

        console.error(
            "Activity insert error:",
            error
        );

        showToast(
            error.message
        );

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Post Activity";

        }

        return;
    }


    await uploadActivityPhotos(
        activity.id
    );


    selectedActivityPhotos =
        [];


    resetActivityForm();


    await loadHome();

    await loadProfile();

    await loadLeaderboard();


    showPage(
        "home-page"
    );


    showToast(
        "Activity posted!"
    );


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "Post Activity";

    }

}


/* =========================================================
   UPLOAD ACTIVITY PHOTOS
========================================================= */

async function uploadActivityPhotos(
    activityId
) {

    if (
        !selectedActivityPhotos.length
    ) {
        return;
    }


    for (
        const file of
        selectedActivityPhotos
    ) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const path =
            `${currentUser.id}/${activityId}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}.${extension}`;


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
                        upsert: false,
                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "Activity photo upload error:",
                uploadError
            );

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


        if (
            !data ||
            !data.publicUrl
        ) {
            continue;
        }


        const {
            error
        } =
            await supabaseClient
                .from("activity_photos")
                .insert(
                    {
                        activity_id:
                            activityId,

                        photo_url:
                            data.publicUrl
                    }
                );


        if (error) {

            console.error(
                "Activity photo DB error:",
                error
            );

        }

    }

}


/* =========================================================
   PHOTO INPUTS
========================================================= */

function setupPhotoInputs() {

    const input =
        document.getElementById(
            "activity-photo-input"
        );


    const preview =
        document.getElementById(
            "activity-photo-preview"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        event => {

            selectedActivityPhotos =
                Array.from(
                    event.target.files ||
                    []
                );


            if (!preview) {
                return;
            }


            preview.innerHTML =
                "";


            selectedActivityPhotos.forEach(
                file => {

                    const url =
                        URL.createObjectURL(
                            file
                        );


                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        url;

                    img.alt =
                        "Selected activity photo";


                    preview.appendChild(
                        img
                    );

                }
            );

        }
    );


    const profileInput =
        document.getElementById(
            "profile-photo-input"
        );


    const profileButton =
        document.getElementById(
            "profile-photo-button"
        );


    if (
        profileButton &&
        profileInput
    ) {

        profileButton.addEventListener(
            "click",
            () => profileInput.click()
        );

    }

}


/* =========================================================
   DURATION PICKER
========================================================= */

let selectedDurationHours = 0;
let selectedDurationMinutes = 0;
let selectedDurationSeconds = 0;


function setupDurationPicker() {

    const hours =
        document.getElementById(
            "duration-hours"
        );

    const minutes =
        document.getElementById(
            "duration-minutes"
        );

    const seconds =
        document.getElementById(
            "duration-seconds"
        );


    if (!hours || !minutes || !seconds) {
        return;
    }


    populateDurationSelect(
        hours,
        23
    );

    populateDurationSelect(
        minutes,
        59
    );

    populateDurationSelect(
        seconds,
        59
    );


    hours.addEventListener(
        "change",
        () => {

            selectedDurationHours =
                Number(
                    hours.value
                );

        }
    );


    minutes.addEventListener(
        "change",
        () => {

            selectedDurationMinutes =
                Number(
                    minutes.value
                );

        }
    );


    seconds.addEventListener(
        "change",
        () => {

            selectedDurationSeconds =
                Number(
                    seconds.value
                );

        }
    );

}


function populateDurationSelect(
    select,
    max
) {

    if (
        select.options &&
        select.options.length
    ) {
        return;
    }


    for (
        let i = 0;
        i <= max;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            i;

        option.textContent =
            String(i).padStart(
                2,
                "0"
            );


        select.appendChild(
            option
        );

    }

}


function getSelectedDurationSeconds() {

    const hours =
        Number(
            document.getElementById(
                "duration-hours"
            )?.value || 0
        );

    const minutes =
        Number(
            document.getElementById(
                "duration-minutes"
            )?.value || 0
        );

    const seconds =
        Number(
            document.getElementById(
                "duration-seconds"
            )?.value || 0
        );


    const total =
        (
            hours *
            60 *
            60
        ) +
        (
            minutes *
            60
        ) +
        seconds;


    return total > 0
        ? total
        : null;

}


/* =========================================================
   LEADERBOARD
========================================================= */

async function loadLeaderboard() {

    if (!currentChallenge) {
        return;
    }


    const {
        data: participants,
        error
    } =
        await supabaseClient
            .from(
                "challenge_participants"
            )
            .select(
                `
                user_id,
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
            );


    if (error) {

        console.error(
            "Leaderboard participant error:",
            error
        );

        return;
    }


    const userIds =
        (participants || [])
            .map(
                item =>
                    item.user_id
            );


    let activities =
        [];


    if (userIds.length) {

        const {
            data,
            error:
                activityError
        } =
            await supabaseClient
                .from("activities")
                .select(
                    `
                    user_id,
                    activity_type,
                    distance_km
                    `
                )
                .eq(
                    "challenge_id",
                    currentChallenge.id
                )
                .in(
                    "user_id",
                    userIds
                );


        if (activityError) {

            console.error(
                "Leaderboard activity error:",
                activityError
            );

            return;
        }


        activities =
            data || [];

    }


    const totals =
        new Map();


    userIds.forEach(
        id => {

            totals.set(
                id,
                {
                    runwalk: 0,
                    cycle: 0
                }
            );

        }
    );


    activities.forEach(
        activity => {

            const entry =
                totals.get(
                    activity.user_id
                );


            if (!entry) {
                return;
            }


            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type ===
                    "run" ||
                activity.activity_type ===
                    "walk"
            ) {

                entry.runwalk +=
                    distance;

            }


            if (
                activity.activity_type ===
                    "cycle"
            ) {

                entry.cycle +=
                    distance;

            }

        }
    );


    const rows =
        (participants || [])
            .map(
                participant => {

                    const profile =
                        participant.profiles ||
                        {};

                    const total =
                        totals.get(
                            participant.user_id
                        ) || {
                            runwalk: 0,
                            cycle: 0
                        };


                    return {
                        id:
                            participant.user_id,

                        name:
                            profile.name ||
                            "Participant",

                        age:
                            profile.age,

                        photo:
                            profile.profile_photo_url ||
                            null,

                        distance:
                            selectedBoard ===
                                "cycle"
                                ? total.cycle
                                : total.runwalk
                    };

                }
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.distance -
                    a.distance
            );


    renderLeaderboard(
        rows
    );

}


function renderLeaderboard(
    rows
) {

    const container =
        document.getElementById(
            "leaderboard-list"
        );


    if (!container) {
        return;
    }


    if (!rows.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                No participants yet.
            </div>
            `;

        return;
    }


    container.innerHTML =
        rows
            .map(
                (
                    person,
                    index
                ) => {

                    const rank =
                        index + 1;


                    /*
                       CACHE-BUST PROFILE PHOTO
                       so updated PFPs appear immediately.
                    */

                    const avatar =
                        person.photo
                            ? `
                                <img
                                    src="${escapeAttribute(
                                        person.photo +
                                        (
                                            person.photo.includes("?")
                                                ? "&"
                                                : "?"
                                        ) +
                                        "v=" +
                                        Date.now()
                                    )}"
                                    alt=""
                                >
                              `
                            : "👤";


                    const isMe =
                        person.id ===
                        currentUser?.id;


                    return `
                        <div
                            class="
                                leaderboard-row
                                ${isMe ? "me" : ""}
                            "
                        >

                            <div
                                class="leaderboard-rank"
                            >
                                ${rank}
                            </div>

                            <div
                                class="leaderboard-avatar"
                            >
                                ${avatar}
                            </div>

                            <div
                                class="leaderboard-person"
                            >

                                <strong>
                                    ${escapeHtml(
                                        person.name
                                    )}
                                </strong>

                                ${
                                    person.age
                                        ? `
                                            <span>
                                                Age ${person.age}
                                            </span>
                                          `
                                        : ""
                                }

                            </div>

                            <div
                                class="leaderboard-distance"
                            >
                                ${Number(
                                    person.distance
                                ).toFixed(1)}
                                <span>
                                    km
                                </span>
                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   ACTIVITY FEED
========================================================= */

async function loadActivityFeed() {

    const container =
        document.getElementById(
            "activity-feed"
        );


    if (
        !container ||
        !currentChallenge
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                `
                *,
                profiles (
                    id,
                    name,
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
            .limit(50);


    if (error) {

        console.error(
            "Activity feed error:",
            error
        );

        return;
    }


    if (
        !data ||
        !data.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                No activities yet.
            </div>
            `;

        return;
    }


    container.innerHTML =
        data
            .map(
                activity =>
                    renderActivityCard(
                        activity
                    )
            )
            .join("");

}


function renderActivityCard(
    activity
) {

    const profile =
        activity.profiles ||
        {};


    const name =
        profile.name ||
        "Participant";


    const avatar =
        profile.profile_photo_url
            ? `
                <img
                    src="${escapeAttribute(
                        profile.profile_photo_url +
                        (
                            profile.profile_photo_url.includes("?")
                                ? "&"
                                : "?"
                        ) +
                        "v=" +
                        Date.now()
                    )}"
                    alt=""
                >
              `
            : "👤";


    const emoji =
        activity.activity_type === "run"
            ? "🏃"
            : activity.activity_type === "walk"
                ? "🚶"
                : "🚴";


    const duration =
        formatDuration(
            activity.duration_seconds ||
            (
                Number(
                    activity.duration_minutes
                ) * 60
            )
        );


    const photos =
        activity.activity_photos ||
        [];


    const photoHtml =
        photos.length
            ? `
                <div class="activity-photo-grid">

                    ${photos
                        .map(
                            photo =>
                                `
                                <img
                                    src="${escapeAttribute(
                                        photo.photo_url
                                    )}"
                                    alt="Activity photo"
                                    loading="lazy"
                                >
                                `
                        )
                        .join("")}

                </div>
              `
            : "";


    const canDelete =
        activity.user_id ===
        currentUser?.id;


    return `
        <article
            class="activity-card"
        >

            <div
                class="activity-card-header"
            >

                <div
                    class="feed-avatar"
                >
                    ${avatar}
                </div>

                <div
                    class="activity-user"
                >

                    <strong>
                        ${escapeHtml(
                            name
                        )}
                    </strong>

                    <span>
                        ${formatDate(
                            activity.activity_date
                        )}
                    </span>

                </div>

            </div>


            <div
                class="activity-main"
            >

                <div
                    class="activity-title"
                >

                    <span
                        class="activity-type-name"
                    >
                        ${emoji}
                        ${capitalize(
                            activity.activity_type
                        )}
                    </span>

                    <span
                        class="activity-distance"
                    >
                        ${Number(
                            activity.distance_km
                        ).toFixed(1)}
                        km
                    </span>

                </div>


                <div
                    class="activity-meta"
                >

                    ${
                        duration
                            ? `
                                <span>
                                    ⏱ ${duration}
                                </span>
                              `
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
                            <div
                                class="activity-caption"
                            >
                                ${escapeHtml(
                                    activity.caption
                                )}
                            </div>
                          `
                        : ""
                }


                ${photoHtml}


                ${
                    canDelete
                        ? `
                            <button
                                class="activity-delete"
                                onclick="deleteActivity('${activity.id}')"
                            >
                                Delete
                            </button>
                          `
                        : ""
                }

            </div>

        </article>
    `;

}


/* =========================================================
   DELETE ACTIVITY
========================================================= */

async function deleteActivity(
    activityId
) {

    if (!currentUser) {
        return;
    }


    const confirmed =
        window.confirm(
            "Delete this activity?"
        );


    if (!confirmed) {
        return;
    }


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

        showToast(
            error.message
        );

        return;
    }


    await loadHome();

    await loadProfile();

    await loadLeaderboard();


    showToast(
        "Activity deleted."
    );

}


/* =========================================================
   WEIGHT
========================================================= */

async function addWeight(
    event
) {

    event.preventDefault();


    if (!currentUser) {
        return;
    }


    const input =
        document.getElementById(
            "weight-input"
        );


    const weight =
        Number(
            input?.value
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
                        new Date()
                            .toISOString()
                            .slice(
                                0,
                                10
                            )
                }
            );


    if (error) {

        showToast(
            error.message
        );

        return;
    }


    if (input) {
        input.value = "";
    }


    await loadWeights();


    showToast(
        "Weight added."
    );

}


async function loadWeights() {

    const container =
        document.getElementById(
            "weight-history"
        );


    if (
        !container ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("weight_logs")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "logged_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            error
        );

        return;
    }


    if (
        !data ||
        !data.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                No weight entries yet.
            </div>
            `;

        return;
    }


    container.innerHTML =
        data
            .map(
                entry =>
                    `
                    <div
                        class="weight-entry"
                    >

                        <span>
                            ${formatDate(
                                entry.logged_date
                            )}
                        </span>

                        <strong>
                            ${Number(
                                entry.weight_kg
                            ).toFixed(1)}
                            kg
                        </strong>

                    </div>
                    `
            )
            .join("");

}


/* =========================================================
   STREAK
========================================================= */

async function loadStreak() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                "activity_date"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .order(
                "activity_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            error
        );

        return;
    }


    const dates =
        [
            ...new Set(
                (data || [])
                    .map(
                        item =>
                            item.activity_date
                    )
            )
        ];


    let streak =
        0;


    let cursor =
        new Date();


    cursor.setHours(
        0,
        0,
        0,
        0
    );


    const today =
        cursor
            .toISOString()
            .slice(
                0,
                10
            );


    const hasToday =
        dates.includes(
            today
        );


    if (!hasToday) {

        cursor.setDate(
            cursor.getDate() - 1
        );

    }


    while (true) {

        const date =
            cursor
                .toISOString()
                .slice(
                    0,
                    10
                );


        if (
            dates.includes(
                date
            )
        ) {

            streak++;

            cursor.setDate(
                cursor.getDate() - 1
            );

        } else {

            break;

        }

    }


    const streakElement =
        document.getElementById(
            "current-streak"
        );


    if (streakElement) {

        streakElement.textContent =
            streak;

    }

}


/* =========================================================
   HELPERS
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


    const preview =
        document.getElementById(
            "activity-photo-preview"
        );


    if (preview) {
        preview.innerHTML = "";
    }


    document
        .querySelectorAll(
            ".activity-type"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.type ===
                        "run"
                );

            }
        );


    selectedActivityType =
        "run";


    const hours =
        document.getElementById(
            "duration-hours"
        );

    const minutes =
        document.getElementById(
            "duration-minutes"
        );

    const seconds =
        document.getElementById(
            "duration-seconds"
        );


    if (hours) {
        hours.value = "0";
    }

    if (minutes) {
        minutes.value = "0";
    }

    if (seconds) {
        seconds.value = "0";
    }

}


function formatDuration(
    totalSeconds
) {

    const seconds =
        Number(
            totalSeconds
        ) || 0;


    if (!seconds) {
        return "";
    }


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (
                seconds %
                3600
            ) / 60
        );


    const remainingSeconds =
        seconds % 60;


    if (hours > 0) {

        return `${hours}h ${minutes}m ${remainingSeconds}s`;

    }


    if (minutes > 0) {

        return `${minutes}m ${remainingSeconds}s`;

    }


    return `${remainingSeconds}s`;

}


function formatDate(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short"
        }
    );

}


function getChallengeDay(
    dateString
) {

    if (!currentChallenge) {
        return 1;
    }


    const start =
        new Date(
            `${currentChallenge.start_date}T00:00:00`
        );


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    const day =
        Math.floor(
            (
                date - start
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1;


    return Math.max(
        1,
        Math.min(
            100,
            day
        )
    );

}


function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "hundo-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "hundo-toast";

        toast.className =
            "hundo-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    await supabaseClient.auth.signOut();

}


/* =========================================================
   PROFILE EDITOR
========================================================= */

const editProfileButton =
    document.getElementById(
        "edit-profile-button"
    );

const closeProfileEditor =
    document.getElementById(
        "close-profile-editor"
    );

const profileEditor =
    document.getElementById(
        "profile-editor"
    );


if (editProfileButton && profileEditor) {

    editProfileButton.addEventListener(
        "click",
        () => {

            profileEditor.classList.remove(
                "hidden"
            );

            editProfileButton.classList.add(
                "hidden"
            );

        }
    );

}


if (
    closeProfileEditor &&
    profileEditor
) {

    closeProfileEditor.addEventListener(
        "click",
        function () {

            profileEditor.classList.add(
                "hidden"
            );

            if (editProfileButton) {

                editProfileButton.classList.remove(
                    "hidden"
                );

            }

        }
    );

}

/* =====================================================
   HUNDO — ACTIVITY + COMMUNITY + LEADERBOARD + WEIGHT
   ===================================================== */


/* =====================================================
   GLOBAL USER / CHALLENGE DATA
   ===================================================== */

let currentUser = null;
let currentChallenge = null;
let currentProfile = null;

let selectedActivityType = "run";


/* =====================================================
   GET CURRENT USER
   ===================================================== */

async function getCurrentUser() {

    if (!supabaseClient) {
        return null;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error(
            "Could not get current user:",
            error
        );

        return null;
    }

    currentUser = data.user;

    return currentUser;
}


/* =====================================================
   LOAD CHALLENGE
   ===================================================== */

async function loadChallenge() {

    if (!supabaseClient) {
        return null;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("challenges")
        .select("*")
        .eq("name", "HUNDO")
        .order("created_at", {
            ascending: false
        })
        .limit(1)
        .maybeSingle();

    if (error) {

        console.error(
            "Challenge loading error:",
            error
        );

        return null;
    }

    currentChallenge = data;

    return data;
}


/* =====================================================
   LOAD PROFILE
   ===================================================== */

async function loadProfile() {

    if (!currentUser) {
        return null;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }

    currentProfile = data;

    updateProfileUI();

    return data;
}


/* =====================================================
   UPDATE PROFILE UI
   ===================================================== */

function updateProfileUI() {

    if (!currentProfile) {
        return;
    }

    const name =
        currentProfile.name ||
        "Your Name";

    const age =
        currentProfile.age ?
        `Age ${currentProfile.age}` :
        "Age —";


    const profileName =
        document.getElementById(
            "profile-name"
        );

    const profileAge =
        document.getElementById(
            "profile-age"
        );


    if (profileName) {
        profileName.textContent =
            name;
    }

    if (profileAge) {
        profileAge.textContent =
            age;
    }


    const profilePicture =
        document.getElementById(
            "profile-picture"
        );


    if (
        profilePicture &&
        currentProfile.profile_photo_url
    ) {

        profilePicture.innerHTML = "";

        const image =
            document.createElement(
                "img"
            );

        image.src =
            currentProfile.profile_photo_url;

        image.alt =
            "Profile picture";

        image.className =
            "profile-avatar-image";

        profilePicture.appendChild(
            image
        );

    } else if (profilePicture) {

        profilePicture.innerHTML =
            "👤";

    }


    const nameInput =
        document.getElementById(
            "profile-name-input"
        );

    const ageInput =
        document.getElementById(
            "profile-age-input"
        );


    if (nameInput) {
        nameInput.value =
            currentProfile.name || "";
    }

    if (ageInput) {
        ageInput.value =
            currentProfile.age || "";
    }
}


/* =====================================================
   PROFILE PHOTO UPLOAD
   ===================================================== */

async function uploadProfilePhoto(
    file
) {

    if (!currentUser || !file) {
        return null;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const filePath =
        `${currentUser.id}/profile-${Date.now()}.${extension}`;


    const {
        error: uploadError
    } =
        await supabaseClient.storage
            .from("Profile pictures")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {

        console.error(
            "Profile photo upload error:",
            uploadError
        );

        throw uploadError;
    }


    const {
        data
    } =
        supabaseClient.storage
            .from("Profile pictures")
            .getPublicUrl(
                filePath
            );


    if (
        !data ||
        !data.publicUrl
    ) {

        throw new Error(
            "Could not get profile photo URL."
        );
    }


    /*
       SAVE NEW URL TO PROFILE
    */

    const {
        error: updateError
    } =
        await supabaseClient
            .from("profiles")
            .update({
                profile_photo_url:
                    data.publicUrl
            })
            .eq(
                "id",
                currentUser.id
            );


    if (updateError) {

        console.error(
            "Profile photo database update error:",
            updateError
        );

        throw updateError;
    }


    /*
       FORCE IMAGE REFRESH
       SO THE NEW IMAGE APPEARS IMMEDIATELY
    */

    const freshUrl =
        `${data.publicUrl}?v=${Date.now()}`;


    currentProfile.profile_photo_url =
        freshUrl;


    updateProfileUI();

    return freshUrl;
}


/* =====================================================
   PROFILE PHOTO BUTTON
   ===================================================== */

const profilePhotoButton =
    document.getElementById(
        "profile-photo-button"
    );

const profilePhotoInput =
    document.getElementById(
        "profile-photo-input"
    );


if (profilePhotoButton) {

    profilePhotoButton.addEventListener(
        "click",
        function () {

            if (profilePhotoInput) {
                profilePhotoInput.click();
            }

        }
    );
}


if (profilePhotoInput) {

    profilePhotoInput.addEventListener(
        "change",
        async function () {

            const file =
                profilePhotoInput.files[0];

            if (!file) {
                return;
            }


            try {

                await uploadProfilePhoto(
                    file
                );

                /*
                   IMPORTANT:
                   Clear input so the user can
                   select another photo later,
                   even if it is the same file.
                */

                profilePhotoInput.value = "";

            }
            catch (error) {

                console.error(
                    error
                );

                alert(
                    "Could not update your profile picture."
                );

                profilePhotoInput.value = "";
            }

        }
    );
}


/* =====================================================
   SAVE PROFILE
   ===================================================== */

const saveProfileButton =
    document.getElementById(
        "save-profile-button"
    );


if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function () {

            if (!currentUser) {
                return;
            }


            const nameInput =
                document.getElementById(
                    "profile-name-input"
                );

            const ageInput =
                document.getElementById(
                    "profile-age-input"
                );


            const name =
                nameInput ?
                nameInput.value.trim() :
                "";

            const age =
                ageInput ?
                Number(ageInput.value) :
                null;


            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;
            }


            if (
                age &&
                (
                    age < 1 ||
                    age > 120
                )
            ) {

                alert(
                    "Please enter a valid age."
                );

                return;
            }


            try {

                saveProfileButton.disabled =
                    true;

                saveProfileButton.textContent =
                    "Saving...";


                const {
                    error
                } =
                    await supabaseClient
                        .from("profiles")
                        .update({
                            name:
                                name,
                            age:
                                age || null
                        })
                        .eq(
                            "id",
                            currentUser.id
                        );


                if (error) {
                    throw error;
                }


                await loadProfile();


                const editor =
                    document.getElementById(
                        "profile-editor"
                    );

                if (editor) {
                    editor.classList.add(
                        "hidden"
                    );
                }

            }
            catch (error) {

                console.error(
                    "Profile save error:",
                    error
                );

                alert(
                    "Could not save your profile."
                );

            }
            finally {

                saveProfileButton.disabled =
                    false;

                saveProfileButton.textContent =
                    "Save profile";

            }

        }
    );
}


/* =====================================================
   LOAD ACTIVITIES
   ===================================================== */

async function loadActivities() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return [];
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(`
                *,
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
            `)
            .eq(
                "challenge_id",
                currentChallenge.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Activity loading error:",
            error
        );

        return [];
    }


    return data || [];
}


/* =====================================================
   FORMAT DURATION
   ===================================================== */

function formatDuration(
    seconds
) {

    if (!seconds) {
        return "";
    }


    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remainingSeconds =
        seconds % 60;


    if (hours > 0) {

        return `${hours}h ${minutes}m ${remainingSeconds}s`;

    }


    return `${minutes}m ${remainingSeconds}s`;
}


/* =====================================================
   GET DURATION FROM SCROLL PICKERS
   ===================================================== */

function getSelectedDuration() {

    const hours =
        document.getElementById(
            "duration-hours"
        );

    const minutes =
        document.getElementById(
            "duration-minutes"
        );

    const seconds =
        document.getElementById(
            "duration-seconds"
        );


    if (
        !hours ||
        !minutes ||
        !seconds
    ) {

        /*
           FALLBACK FOR OLD INPUT
        */

        const oldDuration =
            document.getElementById(
                "duration"
            );

        if (
            oldDuration &&
            oldDuration.value
        ) {

            const parts =
                oldDuration.value
                    .split(":")
                    .map(Number);

            if (parts.length === 3) {

                return (
                    (parts[0] * 3600) +
                    (parts[1] * 60) +
                    parts[2]
                );

            }
        }

        return null;
    }


    const h =
        Number(hours.value) || 0;

    const m =
        Number(minutes.value) || 0;

    const s =
        Number(seconds.value) || 0;


    return (
        (h * 3600) +
        (m * 60) +
        s
    );
}


/* =====================================================
   POST ACTIVITY
   ===================================================== */

async function postActivity(
    event
) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    if (!currentChallenge) {

        await loadChallenge();

        if (!currentChallenge) {

            alert(
                "HUNDO challenge could not be loaded."
            );

            return;
        }
    }


    const distanceInput =
        document.getElementById(
            "distance"
        );

    const captionInput =
        document.getElementById(
            "caption"
        );


    const distance =
        Number(
            distanceInput ?
            distanceInput.value :
            0
        );


    const caption =
        captionInput ?
        captionInput.value.trim() :
        "";


    if (
        !distance ||
        distance <= 0
    ) {

        alert(
            "Please enter a valid distance."
        );

        return;
    }


    const durationSeconds =
        getSelectedDuration();


    const submitButton =
        document.querySelector(
            '#activity-form button[type="submit"]'
        );


    try {

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Posting...";
        }


        /*
           CREATE ACTIVITY
        */

        const {
            data: activity,
            error: activityError
        } =
            await supabaseClient
                .from("activities")
                .insert({
                    user_id:
                        currentUser.id,

                    challenge_id:
                        currentChallenge.id,

                    activity_type:
                        selectedActivityType,

                    distance_km:
                        distance,

                    duration_minutes:
                        durationSeconds ?
                        Math.ceil(
                            durationSeconds / 60
                        ) :
                        null,

                    duration_seconds:
                        durationSeconds ||
                        null,

                    activity_date:
                        new Date()
                            .toISOString()
                            .split("T")[0],

                    caption:
                        caption || null
                })
                .select()
                .single();


        if (activityError) {
            throw activityError;
        }


        /*
           UPLOAD ACTIVITY PHOTOS
        */

        const photoInput =
            document.getElementById(
                "activity-photos"
            );


        const files =
            photoInput ?
            Array.from(
                photoInput.files
            ) :
            [];


        for (
            const file of files
        ) {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const path =
                `${currentUser.id}/${activity.id}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${extension}`;


            const {
                error: uploadError
            } =
                await supabaseClient.storage
                    .from(
                        "activity pictures"
                    )
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
                    "Activity photo upload error:",
                    uploadError
                );

                continue;
            }


            const {
                data:
                    photoUrlData
            } =
                supabaseClient.storage
                    .from(
                        "activity pictures"
                    )
                    .getPublicUrl(
                        path
                    );


            if (
                photoUrlData &&
                photoUrlData.publicUrl
            ) {

                await supabaseClient
                    .from(
                        "activity_photos"
                    )
                    .insert({
                        activity_id:
                            activity.id,

                        photo_url:
                            photoUrlData.publicUrl
                    });

            }

        }


        /*
           RESET FORM
        */

        const activityForm =
            document.getElementById(
                "activity-form"
            );

        if (activityForm) {
            activityForm.reset();
        }


        if (photoInput) {
            photoInput.value = "";
        }


        /*
           RESET ACTIVITY TYPE
        */

        document
            .querySelectorAll(
                ".activity-type"
            )
            .forEach(
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


        /*
           REFRESH EVERYTHING
        */

        await refreshDashboard();


        /*
           RETURN HOME
        */

        const homePage =
            document.getElementById(
                "home-page"
            );

        const pages =
            document.querySelectorAll(
                ".page"
            );


        pages.forEach(
            function (page) {
                page.classList.add(
                    "hidden"
                );
            }
        );


        if (homePage) {

            homePage.classList.remove(
                "hidden"
            );

        }


        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        const homeNav =
            document.querySelector(
                '[data-page="home-page"]'
            );

        if (homeNav) {

            homeNav.classList.add(
                "active"
            );

        }


        window.scrollTo(
            0,
            0
        );


        alert(
            "Activity posted successfully!"
        );

    }
    catch (error) {

        console.error(
            "Activity posting error:",
            error
        );

        alert(
            error.message ||
            "Could not post activity."
        );

    }
    finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Post Activity";

        }

    }
}


/* =====================================================
   ACTIVITY FORM EVENT
   ===================================================== */

const activityForm =
    document.getElementById(
        "activity-form"
    );


if (activityForm) {

    activityForm.addEventListener(
        "submit",
        postActivity
    );

}


/* =====================================================
   ACTIVITY TYPE BUTTONS
   ===================================================== */

document
    .querySelectorAll(
        ".activity-type"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".activity-type"
                        )
                        .forEach(
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


/* =====================================================
   WEIGHT TRACKER
   ===================================================== */

async function loadWeightLogs() {

    if (!currentUser) {
        return [];
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("weight_logs")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "logged_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Weight loading error:",
            error
        );

        return [];
    }


    return data || [];
}


/* =====================================================
   ADD WEIGHT
   ===================================================== */

async function addWeight() {

    if (!currentUser) {
        return;
    }


    const weightInput =
        document.getElementById(
            "weight-input"
        );


    if (!weightInput) {
        return;
    }


    const weight =
        Number(
            weightInput.value
        );


    if (
        !weight ||
        weight <= 0
    ) {

        alert(
            "Please enter a valid weight."
        );

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("weight_logs")
                .insert({
                    user_id:
                        currentUser.id,

                    weight_kg:
                        weight,

                    logged_date:
                        new Date()
                            .toISOString()
                            .split("T")[0]
                });


        if (error) {
            throw error;
        }


        weightInput.value = "";


        await renderWeightTracker();

    }
    catch (error) {

        console.error(
            "Weight save error:",
            error
        );

        alert(
            "Could not save weight."
        );

    }
}


/* =====================================================
   WEIGHT TRACKER UI
   ===================================================== */

async function renderWeightTracker() {

    const container =
        document.getElementById(
            "weight-tracker"
        );


    if (!container) {
        return;
    }


    const logs =
        await loadWeightLogs();


    let html = `
        <div class="weight-input-row">
            <input
                id="weight-input"
                type="number"
                min="1"
                step="0.1"
                placeholder="Weight in kg"
            >

            <button
                type="button"
                id="add-weight-button"
            >
                Add
            </button>
        </div>
    `;


    if (logs.length === 0) {

        html += `
            <p class="weight-empty">
                Your weight data is private.
            </p>
        `;

    }
    else {

        html += `
            <div class="weight-history">
        `;


        logs
            .slice(0, 10)
            .forEach(
                function (log) {

                    html += `
                        <div class="weight-row">

                            <span>
                                ${new Date(
                                    log.logged_date
                                ).toLocaleDateString()}
                            </span>

                            <strong>
                                ${Number(
                                    log.weight_kg
                                ).toFixed(1)} kg
                            </strong>

                        </div>
                    `;

                }
            );


        html += `
            </div>
        `;

    }


    container.innerHTML =
        html;


    const addButton =
        document.getElementById(
            "add-weight-button"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            addWeight
        );

    }
}


/* =====================================================
   REFRESH DASHBOARD
   ===================================================== */

async function refreshDashboard() {

    try {

        await getCurrentUser();

        if (!currentUser) {
            return;
        }


        await loadChallenge();

        await loadProfile();

        await renderWeightTracker();

        await renderCommunityFeed();

        await renderLeaderboards();

        await renderTotals();

        await renderStreak();

    }
    catch (error) {

        console.error(
            "Dashboard refresh error:",
            error
        );

    }
}


/* =====================================================
   COMMUNITY FEED
   ===================================================== */

async function renderCommunityFeed() {

    const feed =
        document.getElementById(
            "community-feed"
        );


    if (!feed) {
        return;
    }


    const activities =
        await loadActivities();


    if (!activities.length) {

        feed.innerHTML = `
            <div class="empty-feed">
                <p>No activities yet.</p>
                <span>
                    Be the first to post.
                </span>
            </div>
        `;

        return;
    }


    feed.innerHTML =
        activities
            .map(
                function (activity) {

                    const profile =
                        activity.profiles ||
                        {};


                    const name =
                        profile.name ||
                        "HUNDO Member";


                    const avatar =
                        profile.profile_photo_url;


                    const activityEmoji =
                        activity.activity_type ===
                        "run"
                            ? "🏃"
                            : activity.activity_type ===
                              "walk"
                                ? "🚶"
                                : "🚴";


                    const duration =
                        activity.duration_seconds
                            ? formatDuration(
                                activity.duration_seconds
                            )
                            : "";


                    const photos =
                        activity.activity_photos ||
                        [];


                    let photoHTML =
                        "";


                    if (
                        photos.length
                    ) {

                        photoHTML = `
                            <div class="activity-photo-grid">

                                ${photos
                                    .map(
                                        function (
                                            photo
                                        ) {

                                            return `
                                                <img
                                                    src="${photo.photo_url}"
                                                    alt="Activity photo"
                                                    class="community-photo"
                                                    loading="lazy"
                                                >
                                            `;

                                        }
                                    )
                                    .join("")}

                            </div>
                        `;

                    }


                    const avatarHTML =
                        avatar
                            ? `
                                <img
                                    src="${avatar}"
                                    class="community-avatar"
                                    alt=""
                                >
                            `
                            : `
                                <div class="community-avatar-placeholder">
                                    👤
                                </div>
                            `;


                    return `
                        <article class="activity-card">

                            <div class="activity-card-header">

                                ${avatarHTML}

                                <div class="activity-user">

                                    <strong>
                                        ${name}
                                    </strong>

                                    <span>
                                        ${activityEmoji}
                                        ${activity.activity_type}
                                    </span>

                                </div>

                            </div>


                            <div class="activity-stats">

                                <strong>
                                    ${Number(
                                        activity.distance_km
                                    ).toFixed(1)}
                                    km
                                </strong>

                                ${
                                    duration
                                        ? `
                                            <span>
                                                ⏱ ${duration}
                                            </span>
                                        `
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
                                        <p class="activity-caption">
                                            ${escapeHTML(
                                                activity.caption
                                            )}
                                        </p>
                                    `
                                    : ""
                            }


                            ${photoHTML}

                        </article>
                    `;

                }
            )
            .join("");
}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}


/* =====================================================
   CHALLENGE DAY
   ===================================================== */

function getChallengeDay(
    date
) {

    if (!currentChallenge) {
        return 1;
    }


    const start =
        new Date(
            `${currentChallenge.start_date}T00:00:00`
        );


    const target =
        new Date(
            `${date}T00:00:00`
        );


    const difference =
        Math.floor(
            (
                target -
                start
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    return Math.max(
        1,
        difference + 1
    );
}

/* =====================================================
   LEADERBOARD
   ===================================================== */

async function renderLeaderboards() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const activities =
        await loadActivities();


    /*
       GET EVERYONE WHO JOINED HUNDO
    */

    const {
        data: participants,
        error
    } =
        await supabaseClient
            .from("challenge_participants")
            .select(`
                user_id,
                profiles (
                    id,
                    name,
                    age,
                    profile_photo_url
                )
            `)
            .eq(
                "challenge_id",
                currentChallenge.id
            );


    if (error) {

        console.error(
            "Leaderboard participant error:",
            error
        );

        return;
    }


    const leaderboardData =
        (participants || [])
            .map(
                function (participant) {

                    const userActivities =
                        activities.filter(
                            function (activity) {

                                return (
                                    activity.user_id ===
                                    participant.user_id
                                );

                            }
                        );


                    let runWalk =
                        0;

                    let cycling =
                        0;


                    userActivities.forEach(
                        function (activity) {

                            const distance =
                                Number(
                                    activity.distance_km
                                ) || 0;


                            if (
                                activity.activity_type ===
                                    "run" ||
                                activity.activity_type ===
                                    "walk"
                            ) {

                                runWalk +=
                                    distance;

                            }


                            if (
                                activity.activity_type ===
                                "cycle"
                            ) {

                                cycling +=
                                    distance;

                            }

                        }
                    );


                    return {

                        userId:
                            participant.user_id,

                        name:
                            participant.profiles?.name ||
                            "HUNDO Member",

                        profilePhoto:
                            participant.profiles
                                ?.profile_photo_url ||
                            null,

                        runWalk:
                            runWalk,

                        cycling:
                            cycling

                    };

                }
            );


    /*
       SORT BOTH LEADERBOARDS
    */

    const runWalkLeaderboard =
        [...leaderboardData]
            .sort(
                function (a, b) {

                    return (
                        b.runWalk -
                        a.runWalk
                    );

                }
            );


    const cyclingLeaderboard =
        [...leaderboardData]
            .sort(
                function (a, b) {

                    return (
                        b.cycling -
                        a.cycling
                    );

                }
            );


    /*
       FIND LEADERBOARD CONTAINERS
    */

    const runWalkContainer =
        document.getElementById(
            "run-walk-leaderboard"
        );


    const cyclingContainer =
        document.getElementById(
            "cycling-leaderboard"
        );


    if (runWalkContainer) {

        runWalkContainer.innerHTML =
            buildLeaderboardHTML(
                runWalkLeaderboard,
                "runWalk"
            );

    }


    if (cyclingContainer) {

        cyclingContainer.innerHTML =
            buildLeaderboardHTML(
                cyclingLeaderboard,
                "cycling"
            );

    }


    /*
       SUPPORT ALTERNATIVE IDS
       IF YOUR CURRENT HTML USES THEM
    */

    const generalLeaderboard =
        document.getElementById(
            "leaderboard-list"
        );


    if (
        generalLeaderboard &&
        !runWalkContainer &&
        !cyclingContainer
    ) {

        generalLeaderboard.innerHTML =
            buildLeaderboardHTML(
                runWalkLeaderboard,
                "runWalk"
            );

    }
}


/* =====================================================
   BUILD COOL LEADERBOARD
   ===================================================== */

function buildLeaderboardHTML(
    players,
    type
) {

    if (!players.length) {

        return `
            <div class="leaderboard-empty">
                <div class="leaderboard-empty-icon">
                    🏆
                </div>

                <strong>
                    No participants yet
                </strong>

                <span>
                    Invite your HUNDO crew.
                </span>
            </div>
        `;

    }


    return `
        <div class="leaderboard-wrapper">

            ${players
                .map(
                    function (
                        player,
                        index
                    ) {

                        const rank =
                            index + 1;


                        const distance =
                            type === "cycling"
                                ? player.cycling
                                : player.runWalk;


                        const isCurrentUser =
                            player.userId ===
                            currentUser.id;


                        const rankClass =
                            rank === 1
                                ? "rank-one"
                                : rank === 2
                                    ? "rank-two"
                                    : rank === 3
                                        ? "rank-three"
                                        : "";


                        const avatar =
                            player.profilePhoto;


                        const avatarHTML =
                            avatar
                                ? `
                                    <img
                                        src="${avatar}"
                                        class="leaderboard-avatar"
                                        alt=""
                                        loading="lazy"
                                    >
                                `
                                : `
                                    <div class="leaderboard-avatar leaderboard-avatar-placeholder">
                                        👤
                                    </div>
                                `;


                        return `
                            <div
                                class="
                                    leaderboard-row
                                    ${rankClass}
                                    ${isCurrentUser ? "current-user" : ""}
                                "
                            >

                                <div class="leaderboard-rank">

                                    ${
                                        rank === 1
                                            ? "🥇"
                                            : rank === 2
                                                ? "🥈"
                                                : rank === 3
                                                    ? "🥉"
                                                    : `<span>${rank}</span>`
                                    }

                                </div>


                                <div class="leaderboard-player">

                                    ${avatarHTML}

                                    <div class="leaderboard-player-info">

                                        <strong>
                                            ${escapeHTML(
                                                player.name
                                            )}
                                        </strong>

                                        ${
                                            isCurrentUser
                                                ? `
                                                    <span class="you-label">
                                                        YOU
                                                    </span>
                                                `
                                                : ""
                                        }

                                    </div>

                                </div>


                                <div class="leaderboard-distance">

                                    <strong>
                                        ${distance.toFixed(1)}
                                    </strong>

                                    <span>
                                        km
                                    </span>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("")}

        </div>
    `;
}


/* =====================================================
   TOTALS
   ===================================================== */

async function renderTotals() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const activities =
        await loadActivities();


    const mine =
        activities.filter(
            function (activity) {

                return (
                    activity.user_id ===
                    currentUser.id
                );

            }
        );


    let runWalk =
        0;

    let cycling =
        0;


    mine.forEach(
        function (activity) {

            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type ===
                    "run" ||
                activity.activity_type ===
                    "walk"
            ) {

                runWalk +=
                    distance;

            }


            if (
                activity.activity_type ===
                "cycle"
            ) {

                cycling +=
                    distance;

            }

        }
    );


    /*
       UPDATE ALL COMMON TOTAL IDS
    */

    const runWalkTotal =
        document.getElementById(
            "run-walk-total"
        );


    const cyclingTotal =
        document.getElementById(
            "cycling-total"
        );


    if (runWalkTotal) {

        runWalkTotal.textContent =
            `${runWalk.toFixed(1)} km`;

    }


    if (cyclingTotal) {

        cyclingTotal.textContent =
            `${cycling.toFixed(1)} km`;

    }


    /*
       PROFILE TOTALS
    */

    const profileRunWalk =
        document.getElementById(
            "profile-run-walk-total"
        );


    const profileCycling =
        document.getElementById(
            "profile-cycling-total"
        );


    if (profileRunWalk) {

        profileRunWalk.textContent =
            `${runWalk.toFixed(1)} km`;

    }


    if (profileCycling) {

        profileCycling.textContent =
            `${cycling.toFixed(1)} km`;

    }
}


/* =====================================================
   STREAK
   ===================================================== */

async function renderStreak() {

    if (
        !currentUser ||
        !currentChallenge
    ) {
        return;
    }


    const activities =
        await loadActivities();


    const activityDates =
        new Set();


    activities
        .filter(
            function (activity) {

                return (
                    activity.user_id ===
                    currentUser.id
                );

            }
        )
        .forEach(
            function (activity) {

                activityDates.add(
                    activity.activity_date
                );

            }
        );


    let streak =
        0;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    /*
       COUNT BACKWARDS FROM TODAY
    */

    let date =
        new Date(
            today
        );


    while (true) {

        const dateString =
            date
                .toISOString()
                .split("T")[0];


        if (
            activityDates.has(
                dateString
            )
        ) {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

        }
        else {

            break;

        }

    }


    /*
       IF THERE IS NO ACTIVITY TODAY,
       ALSO CHECK WHETHER THE STREAK
       ENDED YESTERDAY.
    */

    if (
        streak === 0
    ) {

        const yesterday =
            new Date(
                today
            );


        yesterday.setDate(
            yesterday.getDate() - 1
        );


        let yesterdayStreak =
            0;


        while (true) {

            const dateString =
                yesterday
                    .toISOString()
                    .split("T")[0];


            if (
                activityDates.has(
                    dateString
                )
            ) {

                yesterdayStreak++;


                yesterday.setDate(
                    yesterday.getDate() - 1
                );

            }
            else {

                break;

            }

        }


        streak =
            yesterdayStreak;

    }


    const streakElement =
        document.getElementById(
            "current-streak"
        );


    if (streakElement) {

        streakElement.textContent =
            streak;

    }
}


/* =====================================================
   LEADERBOARD TABS
   ===================================================== */

document
    .querySelectorAll(
        "[data-leaderboard]"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset
                            .leaderboard;


                    document
                        .querySelectorAll(
                            "[data-leaderboard]"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".leaderboard-panel"
                        )
                        .forEach(
                            function (panel) {

                                panel.classList.add(
                                    "hidden"
                                );

                            }
                        );


                    const panel =
                        document.getElementById(
                            target
                        );


                    if (panel) {

                        panel.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   REFRESH WHEN PAGE BECOMES VISIBLE
   ===================================================== */

document.addEventListener(
    "visibilitychange",
    async function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            if (currentUser) {

                await refreshDashboard();

            }

        }

    }
);


/* =====================================================
   SUPABASE AUTH STATE
   ===================================================== */

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        async function (
            event,
            session
        ) {

            if (
                event ===
                    "SIGNED_IN" &&
                session
            ) {

                currentUser =
                    session.user;


                await refreshDashboard();

            }


            if (
                event ===
                "SIGNED_OUT"
            ) {

                currentUser =
                    null;

                currentProfile =
                    null;

            }

        }
    );

}


/* =====================================================
   INITIAL LOAD
   ===================================================== */

async function initializeHundoData() {

    try {

        const user =
            await getCurrentUser();


        if (!user) {
            return;
        }


        await refreshDashboard();

    }
    catch (error) {

        console.error(
            "HUNDO initialization error:",
            error
        );

    }
}


initializeHundoData();
