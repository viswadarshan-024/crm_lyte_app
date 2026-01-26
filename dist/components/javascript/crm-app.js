Lyte.Component.register("crm-app", {
_template:"<template tag-name=\"crm-app\"> <div class=\"app-container\"> <crm-sidebar class=\"sidebar\"></crm-sidebar> <main class=\"main-content\"> <lyte-outlet yield=\"true\"></lyte-outlet> </main> </div> </template>\n<style>/* ========================================\n   APP CONTAINER\n   ======================================== */\n.app-container {\n    display: flex;\n    min-height: 100vh;\n    width: 100%;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* ========================================\n   SIDEBAR (The Component Wrapper)\n   ======================================== */\n/* This targets the <crm-sidebar> tag directly */\ncrm-sidebar.sidebar {\n    width: 260px;\n    height: 100vh;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    transition: width 0.3s ease;\n    display: flex;\n    flex-direction: column;\n}\n\n/* Inner wrapper styles */\n.sidebar-inner {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    width: 100%;\n}\n\n/* Collapse Logic */\ncrm-sidebar.sidebar.collapsed {\n    width: 80px;\n}\n\n/* ========================================\n   MAIN CONTENT\n   ======================================== */\n.main-content {\n    flex: 1;\n    /* Removed margin-left because Flexbox handles the positioning automatically now */\n    height: 100vh;\n    overflow-y: auto;\n    background-color: #f8fafc;\n    padding: 0; /* Let children handle padding */\n}</style>",
_dynamicNodes : [{"type":"componentDynamic","position":[1,1]},{"type":"componentDynamic","position":[1,3,1]}],

	data : function(){
		return {

		}		
	},
	actions : {
		// Functions for event handling
	},
	methods : {
		// Functions which can be used as callback in the component.
	},
	style: ["components/styles/components.css"]
});
