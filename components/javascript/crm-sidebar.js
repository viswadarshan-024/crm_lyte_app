Lyte.Component.register("crm-sidebar", {
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