// =====================================================================
//  audio.js  -  background music (everything from the normal game, in one place)
//
//  - Browsers only allow sound after the first key press or click, so the music starts then.
//  - Every room can have its own track:   music: "DarkPartsMusic.mp3"
//    and its own loudness (0 to 1):       volume: 0.7        (default 0.4)
//  - A room without `music` keeps whatever is already playing.
//  - The track only changes if it is a DIFFERENT file, so rooms that share a track don't restart it.
//
//  Used by: rooms.js (ChangeRoom calls PlayRoomMusic), main.js (calls InitAudio).
// =====================================================================

const DefaultVolume = 0.4;                    // 0 to 1

let Music = null;                             // the one <audio> element that plays the background music
let MusicOn = false;                          // becomes true after the first key press or click
let MusicFile = "";                           // the track that is currently loaded

function InitAudio()
{
    Music = new Audio();
    Music.loop = true;
    Music.volume = DefaultVolume;

    document.addEventListener("keydown", StartMusic);
    document.addEventListener("click", StartMusic);
}

/////////////////////////////
///
////////////////////////////

// Runs once, on the first key press or click
function StartMusic()
{
    MusicOn = true;
    if (MusicFile !== "") Music.play().catch(function() {});

    document.removeEventListener("keydown", StartMusic);
    document.removeEventListener("click", StartMusic);
}

/////////////////////////////
///
////////////////////////////


// Called whenever a room is entered: sets that room's volume and switches track if needed
function PlayRoomMusic(room)
{
    if (!Music) return;

    Music.volume = room.volume ?? DefaultVolume;

    // Only switch the track if it is actually a different file
    if (room.music && room.music !== MusicFile)
    {
        MusicFile = room.music;
        Music.src = room.music;
        if (MusicOn) Music.play().catch(function() {});
    }
}

/////////////////////////////
///
////////////////////////////

function SetMusicVolume(v)
{
    if (Music) Music.volume = Math.max(0, Math.min(1, v));
}

/////////////////////////////
///
////////////////////////////

function PauseMusic()
{
    if (Music) Music.pause();
}

/////////////////////////////
///
////////////////////////////

function ResumeMusic()
{
    if (Music && MusicOn && MusicFile !== "") Music.play().catch(function() {});
}