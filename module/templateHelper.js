import { log } from "../scripts/main.js";
import { MODULE_ID } from "../scripts/main.js";

export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/senses/templates"
		"greeting.hbs"
	].map(template => `modules/${MODULE_ID}/templates/${template}`);
    log(templatePaths)
	return loadTemplates(templatePaths);
}

export const outputTemplate = (template, data) => {
	log(template);
	return renderTemplate(`modules/${MODULE_ID}/templates/${template}`, { ...data, moduleId: MODULE_ID });
}