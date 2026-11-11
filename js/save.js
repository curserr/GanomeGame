// =====================================================================
//  save.js  -  saving and loading (browser localStorage)
//
//  This file only deals with the DATA. It never touches the menu: it returns a result
//  and ui.js decides what to tell the player.
//  To save something new, add a field to NewSave(), fill it in SaveGame(), use it in ApplySave().
// =====================================================================

const SaveKey = "cameraDemoSave";             // a different key from the real game, so saves don't mix

function NewSave()
{
    return {
        version: 1,
        room: "hall",
        x: 0,                      // position as a fraction of the ROOM width (0 to 1)
        bossesDefeated: [],        // ids of bosses that stay dead
        flags: {}                  // things the player decided or did, e.g. { likesCave: true }
    };
}

let Save = NewSave();

function InitSave()
{
    Save = NewSave();
}

function HasSave()
{
    try { return localStorage.getItem(SaveKey) !== null; }
    catch (e) { return false; }
}

// Returns true if it worked
function SaveGame()
{
    Save.room = CurrentRoomName;
    Save.x = PlayerX / CurrentRoom.width;

    try
    {
        localStorage.setItem(SaveKey, JSON.stringify(Save));
        return true;
    }
    catch (e)
    {
        return false;
    }
}

// Puts the game into the state described by Save
function ApplySave()
{
    ChangeRoom(Save.room);                    // first the room, so we know how wide it is

    let x = Number.isFinite(Save.x) ? Math.min(Math.max(Save.x, 0), 1) : 0;
    PlayerX = Math.min(x * CurrentRoom.width, CurrentRoom.width - PlayerWidth);

    ResetPlayerMotion();
    UpdateCamera(true);
}

// Returns "ok", "none" (nothing saved) or "damaged"
function LoadGame()
{
    let text = null;
    try { text = localStorage.getItem(SaveKey); } catch (e) {}

    if (text === null) return "none";

    try { Object.assign(Save, JSON.parse(text)); }
    catch (e) { return "damaged"; }

    // keep the lists valid even if an old save did not have them
    if (!Array.isArray(Save.bossesDefeated)) Save.bossesDefeated = [];
    if (typeof Save.flags !== "object" || Save.flags === null) Save.flags = {};

    ApplySave();
    return "ok";
}
