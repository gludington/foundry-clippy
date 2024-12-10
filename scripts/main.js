export const MODULE_ID = "foundry-clippy";
export const API_GLOBAL_NAME = "FoundryClippy";
export const SPEAKER_ALIAS = "Clippy";
export const CLIPPY = "📎";
export const CLIPPY_IMAGE = `modules/${MODULE_ID}/assets/paperclip.png`;
import { loadWorkflows } from "./systems/index.js";
import { preloadTemplates, outputTemplate } from "../module/templateHelper.js";

/**
 * @typedef {import('./types.js').Workflow} Workflow
 */

/**
 * @type {Map<string, WorkflowContext>}
 */
const userStatus = new Map();
/**
 * the workflows we are going to load on startup
 * @type {Map<string, Workflow>}
 */
let workflows = new Map();
/**
 * the workflows we are going to load on startup
 * @type {WorkflowGroup[]}
 */
let workflowGroups = new Map();

/**
 * A place to store the game.user.id
 * @type {string}
 */
let userId;

/**
 * Output something to the chat.
 * @param {string} content 
 * @param {string[]} an optional array of strings pointing to workflow ids
 */
const say = async (content, buttons) => {
    if (buttons?.length) {
        const links = buttons.map(butt => {
            return workflows.get(butt);
        })
        content += await outputTemplate("bottombuttons.hbs", { buttons: links })
    }
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ alias: SPEAKER_ALIAS}),
        whisper:[userId],
        content
    });    
}

/**
 * Conveience function to call locationalization.
 * @param {string} localKey the local key (without module id prefix)
 * @returns the i18n content
 */
const localize = (localKey) => {
    return game.i18n.localize(`${API_GLOBAL_NAME}.${localKey}`)
}

/**
 * Log to the console.
 * @param {string | any} message 
 * @param  {...any} args other arguments to log
 */
export const log = (message, ...args) => {
    if (args?.length) {
        console.log(`${MODULE_ID} ${CLIPPY}| ${message}`, args);
    } else {
        if (typeof message === 'string') {
            console.log(`${MODULE_ID} ${CLIPPY}| ${message}`);
        } else {
            console.log(`${MODULE_ID} ${CLIPPY}|`, message);
        }
    }
}

/**
 * Start a workflow at its first step and no context.
 * @param {Workflow} workflow 
 */
const startWorkflow = (workflow) => {
    userStatus.set(workflow.id, { workflow, current: 0 });
    executeStep(workflow.id);
}

/**
 * Proceed to the next step in the workflow.
 * @param {string} id the id of the workflow
 */
const nextStep = (id) => {
    const workFlowContext = userStatus.get(id);
    const total = workFlowContext.workflow.steps.length;
    const next = workFlowContext.current + 1;
    if (total > next) {
        userStatus.set(id, { ...workFlowContext, current: workFlowContext.current + 1})
        executeStep(id);
    } else {
        userStatus.delete(id);
    }
}

/**
 * Execute a step in the workflow.  Could be part of nextStep, since it should only be called there, but broken out in case.
 * @param {string} id the id of the flow to execute.
 */
const executeStep = (id) => {
    const workFlowContext = userStatus.get(id);
    const currentStep = workFlowContext.workflow.steps[workFlowContext.current];
    const action = Object.keys(currentStep).find(key => ['say','waitFor'].indexOf(key) > -1);
    let skip = false;
    if (currentStep.unless) {
        skip = new Function('context', currentStep.unless)(workFlowContext.context);
    }
    log(`Executing: ${action} - skip: ${skip}`)
    switch (action) {
        case "say":
            if (!skip) {
                say(currentStep.say, currentStep.buttons);
            }
            nextStep(id);
            break;
        case "waitFor":
            if (skip) {
                nextStep(id);
            };
            break;
    }
}

/**
 * Respond to foundryVTT hook we are waiting for.
 * @param {string} hook the name of the hooks
 * @param {*} args the args passed to the hook
 */
const checkWaitFor = (hook, args) => {
    if (userStatus.size > 0) {
        const matches = [];
        userStatus.entries().forEach((entry) => {
            const currentStep = entry[1].workflow.steps[entry[1].current];
            if (currentStep.waitFor === hook) {
                if (currentStep.test) {
                    const result = new Function(['context', 'hookArgs'], currentStep.test)(entry[1].context, [...args]);
                    if (result) {
                        matches.push(entry[0])
                    }                
                } else {
                    matches.push(entry[0]);
                }
                if (currentStep.context) {
                    const ctx = new Function(['context', 'hookArgs'], currentStep.context)(entry[1].context, [...args]);
                    entry[1].context = ctx;
                }
            }
        })
        matches.forEach((id) => {
            nextStep(id)
        })
    }
}

Hooks.on("renderActorSheet", (sheet, html, data) => {
    html.find('a.item.control').each((idx, el) => {
        el.addEventListener("click", () => Hooks.call('foundryclippy.actorTabChange', el.getAttribute('data-tab')))
    })
})

/**
 * Specific hook for chat messages to replace the actor.  We could use actors, but apparently that relies on
 * the actor having a token in the scene, and there are use cases where we dont want a clippy token hanging around.
 * Besides, this way we can replace the image in config.
 */
Hooks.on("dnd5e.renderChatMessage", (message, originalHtml) => {
    if (message?.speaker?.alias === SPEAKER_ALIAS) {        
        const html = $(originalHtml);
        const avatar = html.find('.avatar')
        if (avatar) {            
            originalHtml = avatar.html(`<img src="${CLIPPY_IMAGE}" alt = "${SPEAKER_ALIAS}"/>`);
        }
        html.find(`button[data-${MODULE_ID}-action]`).on("click", event => {
            const actionAtt = event.currentTarget.getAttribute(`data-${MODULE_ID}-action`)
            const action = actionAtt.substring(0, actionAtt.indexOf('-'));
            const dest = actionAtt.substring(actionAtt.indexOf('-') + 1);
            log(action, dest);
            switch (action) {
                case "workflow":
                    const workflow = workflows.get(dest);
                    if (!workflow) {
                        ui.notifications.error(localize("noworkflowforactionerror"));
                    } else {
                        startWorkflow(workflow);
                    }
                break;
                case "group": {
                    const group = workflowGroups.get(dest);
                    if (group) {
                        greet([group]);
                    } else {
                        ui.notifications.error(localize("nogroupoforactionerror"));
                    }

                }
            }
        })
    }
});

/**
 * Add the clippy button to the left button panels in the token group.
 */
Hooks.on("getSceneControlButtons", (controls) => {
    const tokenButtons = controls.find(bank => bank.name == 'token');
    if (tokenButtons) {
        tokenButtons.tools.push({
            name: MODULE_ID,
            title: localize("askclippy"),
            icon: "fa fa-paperclip",
            button: true,
            visible: true,
            onClick: (toggle) => {
                FoundryClippy.start();
            }
        })
    }
});

const groupGreet = (groups) => {
    outputTemplate("greeting.hbs", { content: localize("groupgreeting"), groups}).then(content => {
        say(content);
    });
}

const workflowGreet = (workflows) => {
    outputTemplate("greeting.hbs", { content: localize("workflowgreeting"), workflows}).then(content => {
        say(content);
    });
}

const greet = (groups) => {
    if (groups.length > 1) {
        groupGreet(groups);
    } else {
        workflowGreet(groups.values().next().value.workflows);
    }
}

/**
 * initlize clippy on ready.
 */
Hooks.on("ready", async () => {
    //lets' just get it from foundry -- change if we go to typescript or evern just js with rollup to inject at build time
    const mod = game.modules.get(MODULE_ID);
    const version = mod.version;
    log(`version ${version} Initializing for system ${game.system.id}`);
    userId = game.user.id;
    try {
        const groups = await loadWorkflows(game.system);
        log(`Loaded for ${game.system.id}`, groups);
        //add a single listener for every hook our system wants to listen to
        const foundHooks = new Map();
        groups.forEach(group => {
            if (workflowGroups.has(group.id)) {
                throw `Duplicate group id ${group.id}`
            }
            workflowGroups.set(group.id, group);
            group.workflows.forEach(workflow => {
                if (workflows.has(workflow.id)) {
                    throw `Duplicate workflow id ${workflow.id}`
                }
                workflows.set(workflow.id, workflow);
                workflow.steps.forEach(step => {
                    if (step.waitFor) {
                        if (!foundHooks.has(step.waitFor)) {
                            Hooks.on(step.waitFor, (...args) => checkWaitFor(step.waitFor, args));
                            foundHooks.set(step.waitFor, true);
                        }
                    }
                })
            });
        });
    } catch (err) {
        log("Unable to load system", err);
        ui.notifications.error(localize("parseworkflowerror"));
        return;
    }
    // preload our tempaltes
    const templates = await preloadTemplates();
    // expose a public facing api
    game.modules.get(MODULE_ID).api = { start: async () => {
        userStatus.clear();
        greet(Array.from(workflowGroups.values()));                
    }}
    window[API_GLOBAL_NAME] = game.modules.get(MODULE_ID).api;
})
