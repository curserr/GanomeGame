// =====================================================================
//  input.js  -  the keyboard
//
//  This file only RECORDS what the keyboard does. The other files decide what to do about it.
//  (The menu and the dialogue box have their own key listeners in ui.js and dialogue.js.)
// =====================================================================

let keys = {};                    // keys["arrowleft"] is true while that key is held

// One-shot requests: set by a fresh key press, used up by the game step that reads them
let JumpRequested = false;
let InteractRequested = false;

function InitInput()
{
    document.addEventListener("keydown", function(event) {
        let key = event.key.toLowerCase();
        keys[key] = true;

        // Nothing in the game reacts while the menu or a dialogue is open
        let frozen = IsPaused() || IsDialogueOpen();

        // A fresh press (not key repeat) asks for one jump / one interaction
        if (key === " " && !event.repeat && !frozen) JumpRequested = true;
        if (key === "e" && !event.repeat && !frozen) InteractRequested = true;

        // Stop the page from scrolling or the browser from acting on these keys
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter"].includes(key)) {
            event.preventDefault();
        }
    });

    document.addEventListener("keyup", function(event) {
        keys[event.key.toLowerCase()] = false;
    });
}
