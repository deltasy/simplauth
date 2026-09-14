import { apiReference } from "@scalar/express-api-reference";
import { generateOpenApiDocument } from "./src/config/openapi.js";
import app, { routeData } from "./src/server.js";

export const scalarConfig = {
    theme: 'default' as const,
    layout: 'modern' as const,
    forceDarkModeState: 'dark' as const,
    hideDarkModeToggle: true,
    hideSearch: true,          
    hideModels: true,   
    mcp: {
        disabled: true,
    },     
    showDeveloperTools: 'localhost' as const,  
    customCss: `
        .scalar-app button:has(svg.lucide-sparkles),
        .scalar-app agent-button-container,
        .scalar-app a:has(svg.lucide-sparkles),
        .scalar-app [class*="ask-ai"],
        .scalar-app [class*="generate-mcp"],
        .scalar-app .scalar-sidebar-footer,
        .scalar-app border-sidebar-border,
        .scalar-app darklight-reference,
        .scalar-app .scalar-reference-intro-clients,
        .scalar-app .sidebar-header button:not([aria-label="Toggle dark mode"]) {
            display: none !important;
            pointer-events: none !important;
            opacity: 0 !important;
        }
        
    ` 
}
