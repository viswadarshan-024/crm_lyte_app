Lyte.Component.register("crm-sidebar", {
_template:"<template tag-name=\"crm-sidebar\"> <div class=\"sidebar-inner {{expHandlers(isCollapsed,'?:','collapsed','')}}\"> <div class=\"sidebar-header\"> <div class=\"logo\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path><path d=\"M2 12l10 5 10-5\"></path></svg> </div> <span class=\"logo-text\" onclick=\"{{action('toggleSidebar')}}\">Mini CRM</span> </div> <nav class=\"sidebar-nav\"> <a href=\"#/dashboard\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Dashboard</span> </a> <br> <template is=\"if\" value=\"{{canViewCompanies}}\"> <a href=\"#/companies\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Companies</span> </a> </template> <br> <a href=\"#/contacts\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Contacts</span> </a> </nav> <div class=\"sidebar-footer\"> <div class=\"user-info\"> <div class=\"avatar\">{{userInitials}}</div> <div class=\"details\"> <span class=\"name\">{{userName}}</span> <span class=\"role\">{{userRole}}</span> </div> </div> <button onclick=\"{{action('logout')}}\" class=\"logout-btn\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><polyline points=\"16 17 21 12 16 7\"></polyline><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"></line></svg> </button> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{},"default":{}},{"type":"text","position":[1,5,1,1,0]},{"type":"text","position":[1,5,1,3,1,0]},{"type":"text","position":[1,5,1,3,3,0]},{"type":"attr","position":[1,5,3]}],
_observedAttributes :["isCollapsed","userName","userRole","userInitials"],

	services: ["auth"],

	data: function() {
		return {
			isCollapsed: Lyte.attr("boolean", { default: false }),
			userName: Lyte.attr("string", { default: "User" }),
			userRole: Lyte.attr("string", { default: "Guest" }),
			userInitials: Lyte.attr("string", { default: "U" })
		}
	},

	didConnect: function() {
		let auth = this.auth;

		if (auth) {
			auth.init();
			let user = auth.getUser();

			if (user) {
				this.setData('userName', user.fullName);
				this.setData('userRole', user.roleName);
				this.setData('userInitials', user.fullName ? user.fullName.charAt(0) : "U");

				this.setData('canViewCompanies', auth.canAccess('companies'));
				this.setData('canViewContacts', auth.canAccess('contacts'));
				this.setData('canCreateContacts', auth.canAccess('contacts'));
			}
		}
	},

	actions: {
		toggleSidebar: function() {
			this.setData('isCollapsed', !this.getData('isCollapsed'));
		},

		logout: function() {
			localStorage.removeItem('user');
			window.location.href = "/login.html";
		}
	},

	methods: {
		canAccess: function(module) {
			return this.auth.canAccess(module);
		}
	}
});