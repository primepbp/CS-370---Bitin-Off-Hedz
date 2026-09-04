/* =====================================================
   BITIN' OFF HEDZ
   GAME JAVASCRIPT
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const titleScreen =
    document.getElementById("titleScreen");

const characterScreen =
    document.getElementById("characterScreen");

const playButton =
    document.getElementById("playButton");

const howButton =
    document.getElementById("howButton");

const howModal =
    document.getElementById("howModal");

const closeHow =
    document.getElementById("closeHow");

const soundButton =
    document.getElementById("soundButton");

const backButton =
    document.getElementById("backButton");

const continueButton =
    document.getElementById("continueButton");

const selectedMessage =
    document.getElementById("selectedMessage");

const characterCards =
    document.querySelectorAll(".character-card");


/* =====================================================
   GAME VARIABLES
===================================================== */

let selectedCharacter = null;

let soundEnabled = true;

let audioContext = null;

let musicTimer = null;


/* =====================================================
   AUDIO SYSTEM
===================================================== */

function initializeAudio() {

    if (!soundEnabled) {
        return;
    }

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        startAdventureMusic();

    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

}


/* =====================================================
   PLAY SOUND
===================================================== */

function playSound(
    frequency,
    duration,
    type = "triangle",
    volume = 0.035
) {

    if (!soundEnabled) {
        return;
    }

    initializeAudio();

    if (!audioContext) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type = type;

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration
    );

}


/* =====================================================
   BUTTON SOUND
===================================================== */

function buttonSound() {

    playSound(
        500,
        0.08,
        "square",
        0.025
    );

    setTimeout(() => {

        playSound(
            750,
            0.09,
            "square",
            0.02
        );

    }, 70);

}


/* =====================================================
   CHARACTER SOUND
===================================================== */

function characterSound() {

    playSound(
        440,
        0.1,
        "triangle",
        0.035
    );

    setTimeout(() => {

        playSound(
            660,
            0.13,
            "triangle",
            0.035
        );

    }, 100);

}


/* =====================================================
   ADVENTURE MUSIC
===================================================== */

function startAdventureMusic() {

    if (
        !soundEnabled ||
        !audioContext
    ) {
        return;
    }


    const melody = [

        196,
        220,
        261,
        293,

        261,
        220,
        196,
        164,

        196,
        247,
        293,
        330,

        293,
        247,
        220,
        196

    ];


    let index = 0;


    function playNextNote() {

        if (
            !soundEnabled ||
            !audioContext
        ) {
            return;
        }


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type =
            "triangle";


        oscillator.frequency.value =
            melody[index];


        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.018,
            audioContext.currentTime +
            0.05
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime +
            0.55
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            0.6
        );


        index++;

        if (
            index >= melody.length
        ) {

            index = 0;

        }

    }


    playNextNote();


    musicTimer =
        setInterval(
            playNextNote,
            650
        );

}


/* =====================================================
   STOP MUSIC
===================================================== */

function stopMusic() {

    if (musicTimer) {

        clearInterval(
            musicTimer
        );

        musicTimer = null;

    }

}


/* =====================================================
   SOUND BUTTON
===================================================== */

soundButton.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;


        if (soundEnabled) {

            soundButton.textContent =
                "🔊";

            initializeAudio();

            buttonSound();

        } else {

            soundButton.textContent =
                "🔇";

            stopMusic();

        }

    }
);


/* =====================================================
   PLAY BUTTON
===================================================== */

playButton.addEventListener(
    "click",
    () => {

        initializeAudio();

        buttonSound();


        titleScreen.classList.add(
            "hidden"
        );


        characterScreen.classList.remove(
            "hidden"
        );

    }
);


/* =====================================================
   HOW TO PLAY
===================================================== */

howButton.addEventListener(
    "click",
    () => {

        initializeAudio();

        buttonSound();

        howModal.classList.remove(
            "hidden"
        );

    }
);


/* =====================================================
   CLOSE HOW TO PLAY
===================================================== */

closeHow.addEventListener(
    "click",
    () => {

        buttonSound();

        howModal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

howModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            howModal
        ) {

            howModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   CHARACTER SELECTION
===================================================== */

characterCards.forEach(
    (card) => {

        const selectButton =
            card.querySelector(
                ".select-button"
            );


        selectButton.addEventListener(
            "click",
            () => {

                initializeAudio();

                characterSound();


                /* Remove previous selection */

                characterCards.forEach(
                    (otherCard) => {

                        otherCard.classList.remove(
                            "selected"
                        );

                    }
                );


                /* Select this character */

                card.classList.add(
                    "selected"
                );


                /* Save name */

                selectedCharacter =
                    card.dataset.character;


                /* Update message */

                selectedMessage.textContent =
                    selectedCharacter.toUpperCase()
                    + " HAS JOINED THE ADVENTURE";


                /* Enable continue */

                continueButton.disabled =
                    false;

            }
        );

    }
);


/* =====================================================
   CONTINUE
===================================================== */

continueButton.addEventListener(
    "click",
    () => {

        if (
            selectedCharacter === null
        ) {

            return;

        }


        initializeAudio();

        buttonSound();


        /*
            This is temporary.

            Later we will replace this
            with the actual game board.
        */

        setTimeout(
            () => {

                alert(
                    "⚔ Welcome, "
                    + selectedCharacter
                    + "! ⚔\n\n"
                    + "Your adventure is about to begin!"
                );

            },
            150
        );

    }
);


/* =====================================================
   BACK BUTTON
===================================================== */

backButton.addEventListener(
    "click",
    () => {

        buttonSound();


        characterScreen.classList.add(
            "hidden"
        );


        titleScreen.classList.remove(
            "hidden"
        );

    }
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        /* ESC closes popup */

        if (
            event.key === "Escape"
        ) {

            howModal.classList.add(
                "hidden"
            );

        }


        /* Enter continues */

        if (
            event.key === "Enter" &&
            selectedCharacter !== null &&
            !characterScreen.classList.contains(
                "hidden"
            )
        ) {

            continueButton.click();

        }

    }
);