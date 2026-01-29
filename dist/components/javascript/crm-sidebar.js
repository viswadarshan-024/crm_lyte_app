Lyte.Component.register("crm-sidebar", {
_template:"<template tag-name=\"crm-sidebar\"> <div class=\"sidebar-inner {{expHandlers(isCollapsed,'?:','collapsed','')}}\"> <div class=\"sidebar-header\"> <div class=\"logo\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path><path d=\"M2 12l10 5 10-5\"></path></svg> </div> <span class=\"logo-text\" onclick=\"{{action('toggleSidebar')}}\">Mini CRM</span> </div> <nav class=\"sidebar-nav\"> <a href=\"#/dashboard\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg> </span> <span class=\"text\">Dashboard</span> </a> <template is=\"if\" value=\"{{canViewCompanies}}\"><template case=\"true\"> <a href=\"#/companies\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4\"></path></svg> </span> <span class=\"text\">Companies</span> </a> </template></template> <template is=\"if\" value=\"{{canViewContacts}}\"><template case=\"true\"> <a href=\"#/contacts\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Contacts</span> </a> </template></template> <template is=\"if\" value=\"{{canViewDeals}}\"><template case=\"true\"> <a href=\"#/deals\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Deals</span> </a> </template></template> <template is=\"if\" value=\"{{canViewActivities}}\"><template case=\"true\"> <a href=\"#/activities\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Activities</span> </a> </template></template> <template is=\"if\" value=\"{{canViewUsers}}\"><template case=\"true\"> <a href=\"#/users\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Users</span> </a> </template></template> <template is=\"if\" value=\"{{canViewRoles}}\"><template case=\"true\"> <a href=\"#/roles\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Roles</span> </a> </template></template> <template is=\"if\" value=\"{{canViewProfiles}}\"><template case=\"true\"> <a href=\"#/profiles\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Profiles</span> </a> </template></template> </nav> <div class=\"sidebar-footer\"> <div class=\"user-info\"> <div class=\"avatar\">{{userInitials}}</div> <div class=\"details\"> <span class=\"name\">{{userName}}</span> <span class=\"role\">{{userRole}}</span> </div> </div> <button onclick=\"{{action('logout')}}\" class=\"logout-btn\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><polyline points=\"16 17 21 12 16 7\"></polyline><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"></line></svg> </button> </div> </div> </template>\n<style>/* CONTAINER */\n.sidebar-inner {\n    width: 260px;\n    height: 100vh;\n    background-color: #1e293b; /* Dark Blue Background */\n    color: #f1f5f9;\n    display: flex;\n    flex-direction: column;\n    transition: width 0.3s;\n    border-right: 1px solid #334155;\n}\n\n.sidebar-inner.collapsed {\n    width: 70px;\n}\n\n/* HEADER */\n.sidebar-header {\n    height: 64px;\n    display: flex;\n    align-items: center;\n    padding: 0 20px;\n    border-bottom: 1px solid #334155;\n    white-space: nowrap;\n    overflow: hidden;\n}\n.logo { min-width: 24px; margin-right: 12px; color: #3b82f6; }\n.logo-text { font-weight: bold; font-size: 18px; cursor: pointer; }\n\n/* NAV LINKS */\n.sidebar-nav {\n    flex-grow: 1;\n    padding: 20px 10px;\n    overflow-y: auto;\n    display: flex;       /* CRITICAL for spacing */\n    flex-direction: column;\n    gap: 5px;           /* Replaces <br> */\n}\n\n.nav-item {\n    display: flex;\n    align-items: center;\n    padding: 10px 15px;\n    color: #94a3b8;\n    text-decoration: none;\n    border-radius: 6px;\n    transition: all 0.2s;\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n.nav-item:hover, .nav-item.active {\n    background-color: #334155;\n    color: white;\n}\n\n.icon {\n    min-width: 20px;\n    height: 20px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    margin-right: 12px;\n}\n\n/* FOOTER */\n.sidebar-footer {\n    padding: 20px;\n    border-top: 1px solid #334155;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n}\n.user-info { display: flex; align-items: center; overflow: hidden; }\n.avatar {\n    width: 32px; height: 32px; background: #3b82f6; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    font-weight: bold; font-size: 14px; margin-right: 10px; flex-shrink: 0;\n}\n.details { display: flex; flex-direction: column; }\n.name { font-size: 14px; font-weight: 500; }\n.role { font-size: 12px; color: #94a3b8; }\n.logout-btn {\n    background: none; border: none; color: #94a3b8; cursor: pointer;\n    padding: 5px; transition: color 0.2s;\n}\n.logout-btn:hover { color: #ef4444; }\n\n/* Collapsed State Handling */\n.sidebar-inner.collapsed .text,\n.sidebar-inner.collapsed .logo-text,\n.sidebar-inner.collapsed .details {\n    opacity: 0;\n    pointer-events: none;\n    display: none; /* Hide text when collapsed */\n}\n.sidebar-inner.collapsed .sidebar-header,\n.sidebar-inner.collapsed .nav-item {\n    justify-content: center;\n    padding-left: 0; padding-right: 0;\n}\n.sidebar-inner.collapsed .icon { margin-right: 0; }</style>",
_dynamicNodes : [{"type":"attr","position":[1]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,7]},{"type":"if","position":[1,3,7],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,9]},{"type":"if","position":[1,3,9],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,11]},{"type":"if","position":[1,3,11],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,13]},{"type":"if","position":[1,3,13],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,15]},{"type":"if","position":[1,3,15],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,5,1,1,0]},{"type":"text","position":[1,5,1,3,1,0]},{"type":"text","position":[1,5,1,3,3,0]},{"type":"attr","position":[1,5,3]}],
_observedAttributes :["isCollapsed","userName","userRole","userInitials","canViewCompanies","canViewContacts","canCreateContacts","canViewDeals","canViewActivities","canViewUsers","canViewProfiles","canViewRoles"],

	// 1. Ensure mixin is loaded
	// mixins: ["auth-mixin"],

	data: function() {
		return {
			isCollapsed: Lyte.attr("boolean", { default: false }),
			userName: Lyte.attr("string", { default: "User" }),
			userRole: Lyte.attr("string", { default: "Guest" }),
			userInitials: Lyte.attr("string", { default: "U" }),

			canViewCompanies: Lyte.attr("boolean", { default: false }),
			canViewContacts: Lyte.attr("boolean", { default: false }),
			canCreateContacts: Lyte.attr("boolean", { default: false }),
			canViewDeals: Lyte.attr("boolean", { default: false }),
			canViewActivities: Lyte.attr("boolean", { default: false }),
			canViewUsers: Lyte.attr("boolean", { default: false }),
			canViewProfiles: Lyte.attr("boolean", { default: false }),
			canViewRoles: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		let user = this.getAuthUser();
		console.log("Sidebar User Data:", user);

		if (user) {
			this.setData('userName', user.fullName);
			this.setData('userRole', user.roleName);
			this.setData('userInitials', user.fullName ? user.fullName.charAt(0) : "U");

			// Debug Permissions
			console.log("Checking Permissions...");
			let contactAccess = this.canAccess('contacts');
			console.log("Can Access Contacts?", contactAccess);

			this.setData('canViewCompanies', this.canAccess('companies'));
			this.setData('canViewContacts', contactAccess);
			this.setData('canCreateContacts', this.canAccess('contacts'));
			this.setData('canViewDeals', this.canAccess('deals'));
			this.setData('canViewActivities', this.canAccess('activities'));
			this.setData('canViewUsers', this.canAccess('users'));
			this.setData('canViewProfiles', this.canAccess('profiles'));
			this.setData('canViewRoles', this.canAccess('roles'));
		}
	},

	actions: {
		toggleSidebar: function() {
			this.setData('isCollapsed', !this.getData('isCollapsed'));
		},
		logout: function() {
			this.logoutUser();
		}
	},
	// Note: We removed the 'methods' block because 'canAccess'
	// is already provided by the auth-mixin.
}, { mixins: ["auth-mixin"] });