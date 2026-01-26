Lyte.Component.register("crm-sidebar", {
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