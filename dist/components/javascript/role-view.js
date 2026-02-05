Lyte.Component.register("role-view", {
_template:"<template tag-name=\"role-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Role Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading role...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"role-header-card\"> <div class=\"role-icon\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> </div> <div class=\"role-info\"> <h2>{{role.roleName}}</h2> <div class=\"role-meta\">ID: {{role.id}}</div> </div> <div class=\"role-actions\"> <button onclick=\"{{action('deleteRole')}}\" class=\"btn-danger-ghost\">Delete Role</button> </div> </div> <div class=\"role-body\"> <h3 class=\"section-title\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><polyline points=\"17 11 12 6 7 11\"></polyline><polyline points=\"17 18 12 13 7 18\"></polyline></svg> Hierarchy </h3> <div class=\"hierarchy-card\"> <div class=\"hierarchy-item\"> <div class=\"label\">Reports To:</div> <div class=\"value\"> <template is=\"if\" value=\"{{role.reportsTo}}\"><template case=\"true\"> <a onclick=\"{{action('navigateToRole',role.reportsTo.id)}}\" class=\"role-link parent\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"17 11 12 6 7 11\"></polyline></svg> {{role.reportsTo.name}} </a> </template><template case=\"false\"> <span class=\"text-secondary\">None (Top-level role)</span> </template></template> </div> </div> <div class=\"h-divider\"></div> <div class=\"hierarchy-item\"> <div class=\"label\">Subordinates:</div> <div class=\"value\"> <template is=\"if\" value=\"{{expHandlers(role.subordinates.length,'>',0)}}\"><template case=\"true\"> <div class=\"sub-list\"> <template is=\"for\" items=\"{{role.subordinates}}\" item=\"sub\"> <a onclick=\"{{action('navigateToRole',sub.id)}}\" class=\"role-link child\"> {{sub.name}} </a> </template> </div> </template><template case=\"false\"> <span class=\"text-secondary\">None</span> </template></template> </div> </div> </div> <div class=\"info-note\"> <div class=\"note-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"note-text\"> <strong>Note:</strong> Roles define organizational hierarchy and data visibility scope. Permissions are managed through Profiles. </div> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.role-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 20px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.role-icon {\n    width: 64px; height: 64px; border-radius: 12px;\n    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.role-info h2 { margin: 0 0 4px 0; font-size: 22px; color: #1e293b; }\n.role-meta { color: #64748b; font-size: 14px; }\n.role-actions { margin-left: auto; }\n\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-weight: 500; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* BODY */\n.role-body { padding: 0 10px; }\n.section-title {\n    font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px;\n    display: flex; align-items: center;\n}\n.mr-2 { margin-right: 8px; }\n\n/* HIERARCHY CARD */\n.hierarchy-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 20px; margin-bottom: 24px;\n}\n.hierarchy-item { display: flex; align-items: flex-start; padding: 12px 0; }\n.label { width: 120px; font-size: 13px; color: #64748b; font-weight: 500; padding-top: 2px; }\n.value { flex: 1; font-size: 14px; color: #1e293b; }\n\n.text-secondary { color: #94a3b8; font-style: italic; }\n\n.role-link {\n    color: #2563eb; cursor: pointer; text-decoration: none; font-weight: 500;\n    display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px;\n    border-radius: 6px; transition: background 0.2s;\n}\n.role-link:hover { background: #eff6ff; }\n.role-link.parent { color: #7c3aed; } /* Purple for parent */\n.role-link.parent:hover { background: #f5f3ff; }\n\n.sub-list { display: flex; flex-wrap: wrap; gap: 8px; }\n.role-link.child { background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; }\n.role-link.child:hover { border-color: #cbd5e1; background: #fff; }\n\n.h-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }\n\n/* NOTE */\n.info-note {\n    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);\n    border: 1px solid #bae6fd; border-radius: 8px;\n    padding: 15px; display: flex; gap: 15px; align-items: flex-start;\n}\n.note-icon { color: #0284c7; flex-shrink: 0; }\n.note-text { color: #334155; font-size: 13px; line-height: 1.5; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,1]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,3,3,1,3,1]},{"type":"if","position":[1,3,3,1,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,3]}]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,3,5,3,1]},{"type":"if","position":[1,3,3,5,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roleId","role","isLoading","canManage"],

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