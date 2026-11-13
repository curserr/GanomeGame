// =====================================================================
//  terrain.js  -  everything that is drawn as scenery
//
//  Back to front:  background colour -> stars -> mountains -> floor -> ruler -> props -> room edges.
//  (Characters are drawn by their own files, between the props and the room edges.)
//  Platform images will be drawn from here later.
// =====================================================================

let Stars = [];
const PlatformDimensions = {
    small:   { width: 311, height: 54 },
    medium1: { width: 516, height: 56 },
    medium2: { width: 457, height: 65 },
    big1:    { width: 732, height: 66 },
    big2:    { width: 685, height: 67 },
    large:   { width: 852, height: 66 }
};

  const PlatformTypes = 
  {
    STONE: "stone",
    WOOD: "wood",
    CORRUPTED: "corrupted",
    DARK1:"Dark1",
    GARDEN:"Green1"
  };



const SheetImgDarkPlatforms = new Image();
SheetImgDarkPlatforms.src = "DarkPlatforms.png";

const SheetImgGarden = new Image();
SheetImgGarden = "GardenPlatforms.png";

// Where each piece sits inside the platform sprite sheet (2 columns x 3 rows, every cell 1272 x 224).
// col/row = which cell, x/y = where the piece starts inside that cell. The piece sizes are in PlatformDimensions.
const PlatformSheets = {};
PlatformSheets[PlatformTypes.DARK1] = {      // or whichever type name you want for these
    image: SheetImgDarkPlatforms,            // new Image() with src "FlatPlatforms.png"
    cellW: 880,
    cellH: 92,
    pieces: 
    {
    small:   { col: 0, row: 0, x: 284, y: 19 },
    medium1: { col: 1, row: 0, x: 182, y: 18 },
    medium2: { col: 0, row: 1, x: 211, y: 13 },
    big1:    { col: 1, row: 1, x: 74,  y: 13 },
    big2:    { col: 0, row: 2, x: 97,  y: 12 },
    large:   { col: 1, row: 2, x: 14,  y: 13 }
    }
}

PlatformSheets[PlatformTypes.GRASS] = {
    image: SheetImgGrass, cellW: 1074, cellH: 150,
    inset: 16,
    pieces: {
        small:   { col: 0, row: 0, x: 337, y: 31, w: 399,  h: 88 },
        medium1: { col: 1, row: 0, x: 224, y: 24, w: 626,  h: 102 },
        medium2: { col: 0, row: 1, x: 240, y: 18, w: 593,  h: 113 },
        big1:    { col: 1, row: 1, x: 82,  y: 20, w: 910,  h: 109 },
        big2:    { col: 0, row: 2, x: 106, y: 12, w: 862,  h: 126 },
        large:   { col: 1, row: 2, x: 12,  y: 15, w: 1049, h: 120 }
    }
};


const PlatformSurfaceInset = 6;               // units from the top of the picture to the surface the feet stand on
 
let Platforms = [];   


function InitTerrain()
{
    let r = Rand(7);
    Stars = [];
    for (let i = 0; i < 160; i++) Stars.push({ u: r(), v: r(), size: 1.5 + r() * 2.5 });
}

/////////////////////////////
///
////////////////////////////

function LoadPlatforms(room)
{
    Platforms = [];
 
    for (let spec of (room.platforms || []))
    {
        let sheet = PlatformSheets[spec.type];
        let size  = spec.size || "medium1";
        let piece = sheet && sheet.pieces[size];
        let dim   = PlatformDimensions[size];
 
        if (!piece || !dim) { console.warn("Unknown platform:", spec); continue; }
 
        let scale = spec.scale || 1;
        Platforms.push({
            image: sheet.image,
            sx: piece.col * sheet.cellW + piece.x,       // the piece's rectangle inside the sheet
            sy: piece.row * sheet.cellH + piece.y,
            sw: dim.width,
            sh: dim.height,
            x: spec.x,
            y: spec.y,
            width: dim.width * scale,
            height: dim.height * scale,
            surface: spec.y + PlatformSurfaceInset * scale      // the line the player's feet rest on
        });
    }
}

/////////////////////////////
///
////////////////////////////

// Screen space + the slow far layers. The background fills the whole window and never moves.
function DrawBackground()
{
    UseScreenSpace();
    ctx.fillStyle = BackgroundFill;
    ctx.fillRect(0, 0, WindowWidth, WindowHeight);

    DrawStars();
    DrawMountains();
}

/////////////////////////////
///
////////////////////////////

// The world itself, shifted by the camera
function DrawTerrain()
{
    UseWorldSpace(1);
    DrawFloor();
    DrawPlatforms();
    DrawRuler();
    DrawProps();
}

/////////////////////////////
///
////////////////////////////

// Far layer: stars. They barely move with the camera, so they look very far away.
function DrawStars()
{
    UseWorldSpace(0.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    let span = CurrentRoom.width * 0.2 + ViewW * 2;
    for (let s of Stars) ctx.fillRect(s.u * span - ViewW, s.v * (FloorY - 40), s.size, s.size);
}

/////////////////////////////
///
////////////////////////////

// Middle layer: dark mountains. They move at half speed.
function DrawMountains()
{
    UseWorldSpace(0.5);
    ctx.fillStyle = "rgba(8, 4, 20, 0.55)";

    let left = CameraX * 0.5;
    let first = Math.floor((left - 340) / 260);
    let last  = Math.ceil((left + ViewW) / 260);

    for (let i = first; i <= last; i++)
    {
        let x = i * 260;
        let h = 120 + (((i * 73) % 140) + 140) % 140;
        ctx.beginPath();
        ctx.moveTo(x, FloorY);
        ctx.lineTo(x + 160, FloorY - h);
        ctx.lineTo(x + 320, FloorY);
        ctx.closePath();
        ctx.fill();
    }
}

/////////////////////////////
///
////////////////////////////

// The floor, drawn across everything that is visible
function DrawFloor()
{
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(CameraX - 100, FloorY, ViewW + 200, DesignH * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(CameraX - 100, FloorY, ViewW + 200, 3);
}

/////////////////////////////
///
////////////////////////////

function DrawPlatforms()
{
    for (let platform of Platforms)
    {
        if (platform.x + platform.width < CameraX - 50 || platform.x > CameraX + ViewW + 50) continue;     // off screen: skip
        if (!platform.image.complete || platform.image.naturalWidth === 0) continue;              // picture not loaded yet
 
        ctx.drawImage(platform.image, platform.sx, platform.sy, platform.sw, platform.sh, platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "red";
        ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 2);
    }
}

/////////////////////////////
///
////////////////////////////

// A faint ruler: a line every 250 units with its world position written on it
function DrawRuler()
{
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    let first = Math.floor(CameraX / 250) * 250;
    for (let x = first; x <= CameraX + ViewW; x += 250)
    {
        if (x < 0 || x > CurrentRoom.width) continue;
        let screenStart = (x % 1280 === 0);
        ctx.fillStyle = screenStart ? "rgba(201, 161, 91, 0.5)" : "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x, 0, screenStart ? 2 : 1, FloorY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.fillText(String(x), x + 4, 120);          // low enough not to sit under the debug text
    }
}

/////////////////////////////
///
////////////////////////////

// The reference objects of the current room (emojis, pillars). Replace with real scenery later.
function DrawProps()
{
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    for (let p of CurrentRoom.props)
    {
        if (p.x < CameraX - 150 || p.x > CameraX + ViewW + 150) continue;     // off screen: skip

        if (p.box)
        {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, FloorY - p.h, p.w, p.h);
            ctx.fillStyle = "black";
            ctx.font = "bold 22px monospace";
            ctx.fillText(p.label, p.x + p.w / 2, FloorY - p.h + 30);
        }
        else
        {
            ctx.font = p.s + "px serif";
            ctx.fillStyle = "white";
            ctx.fillText(p.e, p.x, FloorY - (p.up || 0));
        }
    }
}

/////////////////////////////
///
////////////////////////////

// Everything beyond the room's edges is darkened, so you can see where the room ends.
// Drawn last, on top of the characters.
function DrawRoomEdges()
{
    UseWorldSpace(1);
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

    let leftEdge  = CameraX - 200;                // the part of the view to the left of the room
    let rightEdge = CameraX + ViewW + 200;        // and to the right of it
    if (leftEdge < 0) ctx.fillRect(leftEdge, -1000, -leftEdge, 3000);
    if (rightEdge > CurrentRoom.width) ctx.fillRect(CurrentRoom.width, -1000, rightEdge - CurrentRoom.width, 3000);

    // red edge lines
    ctx.fillStyle = "#ff4d4d";
    ctx.fillRect(-4, 0, 4, FloorY);
    ctx.fillRect(CurrentRoom.width, 0, 4, FloorY);
}
