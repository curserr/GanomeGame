// =====================================================================
//  camera.js  -  the camera
//
//  The camera is just two numbers: how far the view has moved from the room's top-left corner.
//  A fixed room is simply a room that is not wider than the screen, so the camera has nowhere to go.
// =====================================================================

let CameraX = 0;                              // the left edge of the view, in room units
let CameraY = 0;                              // the top edge of the view
const CameraSmooth = 0.12;                    // 1 = stiff, smaller = softer follow

function InitCamera()
{
    CameraX = 0;
    CameraY = 0;
}

/////////////////////////////
///
////////////////////////////

// Where the camera wants to be: the player in the middle, but never showing beyond the room
function CameraTarget()
{
    let rw = CurrentRoom.width;
    let rh = RoomHeight();

    let tx = PlayerX + PlayerWidth / 2 - ViewW / 2;
    let ty = PlayerY + PlayerHeight / 2 - DesignH / 2;

    if (rw <= ViewW) tx = (rw - ViewW) / 2;               // room fits on screen: centre it
    else tx = Math.max(0, Math.min(tx, rw - ViewW));      // otherwise stay inside the room

    if (rh <= DesignH) ty = 0;
    else ty = Math.max(0, Math.min(ty, rh - DesignH));

    return { x: tx, y: ty };
}

/////////////////////////////
///
////////////////////////////

// snap = true: jump straight to the target (new room, load, resize). false: glide towards it.
function UpdateCamera(snap)
{
    let t = CameraTarget();

    if (snap)
    {
        CameraX = t.x;
        CameraY = t.y;
    }
    else
    {
        CameraX += (t.x - CameraX) * CameraSmooth;
        CameraY += (t.y - CameraY) * CameraSmooth;
    }
}
