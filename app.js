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

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
           Supabase must be ready before we decide
           whether the user sees login or the app.
        */

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {

            console.error(
                "Supabase failed to load."
            );

            hideSplash();
            showAuth();

            return;
        }


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


        setupUI();

        setupDurationPicker();

        setupActivityPhotoInput();

        setupProfilePhotoInput();

        setupAuthListener();


        /*
           Let the HUNDO splash animation play,
           then check the existing session.
        */

        setTimeout(
            checkSession,
            1300
        );

    }
);


/* =========================================================
   BASIC UI
========================================================= */

function setupUI() {

    const showSignup =
        document.getElementById(
            "show-signup"
        );

    const backLogin =
        document.getElementById(
            "back-to-login"
        );

    const loginForm =
        document.getElementById(
            "login-form"
        );

    const signupForm =
        document.getElementById(
            "signup-form"
        );

    const homeLogButton =
        document.getElementById(
            "home-log-button"
        );

    const activityForm =
        document.getElementById(
            "activity-form"
        );

    const saveProfileButton =
        document.getElementById(
            "save-profile-button"
        );


    /* ---------------------------------------------
       SIGNUP SCREEN
    --------------------------------------------- */

    if (showSignup) {

        showSignup.addEventListener(
            "click",
            () => {

                document
                    .getElementById("auth-screen")
                    ?.classList.add("hidden");

                document
                    .getElementById("signup-screen")
                    ?.classList.remove("hidden");

            }
        );

    }


    /* ---------------------------------------------
       BACK TO LOGIN
    --------------------------------------------- */

    if (backLogin) {

        backLogin.addEventListener(
            "click",
            () => {

                document
                    .getElementById("signup-screen")
                    ?.classList.add("hidden");

                document
                    .getElementById("auth-screen")
                    ?.classList.remove("hidden");

            }
        );

    }


    /* ---------------------------------------------
       LOGIN
    --------------------------------------------- */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    /* ---------------------------------------------
       SIGNUP
    --------------------------------------------- */

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            handleSignup
        );

    }


    /* ---------------------------------------------
       HOME LOG BUTTON
    --------------------------------------------- */

    if (homeLogButton) {

        homeLogButton.addEventListener(
            "click",
            () => {

                showPage(
                    "log-page"
                );

            }
        );

    }


    /* ---------------------------------------------
       ACTIVITY FORM
    --------------------------------------------- */

    if (activityForm) {

        activityForm.addEventListener(
            "submit",
            handleActivitySubmit
        );

    }


    /* ---------------------------------------------
       SAVE PROFILE
    --------------------------------------------- */

    if (saveProfileButton) {

        saveProfileButton.addEventListener(
            "click",
            saveProfile
        );

    }


    /* ---------------------------------------------
       BOTTOM NAVIGATION
    --------------------------------------------- */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const page =
                            item.dataset.page;

                        if (page) {

                            showPage(page);

                        }

                    }
                );

            }
        );


    /* ---------------------------------------------
       ACTIVITY TYPES
    --------------------------------------------- */

    document
        .querySelectorAll(
            ".activity-type-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".activity-type-button"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        selectedActivityType =
                            button.dataset.activityType ||
                            "run";

                    }
                );

            }
        );


    /* ---------------------------------------------
       LEADERBOARD TABS
    --------------------------------------------- */

    document
        .querySelectorAll(
            ".leaderboard-tab"
        )
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
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        tab.classList.add(
                            "active"
                        );


                        selectedBoard =
                            tab.dataset.board ||
                            "runwalk";


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

    if (!supabaseClient) {
        return;
    }


    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

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
                session.user
            ) {

                currentUser =
                    session.user;

            }

        }
    );

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        form.querySelector(
            "button[type='submit']"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Logging in…";

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


    if (error) {

        console.error(
            error
        );

        showToast(
            error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Log in";

        }

        return;
    }


    currentUser =
        data.user;


    if (button) {

        button.disabled = false;

        button.textContent =
            "Log in";

    }


    await openApp();

}


/* =========================================================
   SIGNUP
========================================================= */

async function handleSignup(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const button =
        form.querySelector(
            "button[type='submit']"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Creating…";

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


    if (
        !name ||
        !Number.isFinite(age) ||
        age < 1 ||
        age > 120 ||
        password.length < 8
    ) {

        showToast(
            "Please check your name, age and password."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Join HUNDO";

        }

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

        console.error(
            error
        );

        showToast(
            error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Join HUNDO";

        }

        return;
    }


    if (
        !data ||
        !data.user
    ) {

        showToast(
            "Account could not be created."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Join HUNDO";

        }

        return;
    }


    currentUser =
        data.user;


    /*
       The database trigger creates
       the profiles row automatically.
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


        if (button) {

            button.disabled = false;

            button.textContent =
                "Join HUNDO";

        }

        return;
    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "Join HUNDO";

    }


    await openApp();

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

            hideSplash();

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


            hideSplash();

        } else {

            showAuth();

            hideSplash();

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

        showAuth();

        hideSplash();

    }

}


/* =========================================================
   AUTH / APP VISIBILITY
========================================================= */

function showAuth() {

    document
        .getElementById(
            "auth-screen"
        )
        ?.classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "signup-screen"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "app-screen"
        )
        ?.classList.add(
            "hidden"
        );

}


function hideSplash() {

    const splash =
        document.getElementById(
            "hundo-splash"
        );


    if (splash) {

        splash.classList.add(
            "splash-hidden"
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
            data?.user || null;

    }


    if (!currentUser) {

        showAuth();

        hideSplash();

        return;

    }


    document
        .getElementById(
            "auth-screen"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "signup-screen"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "app-screen"
        )
        ?.classList.remove(
            "hidden"
        );


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

        await loadStreak();

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
            .eq(
                "name",
                "HUNDO"
            )
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


    if (
        !data ||
        !data.length
    ) {

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
        data: existing,
        error: existingError
    } =
        await supabaseClient
            .from(
                "challenge_participants"
            )
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


    if (existingError) {

        console.error(
            existingError
        );

        return;

    }


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


/* =========================================================
   PROFILE UI
========================================================= */

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


/* =========================================================
   PROFILE PHOTO
========================================================= */

function updateProfilePhoto() {

    const container =
        document.getElementById(
            "profile-picture"
        );


    if (!container) {
        return;
    }


    /*
       Always clear the container first.
       This prevents an old giant <img> from
       remaining inside the profile area.
    */

    container.innerHTML = "";


    const photoURL =
        currentProfile?.profile_photo_url;


    if (photoURL) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            addCacheBuster(
                photoURL
            );


        image.alt =
            "Profile picture";


        image.loading =
            "eager";


        image.onerror =
            () => {

                container.innerHTML =
                    "👤";

            };


        container.appendChild(
            image
        );


    } else {

        container.textContent =
            "👤";

    }

}


/* =========================================================
   PROFILE PHOTO INPUT
========================================================= */

function setupProfilePhotoInput() {

    const button =
        document.getElementById(
            "profile-photo-button"
        );


    const input =
        document.getElementById(
            "profile-photo-input"
        );


    if (
        button &&
        input
    ) {

        button.addEventListener(
            "click",
            () => {

                /*
                   Clearing the value means the user can
                   select the same file again if needed.
                */

                input.value = "";

                input.click();

            }
        );


        input.addEventListener(
            "change",
            handleProfilePhotoPreview
        );

    }

}


/* =========================================================
   PROFILE PHOTO PREVIEW
========================================================= */

function handleProfilePhotoPreview(
    event
) {

    const input =
        event.target;


    const file =
        input.files &&
        input.files[0];


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please choose an image."
        );

        input.value = "";

        return;
    }


    const previewURL =
        URL.createObjectURL(
            file
        );


    const container =
        document.getElementById(
            "profile-picture"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        previewURL;


    image.alt =
        "New profile picture";


    container.appendChild(
        image
    );

}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile() {

    if (
        !currentUser
    ) {

        return;

    }


    const button =
        document.getElementById(
            "save-profile-button"
        );


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
        nameInput?.value.trim() ||
        "";


    const age =
        Number(
            ageInput?.value
        );


    if (!name) {

        showToast(
            "Please enter your name."
        );

        return;

    }


    if (
        !Number.isFinite(age) ||
        age < 1 ||
        age > 120
    ) {

        showToast(
            "Please enter a valid age."
        );

        return;

    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Saving…";

    }


    try {

        let profilePhotoURL =
            currentProfile?.profile_photo_url ||
            null;


        /*
           Upload a new profile picture only if
           the user actually selected one.
        */

        const selectedFile =
            photoInput?.files?.[0];


        if (selectedFile) {

            profilePhotoURL =
                await uploadProfilePhoto(
                    selectedFile
                );

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .update(
                    {
                        name,
                        age,
                        profile_photo_url:
                            profilePhotoURL
                    }
                )
                .eq(
                    "id",
                    currentUser.id
                )
                .select()
                .single();


        if (error) {

            throw error;

        }


        currentProfile =
            data;


        updateProfileUI();


        /*
           Clear the file input.
           This also means another image can be
           selected immediately afterwards.
        */

        if (photoInput) {

            photoInput.value = "";

        }


        showToast(
            "Profile updated."
        );


        closeProfileEditor();


        await loadLeaderboard();


    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );

        showToast(
            error.message ||
            "Could not save profile."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Save profile";

        }

    }

}


/* =========================================================
   UPLOAD PROFILE PHOTO
========================================================= */

async function uploadProfilePhoto(
    file
) {

    if (!currentUser) {

        throw new Error(
            "You must be logged in."
        );

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Please select an image."
        );

    }


    /*
       Unique path every time.

       This is important because replacing the same
       storage filename can leave browser/CDN cache
       showing the previous image.
    */

    const extension =
        getFileExtension(
            file
        );


    const filePath =
        `${currentUser.id}/profile-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;


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
                    cacheControl: "3600",
                    upsert: false,
                    contentType:
                        file.type
                }
            );


    if (uploadError) {

        throw uploadError;

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

        throw new Error(
            "Could not create profile picture URL."
        );

    }


    return data.publicUrl;

}


/* =========================================================
   PROFILE EDITOR CLOSE
========================================================= */

function closeProfileEditor() {

    const editor =
        document.getElementById(
            "profile-editor"
        );


    const editButton =
        document.getElementById(
            "edit-profile-button"
        );


    if (editor) {

        editor.classList.add(
            "hidden"
        );

    }


    if (editButton) {

        editButton.classList.remove(
            "hidden"
        );

    }

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


    const seconds =
        document.getElementById(
            "duration-seconds"
        );


    if (
        !hours ||
        !minutes ||
        !seconds
    ) {

        return;

    }


    /*
       HOURS
       0–23
    */

    hours.innerHTML = "";


    for (
        let i = 0;
        i <= 23;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            `${String(i).padStart(2, "0")} hr`;


        hours.appendChild(
            option
        );

    }


    /*
       MINUTES
       0–59
    */

    minutes.innerHTML = "";


    for (
        let i = 0;
        i <= 59;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            `${String(i).padStart(2, "0")} min`;


        minutes.appendChild(
            option
        );

    }


    /*
       SECONDS
       0–59
    */

    seconds.innerHTML = "";


    for (
        let i = 0;
        i <= 59;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            `${String(i).padStart(2, "0")} sec`;


        seconds.appendChild(
            option
        );

    }


    hours.value = "0";

    minutes.value = "0";

    seconds.value = "0";

}


/* =========================================================
   GET DURATION
========================================================= */

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
            hours * 3600
        ) +
        (
            minutes * 60
        ) +
        seconds;


    return total > 0
        ? total
        : null;

}


/* =========================================================
   ACTIVITY PHOTOS
========================================================= */

function setupActivityPhotoInput() {

    const input =
        document.getElementById(
            "activity-photo-input"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        event => {

            const files =
                Array.from(
                    event.target.files || []
                );


            if (!files.length) {
                return;
            }


            /*
               Maximum 5 photos.
            */

            const availableSlots =
                5 -
                selectedActivityPhotos.length;


            if (
                availableSlots <= 0
            ) {

                showToast(
                    "You can add up to 5 pictures."
                );

                input.value = "";

                return;

            }


            const filesToAdd =
                files
                    .slice(
                        0,
                        availableSlots
                    );


            for (
                const file of filesToAdd
            ) {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    continue;

                }


                selectedActivityPhotos.push(
                    file
                );

            }


            input.value = "";

            renderActivityPhotoPreview();

        }
    );

}


/* =========================================================
   RENDER ACTIVITY PHOTO PREVIEW
========================================================= */

function renderActivityPhotoPreview() {

    const container =
        document.getElementById(
            "activity-photo-preview"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    selectedActivityPhotos
        .forEach(
            (
                file,
                index
            ) => {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "activity-photo-preview-item";


                const image =
                    document.createElement(
                        "img"
                    );


                const objectURL =
                    URL.createObjectURL(
                        file
                    );


                image.src =
                    objectURL;


                image.alt =
                    `Activity picture ${index + 1}`;


                image.onload =
                    () => {

                        URL.revokeObjectURL(
                            objectURL
                        );

                    };


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.type =
                    "button";


                removeButton.className =
                    "activity-photo-remove";


                removeButton.textContent =
                    "×";


                removeButton.setAttribute(
                    "aria-label",
                    "Remove picture"
                );


                removeButton.addEventListener(
                    "click",
                    () => {

                        selectedActivityPhotos
                            .splice(
                                index,
                                1
                            );


                        renderActivityPhotoPreview();

                    }
                );


                wrapper.appendChild(
                    image
                );


                wrapper.appendChild(
                    removeButton
                );


                container.appendChild(
                    wrapper
                );

            }
        );

}


/* =========================================================
   POST ACTIVITY
========================================================= */

async function handleActivitySubmit(
    event
) {

    event.preventDefault();


    if (
        !currentUser ||
        !currentChallenge
    ) {

        showToast(
            "Please log in again."
        );

        return;

    }


    const button =
        document.getElementById(
            "post-activity-button"
        );


    const distanceInput =
        document.getElementById(
            "activity-distance"
        );


    const captionInput =
        document.getElementById(
            "activity-caption"
        );


    const dateInput =
        document.getElementById(
            "activity-date"
        );


    const distance =
        Number(
            distanceInput?.value
        );


    const activityDate =
        dateInput?.value ||
        getTodayISO();


    const caption =
        captionInput?.value.trim() ||
        null;


    const durationSeconds =
        getSelectedDurationSeconds();


    if (
        !Number.isFinite(distance) ||
        distance <= 0
    ) {

        showToast(
            "Please enter a valid distance."
        );

        return;

    }


    if (
        !activityDate
    ) {

        showToast(
            "Please choose a date."
        );

        return;

    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Posting…";

    }


    try {

        /*
           Make sure the user is actually a
           challenge participant.
        */

        await ensureParticipant();


        /*
           Save the activity first.
        */

        const activityPayload = {

            user_id:
                currentUser.id,

            challenge_id:
                currentChallenge.id,

            activity_type:
                selectedActivityType,

            distance_km:
                Number(
                    distance.toFixed(2)
                ),

            duration_minutes:
                durationSeconds
                    ? Math.round(
                        durationSeconds / 60
                    )
                    : null,

            duration_seconds:
                durationSeconds,

            activity_date:
                activityDate,

            caption:
                caption

        };


        let activityData = null;


        /*
           First try with duration_seconds.
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("activities")
                .insert(
                    activityPayload
                )
                .select()
                .single();


        if (error) {

            /*
               If an old schema is being used,
               retry without duration_seconds.
            */

            if (
                String(error.message)
                    .toLowerCase()
                    .includes(
                        "duration_seconds"
                    )
            ) {

                const fallbackPayload = {

                    user_id:
                        currentUser.id,

                    challenge_id:
                        currentChallenge.id,

                    activity_type:
                        selectedActivityType,

                    distance_km:
                        Number(
                            distance.toFixed(2)
                        ),

                    duration_minutes:
                        durationSeconds
                            ? Math.round(
                                durationSeconds / 60
                            )
                            : null,

                    activity_date:
                        activityDate,

                    caption:
                        caption

                };


                const fallbackResult =
                    await supabaseClient
                        .from("activities")
                        .insert(
                            fallbackPayload
                        )
                        .select()
                        .single();


                if (
                    fallbackResult.error
                ) {

                    throw fallbackResult.error;

                }


                activityData =
                    fallbackResult.data;

            } else {

                throw error;

            }

        } else {

            activityData =
                data;

        }


        if (
            !activityData ||
            !activityData.id
        ) {

            throw new Error(
                "Activity was not created."
            );

        }


        /*
           Upload activity photos AFTER
           the activity exists.
        */

        if (
            selectedActivityPhotos.length
        ) {

            await uploadActivityPhotos(
                activityData.id,
                selectedActivityPhotos
            );

        }


        /*
           Reset the form.
        */

        resetActivityForm();


        /*
           Refresh all affected sections.
        */

        await loadHome();

        await loadLeaderboard();

        await loadProfilePage();

        await loadStreak();


        showToast(
            "Activity posted! 🔥"
        );


        /*
           Return to home after posting.
        */

        showPage(
            "home-page"
        );


    } catch (error) {

        console.error(
            "Activity posting error:",
            error
        );


        showToast(
            error.message ||
            "Could not post activity."
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Post activity";

        }

    }

}


/* =========================================================
   UPLOAD ACTIVITY PHOTOS
========================================================= */

async function uploadActivityPhotos(
    activityId,
    files
) {

    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];


        const extension =
            getFileExtension(
                file
            );


        const filePath =
            `${currentUser.id}/${activityId}/photo-${Date.now()}-${i}-${Math.random()
                .toString(36)
                .slice(2)}.${extension}`;


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("activity pictures")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            throw uploadError;

        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from("activity pictures")
                .getPublicUrl(
                    filePath
                );


        if (
            !data ||
            !data.publicUrl
        ) {

            throw new Error(
                "Could not create activity picture URL."
            );

        }


        const {
            error: photoError
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


        if (photoError) {

            throw photoError;

        }

    }

}


/* =========================================================
   RESET ACTIVITY FORM
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


    selectedActivityType =
        "run";


    document
        .querySelectorAll(
            ".activity-type-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.activityType ===
                    "run"
                );

            }
        );


    setupDurationPicker();


    renderActivityPhotoPreview();


    const dateInput =
        document.getElementById(
            "activity-date"
        );


    if (dateInput) {

        dateInput.value =
            getTodayISO();

    }

}


/* =========================================================
   SET DEFAULT ACTIVITY DATE
========================================================= */

function setupActivityDate() {

    const dateInput =
        document.getElementById(
            "activity-date"
        );


    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            getTodayISO();

    }

}


/* =========================================================
   HOME
========================================================= */

async function loadHome() {

    if (
        !currentChallenge ||
        !currentUser
    ) {

        return;

    }


    const activities =
        await fetchUserChallengeActivities();


    let runWalkTotal = 0;

    let cyclingTotal = 0;


    activities.forEach(
        activity => {

            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type === "cycle"
            ) {

                cyclingTotal +=
                    distance;

            } else {

                runWalkTotal +=
                    distance;

            }

        }
    );


    setText(
        "run-walk-total",
        `${runWalkTotal.toFixed(1)} km`
    );


    setText(
        "cycling-total",
        `${cyclingTotal.toFixed(1)} km`
    );


    /*
       Calculate current user's ranks.
    */

    const rankings =
        await getLeaderboardData();


    const runWalkRank =
        rankings.runwalk.findIndex(
            athlete =>
                athlete.user_id ===
                currentUser.id
        ) + 1;


    const cyclingRank =
        rankings.cycle.findIndex(
            athlete =>
                athlete.user_id ===
                currentUser.id
        ) + 1;


    setText(
        "run-walk-rank",
        runWalkRank > 0
            ? `Rank #${runWalkRank}`
            : "Rank #—"
    );


    setText(
        "cycling-rank",
        cyclingRank > 0
            ? `Rank #${cyclingRank}`
            : "Rank #—"
    );


    /*
       Feed.
    */

    await loadActivityFeed();

}


/* =========================================================
   ACTIVITY FEED
========================================================= */

async function loadActivityFeed() {

    const container =
        document.getElementById(
            "activity-feed"
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
            .select(
                `
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
            .limit(30);


    if (error) {

        console.error(
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                <h3>
                    Could not load activities
                </h3>
            </div>
        `;

        return;

    }


    if (
        !data ||
        !data.length
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🏃
                </div>

                <h3>
                    No activities yet
                </h3>

                <p>
                    Be the first person to log today's activity.
                </p>

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


/* =========================================================
   ACTIVITY CARD
========================================================= */

function renderActivityCard(
    activity
) {

    const icon =
        activity.activity_type === "cycle"
            ? "🚴"
            : activity.activity_type === "walk"
                ? "🚶"
                : "🏃";


    const typeName =
        activity.activity_type === "cycle"
            ? "Cycling"
            : activity.activity_type === "walk"
                ? "Walk"
                : "Run";


    const duration =
        formatDuration(
            activity.duration_seconds,
            activity.duration_minutes
        );


    const profile =
        activity.profiles ||
        {};


    const name =
        profile.name ||
        "HUNDO athlete";


    const avatar =
        profile.profile_photo_url
            ? `
                <img
                    src="${escapeAttribute(
                        addCacheBuster(
                            profile.profile_photo_url
                        )
                    )}"
                    alt=""
                >
            `
            : "👤";


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
                        .map(
                            photo => `
                                <img
                                    src="${escapeAttribute(
                                        photo.photo_url
                                    )}"
                                    alt="Activity picture"
                                >
                            `
                        )
                        .join("")}
                </div>
            `
            : "";


    const deleteHTML =
        activity.user_id ===
        currentUser?.id
            ? `
                <button
                    type="button"
                    data-delete-activity="${escapeAttribute(
                        activity.id
                    )}"
                    class="activity-delete-button"
                >
                    Delete
                </button>
            `
            : "";


    return `
        <article class="activity-card">

            <div class="activity-card-header">

                <div class="activity-feed-avatar">
                    ${avatar}
                </div>

                <div class="activity-feed-user">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <small>
                        ${typeName}
                    </small>

                </div>

            </div>


            <div class="activity-main">

                <div class="activity-title">

                    <div class="activity-type-name">
                        ${icon} ${typeName}
                    </div>

                    <div class="activity-distance">
                        ${Number(
                            activity.distance_km
                        ).toFixed(1)} km
                    </div>

                </div>


                <div class="activity-meta">

                    ${
                        duration
                            ? `<span>⏱ ${escapeHTML(duration)}</span>`
                            : ""
                    }

                    <span>
                        Day ${
                            getChallengeDay(
                                activity.activity_date
                            )
                        }
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

        await loadStreak();


        showToast(
            "Activity deleted."
        );

    }
);


/* =========================================================
   LEADERBOARD
========================================================= */

async function loadLeaderboard() {

    const container =
        document.getElementById(
            "leaderboard-list"
        );


    if (
        !container ||
        !currentChallenge
    ) {

        return;

    }


    container.innerHTML = `
        <div class="empty-state">
            Loading leaderboard…
        </div>
    `;


    try {

        const rankings =
            await getLeaderboardData();


        const list =
            selectedBoard === "cycle"
                ? rankings.cycle
                : rankings.runwalk;


        if (!list.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No participants yet
                    </h3>

                    <p>
                        Invite your HUNDO crew to get started.
                    </p>

                </div>
            `;

            return;

        }


        container.innerHTML =
            list
                .map(
                    (
                        athlete,
                        index
                    ) =>
                        renderLeaderboardRow(
                            athlete,
                            index + 1
                        )
                )
                .join("");

    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Could not load leaderboard.
                </h3>

            </div>
        `;

    }

}


/* =========================================================
   GET LEADERBOARD DATA
========================================================= */

async function getLeaderboardData() {

    if (!currentChallenge) {

        return {
            runwalk: [],
            cycle: []
        };

    }


    const {
        data: participants,
        error: participantError
    } =
        await supabaseClient
            .from(
                "challenge_participants"
            )
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

        throw participantError;

    }


    const {
        data: activities,
        error: activityError
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
            );


    if (activityError) {

        throw activityError;

    }


    const totals = {};


    (
        participants || []
    ).forEach(
        participant => {

            totals[
                participant.user_id
            ] = {

                user_id:
                    participant.user_id,

                name:
                    participant.profiles?.name ||
                    "HUNDO athlete",

                age:
                    participant.profiles?.age ||
                    null,

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


    (
        activities || []
    ).forEach(
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
                activity.activity_type ===
                "cycle"
            ) {

                totals[
                    activity.user_id
                ].cycle +=
                    distance;

            } else {

                totals[
                    activity.user_id
                ].runwalk +=
                    distance;

            }

        }
    );


    const all =
        Object.values(
            totals
        );


    const runwalk =
        [...all]
            .sort(
                (
                    a,
                    b
                ) =>
                    b.runwalk -
                    a.runwalk
            );


    const cycle =
        [...all]
            .sort(
                (
                    a,
                    b
                ) =>
                    b.cycle -
                    a.cycle
            );


    return {
        runwalk,
        cycle
    };

}


/* =========================================================
   LEADERBOARD ROW
========================================================= */

function renderLeaderboardRow(
    athlete,
    rank
) {

    const isCurrentUser =
        athlete.user_id ===
        currentUser?.id;


    const medal =
        rank === 1
            ? "🥇"
            : rank === 2
                ? "🥈"
                : rank === 3
                    ? "🥉"
                    : "";


    const distance =
        selectedBoard === "cycle"
            ? athlete.cycle
            : athlete.runwalk;


    const avatar =
    person.photo
        ? `
            <img
                src="${escapeAttribute(
                    person.photo +
                    (person.photo.includes("?") ? "&" : "?") +
                    "v=" +
                    Date.now()
                )}"
                alt=""
            >
          `
        : "👤";
   
    return `
        <div
            class="
                leaderboard-row
                ${isCurrentUser ? "current-user" : ""}
                ${rank === 1 ? "top-one" : ""}
            "
        >

            <div class="leaderboard-rank">

                ${
                    medal
                        ? `
                            <span class="leaderboard-medal">
                                ${medal}
                            </span>
                        `
                        : rank
                }

            </div>


            <div class="leaderboard-avatar">
                ${avatar}
            </div>


            <div class="leaderboard-info">

                <div class="leaderboard-name">

                    ${escapeHTML(
                        athlete.name
                    )}

                    ${
                        isCurrentUser
                            ? `
                                <span class="leaderboard-you">
                                    YOU
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="leaderboard-subtitle">

                    ${
                        athlete.age
                            ? `Age ${athlete.age}`
                            : "HUNDO athlete"
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


/* =========================================================
   PROFILE PAGE
========================================================= */

async function loadProfilePage() {

    if (
        !currentUser ||
        !currentChallenge
    ) {

        return;

    }


    const activities =
        await fetchUserChallengeActivities();


    let runWalkTotal = 0;

    let cyclingTotal = 0;


    activities.forEach(
        activity => {

            const distance =
                Number(
                    activity.distance_km
                ) || 0;


            if (
                activity.activity_type ===
                "cycle"
            ) {

                cyclingTotal +=
                    distance;

            } else {

                runWalkTotal +=
                    distance;

            }

        }
    );


    setText(
        "profile-run-walk",
        `${runWalkTotal.toFixed(1)} km`
    );


    setText(
        "profile-cycling",
        `${cyclingTotal.toFixed(1)} km`
    );


    renderActivityHistory(
        activities
    );

}


/* =========================================================
   ACTIVITY HISTORY
========================================================= */

function renderActivityHistory(
    activities
) {

    const container =
        document.getElementById(
            "activity-history"
        );


    if (!container) {
        return;
    }


    if (
        !activities ||
        !activities.length
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No activities yet.
            </div>
        `;

        return;

    }


    const sorted =
        [...activities]
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        b.activity_date
                    ) -
                    new Date(
                        a.activity_date
                    )
            );


    container.innerHTML =
        sorted
            .map(
                activity => {

                    const icon =
                        activity.activity_type ===
                        "cycle"
                            ? "🚴"
                            : activity.activity_type ===
                              "walk"
                                ? "🚶"
                                : "🏃";


                    const type =
                        activity.activity_type ===
                        "cycle"
                            ? "Cycling"
                            : activity.activity_type ===
                              "walk"
                                ? "Walk"
                                : "Run";


                    const duration =
                        formatDuration(
                            activity.duration_seconds,
                            activity.duration_minutes
                        );


                    return `
                        <div class="activity-history-item">

                            <div class="activity-history-icon">
                                ${icon}
                            </div>


                            <div class="activity-history-info">

                                <strong>
                                    ${type}
                                </strong>

                                <small>
                                    ${formatDate(
                                        activity.activity_date
                                    )}

                                    ${
                                        duration
                                            ? ` · ${escapeHTML(
                                                duration
                                            )}`
                                            : ""
                                    }
                                </small>

                            </div>


                            <div class="activity-history-distance">
                                ${Number(
                                    activity.distance_km
                                ).toFixed(1)} km
                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   USER ACTIVITIES
========================================================= */

async function fetchUserChallengeActivities() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select(
                `
                *,
                activity_photos (
                    id,
                    photo_url
                )
                `
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

        throw error;

    }


    return data || [];

}


/* =========================================================
   CHALLENGE ACTIVITIES
========================================================= */

async function fetchChallengeActivities() {

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
                duration_seconds,
                activity_date,
                caption,
                created_at
                `
            )
            .eq(
                "challenge_id",
                currentChallenge.id
            );


    if (error) {

        throw error;

    }


    return data || [];

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
            );


    if (error) {

        console.error(
            "Streak error:",
            error
        );

        setText(
            "current-streak",
            "0"
        );

        return;

    }


    const dates =
        new Set(
            (
                data || []
            ).map(
                activity =>
                    activity.activity_date
            )
        );


    let streak = 0;

    let cursor =
        new Date();


    cursor.setHours(
        0,
        0,
        0,
        0
    );


    /*
       Count consecutive activity days
       ending today.

       If today has no activity,
       check yesterday so the current
       streak isn't immediately lost
       before the user logs today.
    */

    const todayISO =
        toISODate(
            cursor
        );


    if (
        !dates.has(
            todayISO
        )
    ) {

        cursor.setDate(
            cursor.getDate() - 1
        );

    }


    while (true) {

        const dateISO =
            toISODate(
                cursor
            );


        if (
            !dates.has(
                dateISO
            )
        ) {

            break;

        }


        streak++;


        cursor.setDate(
            cursor.getDate() - 1
        );

    }


    setText(
        "current-streak",
        String(streak)
    );

}


/* =========================================================
   DAY COUNTER
========================================================= */

function updateDayCounter() {

    if (
        !currentChallenge
    ) {

        return;

    }


    const start =
        parseDateOnly(
            currentChallenge.start_date
        );


    const today =
        parseDateOnly(
            getTodayISO()
        );


    const end =
        parseDateOnly(
            currentChallenge.end_date
        );


    let day =
        Math.floor(
            (
                today - start
            ) /
            86400000
        ) + 1;


    if (
        today < start
    ) {

        day = 0;

    }


    if (
        today > end
    ) {

        day = 100;

    }


    day =
        Math.max(
            0,
            Math.min(
                100,
                day
            )
        );


    setText(
        "current-day",
        String(day)
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(
    pageId
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.classList.add(
                    "hidden"
                );

            }
        );


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.remove(
            "hidden"
        );

    }


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
        "leaderboard-page"
    ) {

        loadLeaderboard();

    }


    if (
        pageId ===
        "profile-page"
    ) {

        loadProfilePage();

    }


    if (
        pageId ===
        "log-page"
    ) {

        setupActivityDate();

    }

}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

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


        Object.assign(
            toast.style,
            {
                position: "fixed",
                left: "50%",
                bottom: "100px",
                transform: "translateX(-50%)",
                zIndex: "99999",
                maxWidth: "calc(100% - 40px)",
                padding: "12px 17px",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#0b0b0b",
                fontSize: "13px",
                fontWeight: "700",
                textAlign: "center",
                boxShadow:
                    "0 8px 30px rgba(0,0,0,.35)"
            }
        );


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

            },
            2800
        );

}


/* =========================================================
   FORMAT DURATION
========================================================= */

function formatDuration(
    durationSeconds,
    durationMinutes
) {

    let totalSeconds =
        Number(
            durationSeconds
        );


    if (
        !Number.isFinite(
            totalSeconds
        ) ||
        totalSeconds <= 0
    ) {

        const minutes =
            Number(
                durationMinutes
            );


        if (
            !Number.isFinite(
                minutes
            ) ||
            minutes <= 0
        ) {

            return "";

        }


        totalSeconds =
            Math.round(
                minutes * 60
            );

    }


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) / 60
        );


    const seconds =
        totalSeconds %
        60;


    const parts = [];


    if (hours > 0) {

        parts.push(
            `${hours}h`
        );

    }


    if (
        minutes > 0 ||
        hours > 0
    ) {

        parts.push(
            `${minutes}m`
        );

    }


    if (
        seconds > 0 ||
        (
            hours === 0 &&
            minutes === 0
        )
    ) {

        parts.push(
            `${seconds}s`
        );

    }


    return parts.join(
        " "
    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayISO() {

    const date =
        new Date();


    return toISODate(
        date
    );

}


function toISODate(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function parseDateOnly(
    value
) {

    const [
        year,
        month,
        day
    ] =
        String(value)
            .split("-")
            .map(
                Number
            );


    return new Date(
        year,
        month - 1,
        day
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        parseDateOnly(
            value
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


function getChallengeDay(
    activityDate
) {

    if (
        !currentChallenge ||
        !activityDate
    ) {

        return "—";

    }


    const start =
        parseDateOnly(
            currentChallenge.start_date
        );


    const date =
        parseDateOnly(
            activityDate
        );


    let day =
        Math.floor(
            (
                date - start
            ) /
            86400000
        ) + 1;


    day =
        Math.max(
            1,
            Math.min(
                100,
                day
            )
        );


    return day;

}


/* =========================================================
   FILE HELPERS
========================================================= */

function getFileExtension(
    file
) {

    const fromName =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase();


    if (
        fromName &&
        /^[a-z0-9]+$/.test(
            fromName
        )
    ) {

        return fromName;

    }


    const mime =
        file.type
            .split("/")
            .pop()
            ?.toLowerCase();


    return mime || "jpg";

}


/* =========================================================
   CACHE BUSTER
========================================================= */

function addCacheBuster(
    url
) {

    if (!url) {
        return "";
    }


    return url.includes("?")
        ? `${url}&v=${Date.now()}`
        : `${url}?v=${Date.now()}`;

}


/* =========================================================
   ESCAPING
========================================================= */

function escapeHTML(
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

    return escapeHTML(
        value
    );

}
