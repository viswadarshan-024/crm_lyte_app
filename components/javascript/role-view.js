Lyte.Component.register("role-view", {
	data: function() {
		return {
			roleId: Lyte.attr("string", { default: "" }),
			role: Lyte.attr("object", { default: {} }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// 1. Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/dashboard";
			return;
		}
		this.setData('canManage', true);

		// 2. Get ID
		const params = this.getData('params'); // Router params
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/roles";
			return;
		}

		this.setData('roleId', id);
		this.loadRole();
	},

	// Observer: Reload data if the user clicks a link to another role
	// This handles navigation within the same component
	roleIdObserver: function() {
		this.loadRole();
	}.observes('roleId'),

	loadRole: function() {
		this.setData('isLoading', true);
		const id = this.getData('roleId');

		this.crmGetRole(id)
			.then((res) => {
				// API returns { data: { id: 1, roleName: "...", ... } }
				const data = res.data || {};

				this.setData('role', {
					id: data.id,
					roleName: data.roleName,
					// Handle null 'reportsTo' safely
					reportsTo: data.reportsTo || null,
					// Handle empty 'subordinates' safely
					subordinates: data.subordinates || []
				});
			})
			.catch(err => {
				console.error("Role Load Error", err);
				alert("Failed to load role details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/roles";
		},

		deleteRole: function() {
			const role = this.getData('role');
			if (confirm(`Delete role "${role.roleName}"? Users must be reassigned.`)) {
				this.crmDeleteRole(role.id).then((res) => {
					if (res.success) {
						alert("Role deleted");
						window.location.hash = "#/roles";
					} else {
						alert("Failed: " + res.message);
					}
				});
			}
		},

		// Action to navigate to another role (Child/Parent)
		navigateToRole: function(id) {
			window.location.hash = "#/roles/" + id;
			// Manually update data if hash change doesn't trigger component reload
			this.setData('roleId', id);
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });