export const scalarConfig = {
    theme: 'default' as const,
    layout: 'modern' as const,
    defaultOpenAllTags: true,
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
        .scalar-app .scalar-reference-intro-clients,
        .scalar-app .property-required,
        .scalar-app .open-api-client-button,
        .scalar-app .darklight-reference,
        .scalar-app .agent-button-container,
        .scalar-app .download-button,
        .scalar-app .property-detail,
        .scalar-app .sidebar-header button:not([aria-label="Toggle dark mode"]) {
            display: none !important;
            pointer-events: none !important;
            opacity: 0 !important;
        }
        .scalar-app .section-header-wrapper {
            margin-top: 10px !important;
        }
        
    ` 
}
