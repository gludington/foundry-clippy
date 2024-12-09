/**
 * @module types
 * 
 **/

/**
 * The basic set of workflows.  the tests are strings, not actual functions, to preserved the ability to administer this via json.  But that may prove too unwieldy.
 * Hopefully have the jdsoc definitions correct; more used to typescript.
 * 
 * @typedef {Object} SayStep
 * @property {string} say - the text to say
 * @property {string} unless - string representing the body of a function, that must return true or false.  if false, we do not say, and proceed to the next step
 * 
 * @typedef {Object} WaitForStep
 * @property {string} waitFor - the hook to wait for
 * @property {string} unless - string representing the body of a function, that must return true or false.  if false, we skip the waiting, and proceed to the next step
 * @property {string} test - string representing the body of a function, that must return true or false.  if false, we keep waiting
 * 
 * @typedef { SayStep | WaitForStep} Step
 * 
 * @typedef {Object} Workflow
 * @property {sting} name
 * @property {string} id
 * @property {Step[]} steps
 * 
 * @typedef {Object} WorkflowContext
 * @property {Workflow} workflow
 * @property {number} current
 * @property {any} [context]
 * 
 * @typedef {Object} IdAndName
 * @property {string} id
 * @property {string} name
 */