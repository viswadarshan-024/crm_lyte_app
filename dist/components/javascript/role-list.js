Lyte.Component.register("role-list", {
_template:"<template tag-name=\"role-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <h1 class=\"title\">Roles</h1> <p class=\"subtitle\">Manage organizational hierarchy and reporting lines.</p> </div> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('openCreateModal')}}\" class=\"btn-primary\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg> <span>Create Role</span> </button> </template></template> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading structure...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(roles.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\"> <div class=\"empty-icon-bg\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </div> <h3>No roles defined</h3> <p>Create your first role to establish the hierarchy.</p> <button onclick=\"{{action('openCreateModal')}}\" class=\"btn-secondary\">Create First Role</button> </div> </template><template case=\"false\"> <div class=\"roles-grid\"> <template is=\"for\" items=\"{{roles}}\" item=\"role\"> <div class=\"role-card\"> <div class=\"card-top\"> <div class=\"role-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </div> <div class=\"badge-id\">ID: {{role.id}}</div> </div> <div class=\"card-main\"> <h3 class=\"role-title\">{{role.roleName}}</h3> <div class=\"hierarchy-info\"> <template is=\"if\" value=\"{{role.parentName}}\"><template case=\"true\"> <div class=\"report-line\"> <span class=\"icon-arrow\">↳</span> <span class=\"label\">Reports to:</span> <span class=\"value\">{{role.parentName}}</span> </div> </template><template case=\"false\"> <div class=\"report-line top\"> <span class=\"icon-crown\">👑</span> <span class=\"value\">Top Level Role</span> </div> </template></template> </div> <div class=\"sub-count\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> {{role.subordinateCount}} direct reports </div> </div> <div class=\"card-footer\"> <button onclick=\"{{action('viewRole',role.id)}}\" class=\"btn-text\">View Details</button> <button onclick=\"{{action('deleteRole',role.id,role.roleName)}}\" class=\"btn-icon-danger\" title=\"Delete\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg> </button> </div> </div> </template> </div> </template></template> </template></template> <template is=\"if\" value=\"{{showCreateModal}}\"><template case=\"true\"> <div class=\"modal-backdrop\"> <div class=\"modal-window\"> <div class=\"modal-head\"> <h3>Create New Role</h3> <button onclick=\"{{action('closeCreateModal')}}\" class=\"btn-close\">×</button> </div> <form onsubmit=\"{{action('createRole',event)}}\"> <div class=\"modal-content\"> <div class=\"form-group\"> <label>Role Name <span class=\"required\">*</span></label> <input type=\"text\" lyte-model=\"newRoleName\" class=\"clean-input\" placeholder=\"e.g. Sales Manager\" autofocus=\"\"> </div> <div class=\"form-group\"> <label>Reports To</label> <div class=\"select-wrapper\"> <select lyte-model=\"newRoleParentId\" class=\"clean-select\"> <option value=\"\">No Parent (Top Level)</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"r\"></option> </select> <span class=\"select-arrow\">▼</span> </div> <p class=\"input-hint\">Defines who this role reports to in the hierarchy.</p> </div> </div> <div class=\"modal-foot\"> <button type=\"button\" onclick=\"{{action('closeCreateModal')}}\" class=\"btn-ghost\">Cancel</button> <button type=\"submit\" class=\"btn-primary\" disabled=\"{{isCreating}}\"> <template is=\"if\" value=\"{{isCreating}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Role</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* --- LAYOUT --- */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc; /* Very light blue-grey */\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n    box-sizing: border-box;\n}\n\n/* --- HEADER --- */\n.page-header {\n    display: flex; justify-content: space-between; align-items: center;\n    margin-bottom: 24px; flex-shrink: 0;\n}\n.title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }\n.subtitle { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }\n\n.btn-primary {\n    background: #2563eb; color: white; border: none;\n    padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;\n    cursor: pointer; display: flex; align-items: center; gap: 6px;\n    transition: background 0.2s;\n}\n.btn-primary:hover { background: #1d4ed8; }\n.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }\n\n/* --- GRID --- */\n.roles-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 20px;\n    padding-bottom: 40px;\n    flex-grow: 1; overflow-y: auto; min-height: 0;\n}\n\n/* --- CARD DESIGN --- */\n.role-card {\n    background: white; border-radius: 12px;\n    border: 1px solid #e2e8f0;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n    display: flex; flex-direction: column;\n    transition: transform 0.2s, box-shadow 0.2s;\n    overflow: hidden;\n}\n.role-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);\n    border-color: #cbd5e1;\n}\n\n/* Card Top */\n.card-top {\n    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;\n}\n.role-icon {\n    width: 36px; height: 36px; border-radius: 8px;\n    background: #eff6ff; color: #3b82f6;\n    display: flex; align-items: center; justify-content: center;\n}\n.badge-id {\n    font-size: 11px; font-weight: 600; color: #64748b;\n    background: #f1f5f9; padding: 2px 8px; border-radius: 12px;\n}\n\n/* Card Main */\n.card-main { padding: 0 20px 20px 20px; flex-grow: 1; }\n.role-title { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e293b; }\n\n.hierarchy-info {\n    margin-bottom: 12px; font-size: 13px;\n    background: #f8fafc; padding: 8px 12px; border-radius: 6px;\n}\n.report-line { display: flex; align-items: center; gap: 6px; }\n.icon-arrow { color: #94a3b8; font-size: 14px; }\n.icon-crown { font-size: 14px; }\n.label { color: #64748b; }\n.value { color: #334155; font-weight: 500; }\n\n.sub-count {\n    font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;\n}\n\n/* Card Footer */\n.card-footer {\n    padding: 12px 20px; border-top: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n    background: #fff;\n}\n.btn-text { background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; }\n.btn-text:hover { text-decoration: underline; }\n\n.btn-icon-danger {\n    background: none; border: none; color: #cbd5e1; cursor: pointer;\n    padding: 4px; border-radius: 4px; transition: all 0.2s;\n}\n.btn-icon-danger:hover { color: #ef4444; background: #fee2e2; }\n\n/* --- MODAL --- */\n.modal-backdrop {\n    position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px);\n    display: flex; align-items: center; justify-content: center; z-index: 50;\n}\n.modal-window {\n    background: white; width: 420px; border-radius: 12px;\n    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);\n    animation: slideUp 0.3s ease-out;\n}\n@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }\n\n.modal-head {\n    padding: 20px; border-bottom: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n}\n.modal-head h3 { margin: 0; font-size: 18px; color: #0f172a; }\n.btn-close { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }\n\n.modal-content { padding: 24px; }\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.clean-input, .clean-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px;\n    font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;\n}\n.clean-input:focus, .clean-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.select-wrapper { position: relative; }\n.select-arrow { position: absolute; right: 12px; top: 12px; font-size: 10px; color: #64748b; pointer-events: none; }\n.clean-select { appearance: none; background: white; }\n\n.input-hint { font-size: 12px; color: #94a3b8; margin: 6px 0 0 0; }\n\n.modal-foot {\n    padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9;\n    border-radius: 0 0 12px 12px; display: flex; justify-content: flex-end; gap: 12px;\n}\n.btn-ghost { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }\n.btn-ghost:hover { background: #f1f5f9; }\n\n/* LOADING & EMPTY */\n.loading-state, .empty-state { text-align: center; color: #64748b; padding-top: 60px; }\n.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s infinite linear; }\n.empty-icon-bg { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #94a3b8; }\n.empty-state h3 { margin: 0 0 8px 0; color: #1e293b; }\n.empty-state p { margin: 0 0 24px 0; font-size: 14px; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,7]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,3,1]},{"type":"text","position":[1,3,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"if","position":[1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,5,0]}]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,5,3]},{"type":"attr","position":[1,5,1]},{"type":"attr","position":[1,5,3]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,1,3,1,3,3,1,3]},{"type":"for","position":[1,1,3,1,3,3,1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"r\"> <option value=\"{{r.id}}\">{{r.roleName}}</option> </template>"},{"type":"attr","position":[1,1,3,3,1]},{"type":"attr","position":[1,1,3,3,3]},{"type":"attr","position":[1,1,3,3,3,1]},{"type":"if","position":[1,1,3,3,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roles","isLoading","canManage","showCreateModal","isCreating","newRoleName","newRoleParentId"],

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