Lyte.Component.register("role-list", {
	data: function() {
		return {
			// Data
			roles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false }),

			// Modal State
			showCreateModal: Lyte.attr("boolean", { default: false }),
			isCreating: Lyte.attr("boolean", { default: false }),

			// New Role Form Data
			newRoleName: Lyte.attr("string", { default: "" }),
			newRoleParentId: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		// Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("You do not have permission to access this page");
			window.location.hash = "#/dashboard";
			return;
		}

		this.setData('canManage', true);
		this.loadRoles();
	},

	loadRoles: function() {
		this.setData('isLoading', true);

		this.crmGetRoles()
			.then((res) => {
				let rawList = [];
				// Robust Extraction
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// Normalize Data
				// The API returns 'reportsTo' as an object {id, name} or null
				const cleanList = rawList.map(r => ({
					id: r.id,
					roleName: r.roleName,
					// Safe access to nested object
					parentName: (r.reportsTo && r.reportsTo.name) ? r.reportsTo.name : null,
					parentId: (r.reportsTo && r.reportsTo.id) ? r.reportsTo.id : null,
					subordinateCount: (r.subordinates || []).length
				}));

				this.setData('roles', cleanList);
			})
			.catch(err => {
				console.error("Role load error", err);
				this.setData('roles', []);
			})
			.finally(() => this.setData('isLoading', false));
	},

	actions: {
		// --- MODAL ACTIONS ---
		openCreateModal: function() {
			this.setData('newRoleName', "");
			this.setData('newRoleParentId', "");
			this.setData('showCreateModal', true);
		},

		closeCreateModal: function() {
			this.setData('showCreateModal', false);
		},

		// --- CRUD ACTIONS ---
		createRole: function(e) {
			e.preventDefault();

			const name = this.getData('newRoleName');
			const parentId = this.getData('newRoleParentId');

			if (!name || name.trim() === "") {
				alert("Role name is required");
				return;
			}

			this.setData('isCreating', true);

			const payload = {
				roleName: name,
				parentRoleId: parentId ? parseInt(parentId) : null
			};

			this.crmCreateRole(payload)
				.then((res) => {
					if (res.success) {
						alert("Role created successfully");
						this.setData('showCreateModal', false);
						this.loadRoles(); // Refresh list
					} else {
						alert(res.message || "Failed to create role");
					}
				})
				.catch(err => alert("Error: " + err.message))
				.finally(() => this.setData('isCreating', false));
		},

		deleteRole: function(id, name) {
			if (confirm("Are you sure you want to delete role: " + name + "?")) {
				this.crmDeleteRole(id).then((res) => {
					if (res.success) {
						alert("Role deleted");
						this.loadRoles();
					} else {
						alert(res.message || "Failed to delete role");
					}
				});
			}
		},

		viewRole: function(id) {
			window.location.hash = "#/roles/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });