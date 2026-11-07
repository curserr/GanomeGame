// =====================================================================
//  dialogue.js  -  all conversations, and the dialogue box (HTML, in the #ui layer)
//
//  A conversation is a set of nodes. Each node is one screen of text:
//     name     who is speaking
//     text     what they say
//     next     the id of the node that follows (leave out to end the conversation)
//     choices  instead of `next`: a list of answers { text, next, set }
//              `set` stores flags in the save, e.g. set: { likesCave: true }
//
//  Controls: Space / Enter = continue or pick. Up / Down = move between answers. Mouse click also works.
// =====================================================================

const DialogueSets = {
    wizardHello: {
        start: "hi",
        nodes: {
            hi:   { name: "Old Wizard", text: "Ah, a gnome! You walked all the way across the hall.", next: "ask" },
            ask:  { name: "Old Wizard", text: "Tell me, do you like the cave to the right?",
                    choices: [
                        { text: "Yes, it is lovely.",  next: "yes",  set: { likesCave: true } },
                        { text: "It looks a bit dark.", next: "dark", set: { likesCave: false } }
                    ] },
            yes:  { name: "Old Wizard", text: "Splendid! The snails there are quite friendly. Mostly.", next: "bye" },
            dark: { name: "Old Wizard", text: "Dark, yes. Mind the snails. They bump.", next: "bye" },
            bye:  { name: "Old Wizard", text: "Safe travels, little gnome." }
        }
    }
};

let DialogueBox, DialogueNameBox, DialogueTextBox, DialogueChoicesBox;

let ActiveDialogue = null;                    // the conversation that is open (or null)
let ActiveNode = null;                        // the node being shown
let ChoiceSelected = 0;

function InitDialogue()
{
    DialogueBox        = document.getElementById("Dialogue");
    DialogueNameBox    = document.getElementById("DialogueName");
    DialogueTextBox    = document.getElementById("DialogueText");
    DialogueChoicesBox = document.getElementById("DialogueChoices");

    document.addEventListener("keydown", function(event) {
        if (!IsDialogueOpen() || IsPaused()) return;

        if (ActiveNode.choices)
        {
            if (event.key === "ArrowDown") MoveChoice(1);
            if (event.key === "ArrowUp")   MoveChoice(-1);
        }

        if ((event.key === " " || event.key === "Enter") && !event.repeat) AdvanceDialogue();
    });
}

function IsDialogueOpen()
{
    return ActiveDialogue !== null;
}

function StartDialogue(id)
{
    let set = DialogueSets[id];
    if (!set) return;

    ActiveDialogue = set;
    DialogueBox.style.display = "block";
    ShowNode(set.start);
}

function ShowNode(nodeId)
{
    ActiveNode = ActiveDialogue.nodes[nodeId];
    if (!ActiveNode) { CloseDialogue(); return; }

    DialogueNameBox.textContent = ActiveNode.name || "";
    DialogueTextBox.textContent = ActiveNode.text || "";

    // answers (if any) become buttons
    DialogueChoicesBox.innerHTML = "";
    ChoiceSelected = 0;

    if (ActiveNode.choices)
    {
        ActiveNode.choices.forEach(function(choice, index) {
            let button = document.createElement("button");
            button.textContent = choice.text;
            button.addEventListener("click", function() { ChooseAnswer(index); this.blur(); });
            button.addEventListener("mouseenter", function() { ChoiceSelected = index; RefreshChoices(); });
            DialogueChoicesBox.appendChild(button);
        });
        RefreshChoices();
    }

    document.getElementById("DialogueHint").textContent =
        ActiveNode.choices ? "Up / Down choose, Space to answer" : "Space to continue";
}

function RefreshChoices()
{
    let buttons = DialogueChoicesBox.children;
    for (let i = 0; i < buttons.length; i++) buttons[i].classList.toggle("selected", i === ChoiceSelected);
}

function MoveChoice(step)
{
    let count = ActiveNode.choices.length;
    ChoiceSelected = (ChoiceSelected + step + count) % count;
    RefreshChoices();
}

function ChooseAnswer(index)
{
    let choice = ActiveNode.choices[index];
    if (choice.set) Object.assign(Save.flags, choice.set);

    if (choice.next) ShowNode(choice.next);
    else CloseDialogue();
}

function AdvanceDialogue()
{
    if (ActiveNode.choices) ChooseAnswer(ChoiceSelected);
    else if (ActiveNode.next) ShowNode(ActiveNode.next);
    else CloseDialogue();
}

function CloseDialogue()
{
    ActiveDialogue = null;
    ActiveNode = null;
    if (DialogueBox) DialogueBox.style.display = "none";
}

// One game step while a dialogue is open (the rest of the game is frozen)
function UpdateDialogue()
{
    JumpRequested = false;
    InteractRequested = false;
    FreezePlayer();
}
