// =====================================================================
//  loop.js  -  the game loop
//
//  The game logic always runs in steps of 1/60 second, however fast the screen refreshes,
//  so the game feels the same on a 60 Hz and a 144 Hz screen.
//  This file knows nothing about the game: it is given three functions to call.
// =====================================================================

const StepMs = 1000 / 60;
let LastTime = 0;
let Leftover = 0;

function StartLoop(update, draw, updateUI)
{
    LastTime = performance.now();
    Leftover = 0;

    function Frame(now)
    {
        Leftover += Math.min(now - LastTime, 250);      // the cap stops a huge catch-up after the tab was hidden
        LastTime = now;

        while (Leftover >= StepMs)
        {
            update();
            Leftover -= StepMs;
        }

        draw();
        updateUI();
        requestAnimationFrame(Frame);
    }

    requestAnimationFrame(Frame);
}
