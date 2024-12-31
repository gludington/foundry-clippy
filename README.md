# foundry-clippy

Foundry-Clippy is a module to provide lighthearted help for Foundry tasks in a whispered conversation with a user.  This has nothing to do with Microsoft Clippy except as inspiration, and may be renamed should this be released beyond my own personal use. 

This early release comes with support for a limited number of help flows in one system, dnd5e 4.x+ only.

Help flows are defined in JSON, and there is no schema, much less visual or other builder to assist, in large part as what building blocks are necessary is still experimental.  Perhaps another time, if this gains a wider user base than just me.  dnd5e, as something built in, exports JSON built from helper functions, though in theory this is something that could be administered.

## JSON Format
TBD, still being defined

## Workflows
The core element is the workflow.  Each workflow consists of an array of steps to execute in order.  

## Steps
A step is an indivual element in workflow.  This is also experimental, but at this time each step consists of a named action and some optional keys.

### Named Actions
A step at minimum must have a named action, either **say** or **waitFor**

#### say
The say action whispers a message to Clippy's conversation partner.  Examples:

```
{ say: "Hello there" }
```

Is a complete step, that will result in Clippy whipsering *Hello there* to the user.  Currently, only literal text is allowed - no internationalization or variable substitution - though, since a context has been recently added, that is under consideration

#### waitFor
waitFor takes one argument -- the name of a FoundryVTT hook to fire.  The workflow will pause until that hooks is fired, indefinitely if it never fires.  (TBD: Perhaps timeouts or reminders.)  Example:

```
{ waitFor: "preCreateCombatant" }
```
Will pause the workflow until the event fires as a result of the user performing the action to insert themselves into the combat tracker.

**say** and **waitFor** form the basis of workflow conversations -- Clippy says something, and pauses until the user takes the action.

### Optional Keys
Optional keys allow refinements of steps, adding conditions to execute or skip, or buttons to add to say output.  Again, design still TBD and evolving.

The first two, **test** and **unless** are the body of javascript functions as strings, which the module creates on the fly and passes arguments.  (Both use new Function(), not eval, so should be able to work in any CSP header setting that Foundry works in.)  Both functions will receive two arguments:

1. context - the context of the workflow, discussed below
2. hookArgs - the array of arguments passed to the hook

and *must* return a boolean true/false.

#### test
test is an additional condition required for a waitFor step to be compelted.  It's primary use is in waitFor steps, to make sure that not just a hook is fired, but a hook contains specific elements.

For example, Clippy might ask the user to cast a spell, and wait until the user does so.  However, the hook **dnd5e.preUseActivity** could fire for other uses, and we only want to fire if the acvitity was a spell.

```
{
    waitFor: "dnd5e.preUseActivity",
    test: `return "SpellData" === hookArgs[0]?.parent?.constructor?.name`,
    context: `return hookArgs[0]`
}
```
Our test function will look at the arguments passed to the **dnd5e.preUseActivity** hook, and only consider the waitFor condition met if the activity passed SpellData.  **context** will be discussed below, but it sets state on the current workflow that can be used by later steps.

The module transforms the above **test** body to:

```
function(context, hookArgs) {
    return "SpellData" === hookArgs[0]?.parent?.constructor?.name
}
```
Anything available in the global context will also be present.

#### unless

unless also takes a context and hookArgs argument, but it is used by both **waitFor** and **say** to skip the command altogether.  unless can be used to prevent Clippy from saying or waiting for redundant conditions, as in this block:
```
 [
    ...other steps...
    {
        say:`<p>First thing we need to do is open your character sheet.  You can do that by <b>double-clicking</b> your token.</p>`,
        unless: "return $('header.sheet-header').length > 0"
    },  {
        waitFor: "renderActorSheet",
        unless: "return $('header.sheet-header').length > 0"
    }, {
        say:`<p>Your character sheet is already open, let's get to work!</p>`,
        unless: "return $('header.sheet-header').length === 0"
    }
 ]
```            
Foundry places jQuery in the global context, so we can use it to check for the presence of absence of elements.  Here, Clippy will ask the user to open their character sheet and wait, but only if no sheet is opened.  If a sheet is opened, Clippy will not wait and say something else.  This is in place of actual branching logic, which is another TBD if complex flows require it.

#### context
**context** is how a step can create state in a workflow.  In the example above, we have
```
{
    waitFor: "dnd5e.preUseActivity",
    test: `return "SpellData" === hookArgs[0]?.parent?.constructor?.name`,
    context: `return hookArgs[0]`
}
```
context also represents a function that takes a **context** and a **hookArgs** arguments.  Whatever is returned becomes the next context.  This will set the context equal to the first hook argument, which subsequent steps can then access.  Note the above syntax will obliterate the existing context, so you would need to keep the current context using something like spread syntax to maintain it..
```
context: `return { ...context, spell: hookArgs[0] } }`
```
#### buttons
**buttons** outputs an array of buttons below a **say** output.  These buttons allow for flows to invoke other flows, or to hightlight.  Button syntax (again, design TBD, but almost assuredly changing to an object) is:

```
buttons: ['action-id']
```
where action is one of
1. workflow - execute a workflow with the specified id.  (This ends the current workflow.)
2. highlight - if [remote-highlight-ui](https://github.com/shemetz/remote-highlight-ui/) is installed, use its wonderful features to highlight the element identified by the css selector specified.  (TBD: get explicit permission to include as a dependency, perhaps contribute to repo.)
3. group - list the workflows in the specified group