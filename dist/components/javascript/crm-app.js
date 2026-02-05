Lyte.Component.register("crm-app", {
_template:"<template tag-name=\"crm-app\"> <div class=\"app-container\" style=\"display: flex; height: 100vh; overflow: hidden;\"> <crm-sidebar></crm-sidebar> <div class=\"main-content\" style=\"flex-grow: 1; overflow-y: auto; background-color: #f4f7f6; position: relative;\"> <div id=\"crm_inner_outlet\"></div> </div> </div> </template>\n<style>/* ========================================\n   APP CONTAINER\n   ======================================== */\n.app-container {\n    display: flex;\n    min-height: 100vh;\n    width: 100%;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* ========================================\n   SIDEBAR (The Component Wrapper)\n   ======================================== */\n/* This targets the <crm-sidebar> tag directly */\ncrm-sidebar.sidebar {\n    width: 260px;\n    height: 100vh;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    transition: width 0.3s ease;\n    display: flex;\n    flex-direction: column;\n}\n\n/* Inner wrapper styles */\n.sidebar-inner {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    width: 100%;\n}\n\n/* Collapse Logic */\ncrm-sidebar.sidebar.collapsed {\n    width: 80px;\n}\n\n/* ========================================\n   MAIN CONTENT\n   ======================================== */\n.main-content {\n    flex: 1;\n    /* Removed margin-left because Flexbox handles the positioning automatically now */\n    height: 100vh;\n    overflow-y: auto;\n    background-color: #f8fafc;\n    padding: 0; /* Let children handle padding */\n}</style>",
_dynamicNodes : [{"type":"componentDynamic","position":[1,1]}],

	// mixins: ["auth-mixin"],

	beforeModel: function(transition) {
		// 1. Security Check
		if (!this.isAuthenticated()) {
			Lyte.Router.transitionTo('login-comp');
			return;
		}

		// 2. SMART REDIRECT
		// Only redirect to dashboard if the user is at the Root ('crm-app')
		// or the Index ('crm-app.index').
		// If they are going to 'crm-app.contact-list', this block will skipped.
		if (transition.targetName === 'crm-app' || transition.targetName === 'crm-app.index') {
			Lyte.Router.transitionTo('crm-app.crm-dashboard');
		}
	}
},
{mixins: ["auth-mixin"]}
);