// =====================================================================
//  enemies.js  -  normal enemies
//
//  Each KIND of enemy is described ONCE in EnemyTypes (its picture, size and behaviour).
//  A room then just lists  { type: "snail", x: 1000 }  and gets one, however many times you spawn it.
//
//  To add a new kind: add an entry to EnemyTypes, then list it in a room's `enemies`.
// =====================================================================

const EnemyTypes = {
    // A harmless-looking snail that patrols back and forth around where it was spawned.
    snail: {
        emoji: "🐌",
        size: 48,
        speed: 1,
        range: 180,                           // how far it walks from its start before turning
        update: function(e) {
            e.x += e.dir * e.def.speed;
            if (Math.abs(e.x - e.startX) > e.def.range) e.dir = -e.dir;
        }
    }
};

let Enemies = [];                             // the enemies alive in the current room

function InitEnemies()
{
    Enemies = [];
}

function SpawnEnemy(typeName, x)
{
    let def = EnemyTypes[typeName];
    if (!def) return;

    Enemies.push({ type: typeName, def: def, x: x, startX: x, dir: 1, w: def.size, h: def.size });
}

// Called by the room loader: replaces the enemies with the ones this room lists
function LoadEnemies(room)
{
    Enemies = [];
    for (let spawn of (room.enemies || [])) SpawnEnemy(spawn.type, spawn.x);
}

function EnemyRect(e)
{
    return { x: e.x - e.w / 2, y: FloorY - e.h, w: e.w, h: e.h };
}

function UpdateEnemies()
{
    for (let e of Enemies)
    {
        e.def.update(e);
        if (TouchesPlayer(EnemyRect(e))) HurtPlayer(e.x);
    }
}

function DrawEnemies()
{
    if (Enemies.length === 0) return;

    UseWorldSpace(1);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    for (let e of Enemies)
    {
        if (e.x < CameraX - 150 || e.x > CameraX + ViewW + 150) continue;     // off screen: skip
        ctx.font = e.def.size + "px serif";
        ctx.fillStyle = "white";
        ctx.fillText(e.def.emoji, e.x, FloorY);
    }
}
