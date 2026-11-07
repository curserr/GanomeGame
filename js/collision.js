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

function InitCollision()
{
    FloorY = OriginalY + PlayerH;
}

// The player's box. It is a little narrower than the picture so touching feels fair.
function PlayerRect()
{
    return { x: PlayerX + 10, y: PlayerY + 6, w: PlayerW - 20, h: PlayerH - 6 };
}

function RectsOverlap(a, b)
{
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function TouchesPlayer(rect)
{
    return RectsOverlap(PlayerRect(), rect);
}

// Called once per game step, after the player has moved
function ResolveCollisions()
{
    // Floor
    if (PlayerY > OriginalY) PlayerY = OriginalY;

    // Walking off the edge of the ROOM goes to the neighbouring room
    let maxX = CurrentRoom.width - PlayerW;
    if (PlayerX > maxX && CurrentRoom.exits.right) ChangeRoom(CurrentRoom.exits.right, "left");
    else if (PlayerX < 0 && CurrentRoom.exits.left) ChangeRoom(CurrentRoom.exits.left, "right");

    // Keep the player inside the room
    PlayerX = Math.max(0, Math.min(PlayerX, CurrentRoom.width - PlayerW));
    PlayerY = Math.max(0, Math.min(PlayerY, RoomHeight() - PlayerH));

    // Update the ground state after moving, so the sprite frame matches this step's position
    PlayerOnGround = (PlayerY >= OriginalY);
}
