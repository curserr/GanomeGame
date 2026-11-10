// =====================================================================
//  rooms.js  -  the room list and moving between rooms
//
//  A room is plain data:
//     name, width (units), background colours, exits, props (scenery),
//     enemies: [{type, x}], npcs: [{type, x}], boss: {type, x}   <- the last three are optional
//
//  width / height are in units. 1280 x 720 is exactly one screen on a 16:9 window.
//  A room that is wider than the screen scrolls. A room that is not wider stays fixed
//  (and is centred if the window is wider than the room).
//  "exits" says which room you reach by walking off the left or right edge of the room.
// =====================================================================

const Emojis   = ["🌲", "🏠", "⛺", "🪨", "🍄", "🌵", "🗿", "🏺", "🔥", "🌳"];
const Floaters = ["⭐", "🦋", "☁️", "🎈", "🪁", "🐦"];

// Fills a room with reference objects so you can see the camera move.
// Emojis stand on the floor, floaters hang in the air, and a gold pillar marks every 1280 units.
function BuildProps(width, seed)
{
    let r = Rand(seed);
    let list = [];

    for (let x = 160; x < width - 100; x += 170 + r() * 160)
    {
        list.push({ e: Emojis[Math.floor(r() * Emojis.length)], x: x, s: 50 + Math.floor(r() * 40) });
    }

    for (let x = 300; x < width - 100; x += 300 + r() * 300)
    {
        list.push({ e: Floaters[Math.floor(r() * Floaters.length)], x: x, up: 220 + Math.floor(r() * 260), s: 48 });
    }

    for (let k = 1; k * 1280 < width; k++)
    {
        list.push({ box: true, x: k * 1280 - 20, w: 40, h: 260, color: "#c9a15b", label: String(k) });
    }

    return list;
}

/////////////////////////////
///
////////////////////////////

const Rooms = {
    hall: {
        name: "Hall (fixed room, 1 screen)",
        width: 1280,
        background: ["#1b1030", "#3a1d5c"],
        exits: { right: "cave" },
        props: BuildProps(1280, 11),
        npcs: [{ type: "wizard", x: 900 }],
        music: "AmbientBackground1.mp3"
    },
    cave: {
        name: "Cave (scrolling, 3 screens)",
        width: 1280 * 3,
        background: ["#0d2330", "#1f5666"],
        exits: { left: "hall", right: "road" },
        props: BuildProps(1280 * 3, 22),
        music: "AmbientBackground1.mp3",
                platforms: [
            { type: PlatformTypes.DARK1, size: "small",   x: 300,  y: 500, width:317, height: 155  },     // reachable with one jump
            { type: PlatformTypes.DARK1, size: "medium1", x: 650,  y: 480, width:616, height:167 },     // reachable with a double jump
            { type: PlatformTypes.DARK1, size: "big1",    x: 1500, y: 520, width:1031, height:183 }
        ]

    },
    road: {
        name: "Long road (scrolling, 6 screens)",
        width: 1280 * 6,
        background: ["#2b1a0e", "#7a4a22"],
        music: "AmbientBackground1.mp3",
        exits: { left: "cave" },
        props: BuildProps(1280 * 6, 33),
        boss: { type: "guardian", x: 6000 }
    }
};

let CurrentRoomName = "hall";
let CurrentRoom = Rooms.hall;
let BackgroundFill = "black";

function InitRooms()
{
    CurrentRoomName = "hall";
    CurrentRoom = Rooms.hall;
}

/////////////////////////////
///
////////////////////////////

function RoomHeight()
{
    return CurrentRoom.height || DesignH;
}

/////////////////////////////
///
////////////////////////////

// (Re)paints the background colour of the current room. Also needed after a window resize.
function RefreshBackground()
{
    BackgroundFill = MakeBackground(CurrentRoom.background);
}

/////////////////////////////
///
////////////////////////////

// side: "left" or "right" = which edge of the new room the player appears at (leave out to keep the position)
function ChangeRoom(roomName, side)
{
    if (!Rooms[roomName]) roomName = "hall";

    CurrentRoomName = roomName;
    CurrentRoom = Rooms[roomName];

    RefreshBackground();
    PlacePlayerAtEdge(side);
    CloseDialogue();
    LoadRoomEntities();
    PlayRoomMusic(CurrentRoom); 
    UpdateCamera(true);

    UpdateCamera(true);                       // jump straight to the right view, don't glide in
}

/////////////////////////////
///
////////////////////////////

// Fills the room with the enemies, NPCs and boss it lists
function LoadRoomEntities()
{
    LoadEnemies(CurrentRoom);
    LoadBosses(CurrentRoom);
    LoadNpcs(CurrentRoom);
    LoadPlatforms(CurrentRoom);
}
