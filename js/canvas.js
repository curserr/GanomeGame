// =====================================================================
//  canvas.js  -  the canvas, its size, and the two "drawing spaces"
//
//  The world is measured in design units: the screen is always DesignH units tall.
//  Scale turns units into real pixels. A wider window just shows more units sideways.
// =====================================================================

const DesignH = 720;

let canvas, ctx;
let WindowWidth, WindowHeight, dpr, Scale;
let ViewW;                                // how many units wide the screen currently shows

function InitCanvas()
{
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    SizeCanvas();
    window.addEventListener("resize", HandleResize);
}

function SizeCanvas()
{
    WindowWidth  = window.innerWidth;
    WindowHeight = window.innerHeight;
    dpr   = window.devicePixelRatio || 1;
    Scale = WindowHeight / DesignH;
    ViewW = WindowWidth / Scale;

    canvas.width  = Math.round(WindowWidth * dpr);
    canvas.height = Math.round(WindowHeight * dpr);
    canvas.style.width  = WindowWidth + "px";
    canvas.style.height = WindowHeight + "px";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
}

// When the window changes size, only the canvas, the background gradient and the camera need updating.
// Every position in the game is in units, so nothing else has to move.
function HandleResize()
{
    SizeCanvas();
    RefreshBackground();
    UpdateCamera(true);
}

// Drawing in screen pixels (backgrounds that fill the window)
function UseScreenSpace()
{
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Drawing in world units. f is the parallax factor: 1 = moves with the world,
// smaller = moves slower, so it looks further away.
function UseWorldSpace(f)
{
    let s = dpr * Scale;
    ctx.setTransform(s, 0, 0, s, Math.round(-CameraX * f * s), Math.round(-CameraY * f * s));
}

// The background is painted in screen space, so a gradient depends on the window height
function MakeBackground(colors)
{
    if (typeof colors === "string") return colors;
    if (colors.length === 1) return colors[0];

    let gradient = ctx.createLinearGradient(0, 0, 0, WindowHeight);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}
