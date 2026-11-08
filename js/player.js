// =====================================================================
//  player.js  -  the player: movement, jumping, sprite animation, drawing
//
//  All positions are in world units, measured from the left edge of the CURRENT ROOM.
//  Per game step the order is (see main.js):
//     UpdatePlayer()  ->  ResolveCollisions() [collision.js]  ->  AnimatePlayer()
// =====================================================================

// ---------- Sprite sheet ----------
const SheetCols = 5;
const SheetRows = 3;
const FrameW = 224;                       // one frame of the sheet, in sheet pixels
const FrameH = 304;

const PlayerW = 64;                       // size of the player in units
const PlayerH = PlayerW * FrameH / FrameW;

// Frame numbers count left to right, top to bottom (0 to 14)
//   row 1: 0  1  2  3  4
//   row 2: 5  6  7  8  9
//   row 3: 10 11 12 13 14
const IdleFrame    = 0;                   // standing still
const WalkFrames   = [1, 2, 3, 4, 5];     // walk cycle
const CrouchFrame  = 6;                   // right before leaving the ground
const RiseFrames   = [7, 8];              // going up (first half, second half)
const FallFrames   = [11, 12, 13, 14];    // the tumble poses
const SpinStart    = 0.6;                 // fraction of the drop spent stepping through the poses once;
                                          // after that they loop until landing

const AnimDelay = 6;          // game steps per animation frame (bigger = slower)
const CrouchLength = 5;       // game steps spent crouching before a ground jump

let SheetImg = null;

// ---------- State ----------
let PlayerX = 200;                        // position inside the CURRENT ROOM, from its left edge
let PlayerY = 0;                          // set in InitPlayer (needs OriginalY from collision.js)
let StartY = 0;                           // where the current jump began
let FallStartY = 0;                       // where the fall began (the top of the jump)

const WalkSpeed = 2;                      // units per game step
const JumpSpeed = 3;
const JumpHeight = 120;
let FallSpeed = 0;
const GravConstant = 10;

let PlayerJump = false;      // true while rising
let PlayerOnGround = true;
let JumpsUsed = 0;
const MaxJumps = 2;          // 2 = double jump
let PlayerMove = false;      // true while an arrow key is moving the character
let LeftPlayer = false;      // true = facing left

let AnimTimer = 0;
let AnimIndex = 0;
let CrouchTimer = 0;          // counts down while crouching
let Spinning = false;         // true once the fall has reached the looping spin
let StateName = "idle";       // only used by the debug text
let CurrentFrame = 0;         // the sprite frame that gets drawn

let HurtTimer = 0;            // steps of "can't be hurt again" after a hit
let HitsTaken = 0;

function InitPlayer()
{
    SheetImg = new Image();
    SheetImg.src = "gnome_sheet_v2.png";

    PlayerX = 200;
    PlayerY = OriginalY;
    StartY = PlayerY;
}

// ---------- Moving ----------
function UpdatePlayer()
{
    // Ground check
    PlayerOnGround = (PlayerY >= OriginalY);
    if (PlayerOnGround && !PlayerJump) JumpsUsed = 0;

    if (HurtTimer > 0) HurtTimer--;

    // Horizontal movement and facing direction
    PlayerMove = false;

    if (keys["arrowleft"])
    {
        LeftPlayer = true;
        PlayerMove = true;
        PlayerX -= WalkSpeed;
    }

    if (keys["arrowright"])
    {
        LeftPlayer = false;
        PlayerMove = true;
        PlayerX += WalkSpeed;
    }

    // Jumping: crouch first when on the ground, jump straight away in the air
    if (CrouchTimer > 0)
    {
        CrouchTimer--;
        if (CrouchTimer === 0) StartJump();
    }
    else if (JumpRequested && JumpsUsed < MaxJumps)
    {
        if (PlayerOnGround) CrouchTimer = CrouchLength;
        else StartJump();
    }
    JumpRequested = false;

    // Rising or falling
    if (PlayerJump)
    {
        Jump();
    }
    else if (PlayerY < OriginalY)
    {
        Gravity();
    }
}

/////////////////////////////
///
////////////////////////////

function StartJump()
{
    PlayerJump = true;
    JumpsUsed++;
    StartY = PlayerY;
    AnimIndex = 0;       // so the fall tumble starts from its first frame
    AnimTimer = 0;
    FallSpeed = 0;
}

/////////////////////////////
///
////////////////////////////

function Jump()
{
    if (StartY - PlayerY < JumpHeight)
    {
        PlayerY -= JumpSpeed;
    }
    else
    {
        PlayerJump = false;
        FallStartY = PlayerY;
    }
}

/////////////////////////////
///
////////////////////////////

function Gravity()
{
    FallSpeed += GravConstant;
    PlayerY += FallSpeed;
}

/////////////////////////////
///
////////////////////////////

// ---------- Hooks used by other files ----------

// Puts the player at an edge of the room he just entered ("left" or "right"). Anything else: keep the position.
function PlacePlayerAtEdge(side)
{
    if (side === "left")  PlayerX = 0;
    if (side === "right") PlayerX = CurrentRoom.width - PlayerW;
}

/////////////////////////////
///
////////////////////////////

// Stops every jump / animation state (used when loading a save)
function ResetPlayerMotion()
{
    PlayerY = OriginalY;                      // always put him back on the ground
    PlayerJump = false;
    JumpsUsed = 0;
    CrouchTimer = 0;
    JumpRequested = false;
    InteractRequested = false;
    Spinning = false;
    HurtTimer = 0;
    FallSpeed = 0;
}

// An enemy or boss touched the player: knock him away from it. sourceX is the enemy's centre.
function HurtPlayer(sourceX)
{
    if (HurtTimer > 0) return;

    HurtTimer = 60;
    HitsTaken++;

    let away = (PlayerX + PlayerW / 2 < sourceX) ? -1 : 1;
    PlayerX += away * 80;
    PlayerX = Math.max(0, Math.min(PlayerX, CurrentRoom.width - PlayerW));
}

// While a dialogue is open the player just stands there
function FreezePlayer()
{
    PlayerMove = false;
    AnimatePlayer();
}

// ---------- Animation ----------

// Steps through a list of frames at the animation speed and returns the current one
function Animate(list)
{
    AnimTimer++;
    if (AnimTimer >= AnimDelay)
    {
        AnimTimer = 0;
        AnimIndex = (AnimIndex + 1) % list.length;
    }
    return list[AnimIndex % list.length];
}

// Picks the sprite frame for this step (DrawPlayer() uses it)
function AnimatePlayer()
{
    CurrentFrame = ChooseFrame();
}

function ChooseFrame()
{
    // 1. Crouching just before a jump
    if (CrouchTimer > 0) { StateName = "crouch"; return CrouchFrame; }

    // 2. In the air
    if (!PlayerOnGround)
    {
        if (PlayerJump)
        {
            // Going up: first half of the rise uses one frame, second half the other
            StateName = "rising";
            let risen = StartY - PlayerY;
            return (risen < JumpHeight / 2) ? RiseFrames[0] : RiseFrames[1];
        }

        // Coming down. Progress is how far down he has dropped (0 at the top, 1 at the ground).
        let total = OriginalY - FallStartY;
        let progress = (total > 0) ? (PlayerY - FallStartY) / total : 1;

        // First part: step through all the tumble poses once, ending on the last one
        if (progress < SpinStart)
        {
            StateName = "tumble steps";
            Spinning = false;
            let index = Math.floor(progress / SpinStart * FallFrames.length);
            return FallFrames[Math.min(index, FallFrames.length - 1)];
        }

        // Rest of the drop: keep cycling through the poses, continuing from the last one
        if (!Spinning)
        {
            Spinning = true;
            AnimIndex = FallFrames.length - 1;
            AnimTimer = 0;
        }
        StateName = "spinning";
        return Animate(FallFrames);
    }

    // 3. On the ground
    if (PlayerMove) { StateName = "walking"; return Animate(WalkFrames); }

    StateName = "idle";
    AnimIndex = 0;
    AnimTimer = 0;
    return IdleFrame;
}

// ---------- Drawing ----------
function DrawPlayer()
{
    if (!SheetImg.complete || SheetImg.naturalWidth === 0) return;     // sheet not loaded yet

    UseWorldSpace(1);

    let col = CurrentFrame % SheetCols;
    let row = Math.floor(CurrentFrame / SheetCols);

    ctx.save();

    // Blink while recovering from a hit
    if (HurtTimer > 0 && Math.floor(HurtTimer / 5) % 2 === 0) ctx.globalAlpha = 0.4;

    if (LeftPlayer)
    {
        ctx.translate(PlayerX + PlayerW, PlayerY);
        ctx.scale(-1, 1);                    // mirror to face left
    }
    else
    {
        ctx.translate(PlayerX, PlayerY);
    }
    ctx.drawImage(SheetImg, col * FrameW, row * FrameH, FrameW, FrameH, 0, 0, PlayerW, PlayerH);
    ctx.restore();
}
