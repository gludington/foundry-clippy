/**
 * @typedef {import('../types.js').Workflow} Workflow
 * @typedef {import('../types.js').Workflow} WorkflowGroup
 */


/**
 * @type {Workflow[]}
 */
export const workflows = [
    {
        name: "Roll Initiative",
        id: "roll-initiative",
        steps: [{
            say: `<p>A Call to Battle!  The first thing we want to do is enter ourselves in the <b>Combat Tracker</b></p>
    <p>In the top of the right column (above my words), you will see a row of buttons.  Each button can be <b>Left Clicked</b> to change this column, or <b>Right Clicked</b> to pop it out as a nice floating window.</p>
    <p><b>Right Click</></b> <i class="fas fa-swords\"></i> at the top of the column to pop out the <b>Combat Tracker</b>.  That way we can still chat.  If it is already out, please close it and bring it out again.</p>`,
            unless: "return $('#combat-popout').length > 0"
        }, {
            say: `<p>A Call to Battle!  You already have a floating <b>Combat Tracker</b> out</p>
                    <p>Smart of you to realize you can <b>Right Click</b> <i class="fas fa-swords\"></i> at the top of the column to pop out the <b>Combat Tracker</b>.</p>`,
            unless: "return $('#combat-popout').length === 0"
        }, {
            waitFor: "renderCombatTracker",
            unless: "return $('#combat-popout').length > 0"
        }, {
            say: `<p>Good job, now let's join the fight.  First, right-click your token to pull up your token Heads-Up Display (HUD).</p>`,
            unless: "return $('#token-hud:visible').length > 0"
        }, {
            waitFor: "renderTokenHUD",
            unless: "return $('#token-hud:visible').length > 0"
        }, {
            say: `<p>Great, you've opened the token HUD!  Look at all the buttons around your token.  Click the <b>Toggle Combat State</b> button <img src="icons/svg/combat.svg" width="20" height="20"> next to your token</p>`
        }, {
            waitFor: "preCreateCombatant"
        }, {
            say: `<p>You are now in tracker.  Next up, rolling initaitive. The simplest way to do it is to click the Die on the row next to your token.</p>`
        }, {
            waitFor: "dnd5e.rollInitiative"
        }, {
            say: `<p>You are now in initiative, ready to fight!</p>`
        }]
    }, {
        name: "Roll an Abilty Check",
        id: "roll-ability-check",
        steps: [
            {
                say:`<p>First thing we need to do is open your character sheet.  You can do that by <b>double-clicking</b> your token.</p>`,
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say:`<p>Your character sheet is already open, let's get to work!</p>`,
                unless: "return $('header.sheet-header').length === 0"
            }, {
                waitFor: "renderActorSheet",
                unless: "return $('header.sheet-header').length > 0"
            },  {
                say: `<p>You are not on the Details section.  Look at the tabs hanging off the right edge of your character sheet.  Clicking on the tab that looks like
                <i class="fas fa-cog"></i> will take you to your <b>Details</b> section.</p>`,
                unless: `return "details" === $('a.item.control.active').first().attr('data-tab')`
            }, {
                waitFor: "foundryclippy.actorTabChange",
                unless: `return "details" === $('a.item.control.active').first().attr('data-tab')`,
                test: `return hookArgs[0] === "details"`
            }, {
                say:`<p>The standard D&D5e Character sheet lets you roll Skill checks from the middle of the main, or <b>Details</b> page.</p>
                <p>When you are on the correct it, click on the skill you are checking</p>`
            }, {
                waitFor: "dnd5e.rollSkillV2"
            }, {
                say:"<p>Wow!  You really are skilled!</p>"
            }
        ]
    }, {
        name: "Roll a Saving Throw",
        id: "roll-saving-throw",
        steps: [
            {
                say:`<p>First thing we need to do is open your character sheet.  You can do that by <b>double-clicking</b> your token.</p>`,
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say:`<p>Your character sheet is already open, let's get to work!</p>`,
                unless: "return $('header.sheet-header').length === 0"
            }, {
                waitFor: "renderActorSheet",
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say: `<p>You are not on the Details section.  Look at the tabs hanging off the right edge of your character sheet.  Clicking on the tab that looks like
                <i class="fas fa-cog"></i> will take you to your <b>Details</b> section.</p>`,
                unless: `return "details" === $('a.item.control.active').first().attr('data-tab')`
            }, {
                waitFor: "foundryclippy.actorTabChange",
                unless: `return "details" === $('a.item.control.active').first().attr('data-tab')`,
                test: `return hookArgs[0] === "details"`
            }, {
                say:`<p>There it is!  The standard D&D5e Character lets you roll saving throws from the right side of the main, or <b>Details</b> page.</p>
                <p>When you see it, click on the attribute of your saving throw, or <b>Concentration</b> for a Concentration check.`
            }, {
                waitFor: "dnd5e.rollSavingThrow"
            }, {
                say:`<p>Congratulations!  I hope you saved!</p>`
            }
        ]
    }, {
        name: "Make an Attack",
        id: "make-attack",
        steps: [
            {
                say:`<p>First thing we need to do is open your character sheet.  You can do that by <b>double-clicking</b> your token.</p>`,
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say:`<p>Your character sheet is already open, let's get to work!</p>`,
                unless: "return $('header.sheet-header').length === 0"
            }, {
                waitFor: "renderActorSheet",
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say:`<p>There it is!  The standard D&D5e Character has most attacks on the <b>Inventory</b> page.</p>`                
            }, {
                say: `<p>You are not on the Inventory section.  Look at the tabs hanging off the right edge of your character sheet.  Clicking on the tab that looks like
                <img src="systems/dnd5e/icons/svg/backpack.svg"/ width="20" height="20">
                will take you to your <b>Inventory</b> sheet.</p>`,
                unless: `return "inventory" === $('a.item.control.active').first().attr('data-tab')`
            }, {
                waitFor: "foundryclippy.actorTabChange",
                unless: `return "inventory" === $('a.item.control.active').first().attr('data-tab')`,
                test: `return hookArgs[0] === "inventory"`
            }, {
                say: `<p>On the inventory page, you will see a section called weapons.  But before we hit somebody, let's find somebody to target.</p>
                <p>To target somebody, move your mouse over the token you want to hit, and hit <b>T</b>.  This part is normally optional, but it can make things easier
                on your Gamemaster, and I'm a courteous paperclip.  You can use <b>Shift-T</b> to target multiple tokens.
                If there are no other tokens here, just target yourself so we can move on.  Silly, but its an example.</p>`
            }, {
                waitFor: "targetToken",
            }, {
                say: `<p>Now that you have a target.  Let's attack!  Click on a weapon on your character sheet.</p>
                <p>If the weapon has only an "Attack" property, it will take you to the roll dialog.  If it can do more than simply attack, you will see options.  Pick the <b>Attack</b> option.`
            }, {
                waitFor: "renderRollConfigurationDialog"
            }, {
                say:`<p>The roll configuration dialog will let you apply dnd specific bonuses and attributes to your roll, as well as select advantage or disadvantage.</p><p>As you get
                more comfortable, you can use control keys to do this more quickly, but I'm just a paperclip.  I like to keep it simple.  Choose your options
                and press a roll button.</p>`
            }, {
                waitFor: "dnd5e.rollAttackV2",
            }, {
                say:`<p>Now that's what I call an attack!  If you do not want to open the character sheet every time, why not</p>`,
                buttons: ['make-macro-button']
            }
        ]
    }, {
        name: "Cast a Spell",
        id: "cast-spell",
        steps: [
            {
                say:`<p>First thing we need to do is open your character sheet.  You can do that by <b>double-clicking</b> your token.</p>`,
                unless: "return $('header.sheet-header').length > 0"
            }, {
                say:`<p>Your character sheet is already open, let's get to work!</p>`,
                unless: "return $('header.sheet-header').length === 0"
            }, {
                waitFor: "renderActorSheet",
                unless: "return $('header.sheet-header').length > 0"
            },  {
                say:`<p>There it is!  The standard D&D5e Character has most attacks on the <b>Spells</b> page.</p>`                
            }, {
                say: `<p>You are not on the Spells section.  Look at the tabs hanging off the right edge of your character sheet.
                Clicking on the tab that looks like  <i class="fas fa-book"></i>
                will take you to your <b>Spell</b> sheet.</p>`,
                unless: `return "spells" === $('a.item.control.active').first().attr('data-tab')`
            }, {
                waitFor: "foundryclippy.actorTabChange",
                unless: `return "spells" === $('a.item.control.active').first().attr('data-tab')`,
                test: `return hookArgs[0] === "spells"`
            }, {
                say:`<p>On the spell sheet, you will a list of your spells.  Just like with attacks, you can target a spell, but let's skip that here.</p>
                <p>Click the spell to cast it.  If that chat has buttons for you to continue the roll, use them.</p>`
            }, {
               waitFor: "dnd5e.preUseActivity",
               test: `return "SpellData" === hookArgs[0]?.parent?.constructor?.name`,
               context: `return hookArgs[0]`
            }, {
                waitFor: "dnd5e.renderChatMessage",
                test: `if (context.type === 'attack') {
                        return context.parent.parent.name && hookArgs[0].flavor.indexOf(context.parent.parent.name) > -1;
                    }
                    if (context.type === 'save' || context.type === 'utility') {
                        return $(hookArgs[1]).find('div.message-content span.title').html().indexOf(context.parent.parent.name) > -1;
                    }
                    return true;`
             }, {
                say:`<p>Some spells will call up a dialog for you to confirm elements of your casting, while others will output the cast directly to the chat.  If you do not
                want to open your character sheet every time, you can</p>`,
                buttons: ['make-macro-button']
            }
        ]
    }, {
        name: "Make a Quick Button",
        id: "make-macro-button",
        steps: [
            {
                say:`<p>If you do the same thing all the time, sometimes you want a simple button, so you dont have to keep opening your character sheet</p>
                <p>Good news!  You can drag something from your character sheet to any of the numbered slots in your <b>Macro Hotbar</b> at the bottom of the screen.</p>`
            }, {
                say: `<p>Your <b>Macro Bar</b> is not showing.  Look for the <i class="fas fa-caret-up"></i> on the bottom of your screen and click it to show it`,
                unless: `return $('#action-bar:visible').length > 0`
            }, {
                say:`<p>Now, let's open your character sheet to find something to add to the <b>Macro Hotbar</b>.  You can do that by <b>double-clicking</b> your token.</p>`,
                unless: "return $('header.sheet-header').length > 0"
            },  {
                say:`<p>Your character sheet is already open, let's get to work!</p>`,
                unless: "return $('header.sheet-header').length === 0"
            }, {
                waitFor: "renderActorSheet",
                unless: "return $('header.sheet-header').length > 0"

            }, {
                say:`<p>Good job! So, anything on your sheet with a name and a picture can be dragged to the <b>Hotbar Macro</b>.  Usually, you are going to want to drag
                a Weapon or a Spell that you will be using over and over again.  Use the <img src="systems/dnd5e/icons/svg/backpack.svg"/ width="20" height="20"> to open the <b>Inventory</b>
                sheet or the <i class="fas fa-book"></i> to open your spell sheet.`
            }, {
                say: `<p>Now, simply drag the item of your choice to an empty box on the bar.  It's that easy!</p>`
            }, {
                waitFor: "renderHotbar"
            }, {
                say: `<p>That's it!  Now you can click on that item you created every time, rather than open up your character sheet.</p>`
            }
        ]
    },  {
        name: "Adjust Volume",
        id: "adjust-volumne",
        steps: [{
            say: `<p>As a paperclip, sometimes I need some help hearing.  We can go to the <b>Playlists</b></p>
    <p>In the top of the right column (above my words), you will see a row of buttons.  Each button can be <b>Left Clicked</b> to change this column, or <b>Right Clicked</b> to pop it out as a nice floating window.</p>
    <p><b>Right Click</></b> <i class="fas fa-music\"></i> at the top of the column to pop out the <b>Playists</b>.  That way we can still chat.</p>`,
            unless: "return $('#playlists-popout').length > 0"
        }, {
            say: `<p>You already have a floating <b>Playlists window</b> out</p>
                    <p>Smart of you to realize you can <b>Right Click</b> <i class="fas fa-music\"></i> at the top of the column to pop out <b>Playlists</b>.</p>`,
            unless: "return $('#playlists-popout').length === 0"
        }, {
            waitFor: "renderPlaylistDirectory",
            unless: "return $('#playlists-popout').length > 0"
        }, {
            say: `<p>Foundry has multiple sound channels.</p><ol><li>Music</li><li>Environment</li><li>Interface</li></ol><p>Music is for, well, music.  Environment are for those background noises or
            sounds on the map, and interface is when UI elements want to tell you something.   You can move them up or down independently to hear things exactly how you want to hear.  Neat, huh?</p>`,
        }, {
            say: `<p>If a playlist is playing you have permission to see it, you may see that and control that track's volume yourself, as well.</p>`
        }]
    },
]

export const groups = [
    {
        name: "Core",
        id: "core",
        workflows: workflows
    }
]
