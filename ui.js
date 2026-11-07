// =====================================================================
//  ui.js  -  the HTML interface layer: pause menu, debug text, minimap
//
//  Everything here is plain HTML and CSS (the #ui layer). The camera never moves it.
//  (The dialogue box is in dialogue.js.)
// =====================================================================

const MenuItems = ["Resume", "Save game", "Load game"];

let DebugBox, MenuLayer, MenuStatus, MenuButtons, MiniLabel, MiniView, MiniPlayer;

let ShowDebug = true;         // press D to toggle
let Paused = false;
let MenuSelected = 0;
let MenuHasSave = false;

function InitUI()
{
    DebugBox    = document.getElementById("Debug");
    MenuLayer   = document.getElementById("Menu");
    MenuStatus  = document.getElementById("MenuStatus");
    MenuButtons = [document.getElementById("BtnResume"), document.getElementById("BtnSave"), document.getElementById("BtnLoad")];
    MiniLabel   = document.getElementById("MiniLabel");
    MiniView    = document.getElementById("MiniView");
    MiniPlayer  = document.getElementById("MiniPlayer");

    MenuButtons.forEach(function(button, index) {
        button.addEventListener("click", function() { MenuActivate(index); this.blur(); });
        button.addEventListener("mouseenter", function() {
            if (MenuEnabled(index)) { MenuSelected = index; RefreshMenu(); }
        });
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") { if (Paused) CloseMenu(); else OpenMenu(); }
        else if (Paused) MenuKey(event);

        if (event.key.toLowerCase() === "d") ShowDebug = !ShowDebug;
    });

    // If a save exists, start with the menu open so it can be loaded
    if (HasSave())
    {
        OpenMenu();
        MenuSelected = 2;               // highlight "Load game"
        RefreshMenu();
        SetMenuStatus("Saved game found. Press Load to continue.");
    }
}

function IsPaused()
{
    return Paused;
}

// ---------- Menu ----------
function MenuEnabled(index) { return (index === 2) ? MenuHasSave : true; }
function SetMenuStatus(text) { MenuStatus.textContent = text; }

function RefreshMenu()
{
    for (let i = 0; i < MenuButtons.length; i++)
    {
        MenuButtons[i].disabled = !MenuEnabled(i);
        MenuButtons[i].classList.toggle("selected", i === MenuSelected && MenuEnabled(i));
    }
}

function OpenMenu()
{
    Paused = true;
    SetMenuStatus("");
    MenuHasSave = HasSave();
    MenuSelected = 0;
    MenuLayer.style.display = "flex";
    RefreshMenu();
}

function CloseMenu()
{
    Paused = false;
    JumpRequested = false;          // a space press made while paused must not cause a jump
    InteractRequested = false;
    MenuLayer.style.display = "none";
}

function MenuActivate(index)
{
    if (index === 0)
    {
        CloseMenu();
    }
    else if (index === 1)
    {
        if (SaveGame())
        {
            SetMenuStatus("Game saved.");
            MenuHasSave = true;
            RefreshMenu();
        }
        else
        {
            SetMenuStatus("Could not save: browser storage is blocked.");
        }
    }
    else if (index === 2)
    {
        let result = LoadGame();
        if (result === "ok") CloseMenu();
        else if (result === "none") SetMenuStatus("No saved game found.");
        else SetMenuStatus("The save is damaged.");
    }
}

function MenuMove(step)
{
    let i = MenuSelected;
    for (let n = 0; n < MenuItems.length; n++)
    {
        i = (i + step + MenuItems.length) % MenuItems.length;
        if (MenuEnabled(i)) { MenuSelected = i; break; }
    }
    RefreshMenu();
}

function MenuKey(event)
{
    if (event.key === "ArrowDown") MenuMove(1);
    else if (event.key === "ArrowUp") MenuMove(-1);
    else if ((event.key === "Enter" || event.key === " ") && !event.repeat) MenuActivate(MenuSelected);
}

// ---------- Debug text and minimap ----------
function UpdateUI()
{
    let rw = CurrentRoom.width;

    DebugBox.style.display = ShowDebug ? "block" : "none";
    if (ShowDebug)
    {
        DebugBox.textContent =
            "room: " + CurrentRoom.name + "\n" +
            "player x: " + Math.round(PlayerX) + " / " + rw + "\n" +
            "camera x: " + Math.round(CameraX) + "   view: " + Math.round(ViewW) + " units wide\n" +
            "frame " + CurrentFrame + " (" + StateName + ")\n" +
            "hits taken: " + HitsTaken;
    }

    // Mini map: the gold box is the part of the room the camera shows
    let viewFrac = Math.min(1, ViewW / rw);
    let left = Math.max(0, Math.min(1 - viewFrac, CameraX / rw));
    MiniLabel.textContent = CurrentRoom.name + " - " + rw + " units wide";
    MiniView.style.left   = (left * 100) + "%";
    MiniView.style.width  = (viewFrac * 100) + "%";
    MiniPlayer.style.left = (PlayerX / rw * 100) + "%";
}
