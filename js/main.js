// =====================================================================
//  main.js  -  the conductor. It does no work itself: it only CALLS the other files.
//  It must be the LAST script loaded in camera_demo.html.
// =====================================================================

// Runs once when the page has loaded: set every system up, in this order
function Start()
{
    InitCanvas();
    InitInput();
    InitPlayer();
    InitCollision();
    InitCamera();
    InitTerrain();
    InitRooms();
    InitEnemies();
    InitBosses();
    InitNpcs();
    InitDialogue();
    InitSave();
    InitSave();
    InitAudio();      // <-- new
    InitUI();

    ChangeRoom("hall");
    StartLoop(UpdateGame, DrawGame, UpdateUI);
}

/////////////////////////////
///
////////////////////////////

// One game step (60 per second)
function UpdateGame()
{
    if (IsPaused()) return;                   // the game freezes while the menu is open

    if (IsDialogueOpen())                     // ...and while someone is talking
    {
        UpdateDialogue();
        return;
    }

    UpdatePlayer();
    CheckPlatformCollision();
    ResolveCollisions();
    AnimatePlayer();
    UpdateNpcs();
    UpdateEnemies();
    UpdateBosses();
    UpdateCamera(false);
}

/////////////////////////////
///
////////////////////////////

// One picture, drawn back to front
function DrawGame()
{
    DrawBackground();
    DrawTerrain();
    DrawNpcs();
    DrawEnemies();
    DrawBosses();
    DrawPlayer();
    DrawRoomEdges();
    UseScreenSpace();
}

Start();
