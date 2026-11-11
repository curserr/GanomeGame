// =====================================================================
//  collision.js  -  everything that decides where things are ALLOWED to be
//
//  - the floor
//  - the edges of the room (and the doors to the next room)
//  - rectangle overlap tests, used by enemies, bosses and NPCs
//
//  Later, platforms and walls go here too.
// =====================================================================

let FloorY;                                   // the line his feet are on
const PlayerDimensions = {
    width: 224,
    height: 304
};



function InitCollision()
{
    FloorY = StartY + PlayerHeight;
}

/////////////////////////////
///
////////////////////////////

// The player's box. It is a little narrower than the picture so touching feels fair.
function PlayerRect()
{
    return { x: PlayerX + 10, y: PlayerY + 6, w: PlayerWidth - 20, h: PlayerHeight - 6 };
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
function CheckPlatformCollision()
{
    let left  = PlayerX + 14;                 // only his feet count, not his whole width
    let right = PlayerX + PlayerWidth - 14;

    for (let platform of Platforms)
    {
        // if the player is not on a platform 
        if (right < platform.x || left > platform.x + platform.width)
        {
            LandingY = StartY;
            continue;        // not above/below this platform
        } 

        // if the player is below the platform, he bumps his head
        if (PlayerJump && PlayerY <= platform.surface + platform.height && PreviousPlayerY > platform.surface + platform.height)
        {
            PlayerY = platform.y + platform.height;
            FallStartY = PlayerY;
            PlayerJump = false;
        }

        // if the player is above, he lands on the platform
        if(PlayerY + PlayerHeight < platform.surface)
        {
            LandingY = platform.surface - PlayerHeight;
        }
    }
}

/////////////////////////////
///
////////////////////////////
 
// Called once per game step, after the player has moved
function ResolveCollisions()
{
    // Walking off the edge of the ROOM goes to the neighbouring room
    let maxX = CurrentRoom.width - PlayerWidth;
    if (PlayerX > maxX && CurrentRoom.exits.right) ChangeRoom(CurrentRoom.exits.right, "left");
    else if (PlayerX < 0 && CurrentRoom.exits.left) ChangeRoom(CurrentRoom.exits.left, "right");

    // Keep the player inside the room
    PlayerX = Math.max(0, Math.min(PlayerX, CurrentRoom.width - PlayerWidth));
    PlayerY = Math.max(0, Math.min(PlayerY, RoomHeight() - PlayerHeight));

    // Land on the surface if the player has fallen through it
    if (PlayerY > LandingY)
    {
        PlayerY = LandingY;
    }
    
    // Update the ground state
    PlayerOnGround = (PlayerY >= LandingY - 0.01);
}
