// =====================================================================
//  npcs.js  -  friendly characters you can talk to
//
//  Each kind of NPC is described once in NpcTypes. `dialogue` is the id of a conversation in dialogue.js.
//  A room lists them with  npcs: [{ type: "wizard", x: 900 }].
//  Stand next to one and press E to talk.
// =====================================================================

const NpcTypes = {
    wizard: {
        emoji: "🧙",
        size: 70,
        name: "Old Wizard",
        dialogue: "wizardHello"
    }
};

const TalkDistance = 90;                      // how close (in units) the player must be to talk

let Npcs = [];                                // the NPCs in the current room
let NearNpc = null;                           // the NPC the player could talk to right now (or null)

function InitNpcs()
{
    Npcs = [];
    NearNpc = null;
}

function SpawnNpc(typeName, x)
{
    let def = NpcTypes[typeName];
    if (!def) return;

    Npcs.push({ type: typeName, def: def, x: x });
}

function LoadNpcs(room)
{
    Npcs = [];
    NearNpc = null;
    for (let spawn of (room.npcs || [])) SpawnNpc(spawn.type, spawn.x);
}

function UpdateNpcs()
{
    // Find the closest NPC within talking distance (only while standing on the ground)
    NearNpc = null;
    let best = TalkDistance;
    let playerCentre = PlayerX + PlayerW / 2;

    if (PlayerOnGround)
    {
        for (let n of Npcs)
        {
            let d = Math.abs(n.x - playerCentre);
            if (d < best) { best = d; NearNpc = n; }
        }
    }

    // E starts the conversation
    if (InteractRequested && NearNpc) StartDialogue(NearNpc.def.dialogue);
    InteractRequested = false;
}

function DrawNpcs()
{
    if (Npcs.length === 0) return;

    UseWorldSpace(1);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    for (let n of Npcs)
    {
        if (n.x < CameraX - 150 || n.x > CameraX + ViewW + 150) continue;     // off screen: skip

        ctx.font = n.def.size + "px serif";
        ctx.fillStyle = "white";
        ctx.fillText(n.def.emoji, n.x, FloorY);

        // a little "E" bubble above the NPC you can talk to
        if (n === NearNpc)
        {
            let y = FloorY - n.def.size - 26;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(n.x, y, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = "bold 20px monospace";
            ctx.fillText("E", n.x, y + 7);
        }
    }
}
