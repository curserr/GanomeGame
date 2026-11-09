// =====================================================================
//  collision.js  -  everything that decides where things are ALLOWED to be
//
//  - the floor
//  - the edges of the room (and the doors to the next room)
//  - rectangle overlap tests, used by enemies, bosses and NPCs
//
//  Later, platforms and walls go here too.
// =====================================================================

const OriginalY = 600;                        // ground level: the top of the player when he stands on the floor
let FloorY;                                   // the line his feet are on
const PlayerDimensions = {
    width: 224,
    height: 304
};



function InitCollision()
{
    FloorY = OriginalY + PlayerH;
}

/////////////////////////////
///
////////////////////////////

// The player's box. It is a little narrower than the picture so touching feels fair.
function PlayerRect()
{
    return { x: PlayerX + 10, y: PlayerY + 6, w: PlayerW - 20, h: PlayerH - 6 };
}

/////////////////////////////
///
////////////////////////////

function RectsOverlap(a, b)
{
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

/////////////////////////////
///
////////////////////////////

function TouchesPlayer(rect)
{
    return RectsOverlap(PlayerRect(), rect);
}

/////////////////////////////
///
////////////////////////////

// Finds the surface under the player: the floor, or the highest platform that is under his feet.
// Platforms are ONE-WAY: he can jump up through them and land on top.
// A platform only counts if his feet were above its surface at the START of the step (prevFeetY);
// that is what lets him rise through it from below, and stops him tunnelling through it when falling.
function FindGroundY(prevFeetY)
{
    let surface = FloorY;
    let left  = PlayerX + 14;                 // only his feet count, not his whole width
    let right = PlayerX + PlayerW - 14;
 
    for (let p of Platforms)
    {
        if (right < p.x || left > p.x + p.w) continue;        // not above/below this platform
        if (p.surface < prevFeetY - 0.01) continue;           // his feet are below it: he is under it
        if (p.surface < surface) surface = p.surface;         // keep the highest one under him
    }
 
    return surface - PlayerH;
}

/////////////////////////////
///
////////////////////////////
 
// Called once per game step, after the player has moved
function ResolveCollisions()
{
    // Walking off the edge of the ROOM goes to the neighbouring room
    let maxX = CurrentRoom.width - PlayerW;
    if (PlayerX > maxX && CurrentRoom.exits.right) ChangeRoom(CurrentRoom.exits.right, "left");
    else if (PlayerX < 0 && CurrentRoom.exits.left) ChangeRoom(CurrentRoom.exits.left, "right");

    // Keep the player inside the room
    PlayerX = Math.max(0, Math.min(PlayerX, CurrentRoom.width - PlayerW));
    PlayerY = Math.max(0, Math.min(PlayerY, RoomHeight() - PlayerH));

    // Recalculate which surface is underneath the player's NEW horizontal position
    GroundY = FindGroundY(PrevFeetY);

    // Land on the surface if the player has fallen through it
    if (PlayerY > GroundY)
    {
        PlayerY = GroundY;
        FallSpeed = 0;
    }

    // Update the ground state
    PlayerOnGround = (PlayerY >= GroundY - 0.01);
}
