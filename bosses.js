// =====================================================================
//  bosses.js  -  bosses
//
//  Same idea as enemies.js: describe each boss once in BossTypes, then a room says
//     boss: { type: "guardian", x: 6000 }
//  A boss that has been defeated is remembered in Save.bossesDefeated and does not come back.
//
//  There is no player attack yet, so nothing damages a boss. When you add one, call
//  DamageBoss(boss, amount). When hp reaches 0 the boss is defeated and the game remembers it.
// =====================================================================

const BossTypes = {
    guardian: {
        emoji: "🗿",
        size: 170,
        hp: 10,
        speed: 0.8,
        update: function(b) {
            // walks slowly towards the player
            let target = PlayerX + PlayerW / 2;
            if (Math.abs(target - b.x) > 4) b.x += (target > b.x ? 1 : -1) * b.def.speed;
        }
    }
};

let Bosses = [];                              // the bosses alive in the current room

function InitBosses()
{
    Bosses = [];
}

function SpawnBoss(typeName, x)
{
    let def = BossTypes[typeName];
    if (!def) return;

    Bosses.push({ type: typeName, def: def, x: x, hp: def.hp, w: def.size * 0.7, h: def.size });
}

function LoadBosses(room)
{
    Bosses = [];
    if (room.boss && !Save.bossesDefeated.includes(room.boss.type)) SpawnBoss(room.boss.type, room.boss.x);
}

function DamageBoss(boss, amount)
{
    boss.hp -= amount;
    if (boss.hp <= 0) DefeatBoss(boss);
}

function DefeatBoss(boss)
{
    if (!Save.bossesDefeated.includes(boss.type)) Save.bossesDefeated.push(boss.type);
    Bosses = Bosses.filter(function(b) { return b !== boss; });
}

function BossRect(b)
{
    return { x: b.x - b.w / 2, y: FloorY - b.h, w: b.w, h: b.h };
}

function UpdateBosses()
{
    for (let b of Bosses)
    {
        b.def.update(b);
        if (TouchesPlayer(BossRect(b))) HurtPlayer(b.x);
    }
}

function DrawBosses()
{
    if (Bosses.length === 0) return;

    UseWorldSpace(1);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    for (let b of Bosses)
    {
        ctx.font = b.def.size + "px serif";
        ctx.fillStyle = "white";
        ctx.fillText(b.def.emoji, b.x, FloorY);

        // health bar above the boss
        let barW = 140;
        let top = FloorY - b.h - 22;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(b.x - barW / 2, top, barW, 10);
        ctx.fillStyle = "#e04a4a";
        ctx.fillRect(b.x - barW / 2, top, barW * Math.max(0, b.hp) / b.def.hp, 10);
    }
}
