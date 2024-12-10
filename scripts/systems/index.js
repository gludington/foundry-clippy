import { log } from "../main.js"
import { groups as dnd5e } from "./dnd5e.js"

export const loadWorkflows = (sys) => {
    switch (sys.id) {
        case "dnd5e":
            log(`${sys.id} detected, checking version`)
            const version = sys.version;
            const major = parseInt(version.substring(0, version.indexOf('.')));
            if (major < 4) {
                throw 'Unsupported system.  Only dnd5e > 4';
            }
            return dnd5e;
            default:
                throw `Unsupported System ${sys.id}`
    }

}
