// =====================================================================
//  terrain.js  -  everything that is drawn as scenery
//
//  Back to front:  background colour -> stars -> mountains -> floor -> ruler -> props -> room edges.
//  (Characters are drawn by their own files, between the props and the room edges.)
//  Platform images will be drawn from here later.
// =====================================================================

let Stars = [];

function InitTerrain()
{
    let r = Rand(7);
    Stars = [];
    for (let i = 0; i < 160; i++) Stars.push({ u: r(), v: r(), size: 1.5 + r() * 2.5 });
}

// Screen space + the slow far layers. The background fills the whole window and never moves.
function DrawBackground()
{
    UseScreenSpace();
    ctx.fillStyle = BackgroundFill;
    ctx.fillRect(0, 0, WindowWidth, WindowHeight);

    DrawStars();
    DrawMountains();
}

// The world itself, shifted by the camera
function DrawTerrain()
{
    UseWorldSpace(1);
    DrawFloor();
    DrawRuler();
    DrawProps();
}

// Far layer: stars. They barely move with the camera, so they look very far away.
function DrawStars()
{
    UseWorldSpace(0.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    let span = CurrentRoom.width * 0.2 + ViewW * 2;
    for (let s of Stars) ctx.fillRect(s.u * span - ViewW, s.v * (FloorY - 40), s.size, s.size);
}

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

// The floor, drawn across everything that is visible
function DrawFloor()
{
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(CameraX - 100, FloorY, ViewW + 200, DesignH * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(CameraX - 100, FloorY, ViewW + 200, 3);
}

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
