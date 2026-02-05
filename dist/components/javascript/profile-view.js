Lyte.Component.register("profile-view", {
_template:"<template tag-name=\"profile-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Profile Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading permissions...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"profile-header-card\"> <div class=\"profile-icon\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"></line><line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"></line></svg> </div> <div class=\"profile-info\"> <h2>{{profile.name}}</h2> <div class=\"desc\">{{profile.description}}</div> <div class=\"meta\">{{totalCount}} permissions assigned</div> </div> <div class=\"profile-actions\"> <button onclick=\"{{action('editProfile')}}\" class=\"btn-primary\">Edit Profile</button> <button onclick=\"{{action('deleteProfile')}}\" class=\"btn-danger-ghost\">Delete</button> </div> </div> <div class=\"profile-body\"> <h3 class=\"section-title\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> Permissions </h3> <template is=\"if\" value=\"{{expHandlers(totalCount,'===',0)}}\"><template case=\"true\"> <div class=\"empty-perms\"> <p>No permissions assigned.</p> <button onclick=\"{{action('editProfile')}}\" class=\"btn-sm\">Add Permissions</button> </div> </template><template case=\"false\"> <div class=\"permissions-grid\"> <template is=\"for\" items=\"{{permissionGroups}}\" item=\"group\"> <div class=\"permission-group\"> <div class=\"group-title\"> <div class=\"group-icon {{group.class}}\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> {{group.title}} </div> <div class=\"group-list\"> <template is=\"for\" items=\"{{group.list}}\" item=\"p\"> <div class=\"perm-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"check\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg> {{p}} </div> </template> </div> </div> </template> </div> </template></template> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.profile-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 24px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.profile-icon {\n    width: 72px; height: 72px; border-radius: 12px;\n    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.profile-info h2 { margin: 0 0 4px 0; font-size: 24px; color: #1e293b; }\n.desc { font-size: 14px; color: #64748b; margin-bottom: 8px; }\n.meta { font-size: 13px; color: #94a3b8; }\n.profile-actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-primary { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-weight: 500; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* BODY */\n.profile-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title {\n    font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 20px;\n    display: flex; align-items: center;\n}\n.mr-2 { margin-right: 8px; }\n\n/* PERMISSION GRID */\n.permissions-grid {\n    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 20px;\n}\n.permission-group {\n    background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;\n}\n.group-title {\n    font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px;\n    display: flex; align-items: center; gap: 8px;\n}\n.group-icon {\n    width: 24px; height: 24px; border-radius: 4px;\n    display: flex; align-items: center; justify-content: center;\n}\n/* Icon Colors */\n.group-icon.company { background: #dbeafe; color: #1e40af; }\n.group-icon.contact { background: #f3e8ff; color: #7c3aed; }\n.group-icon.deal { background: #dcfce7; color: #166534; }\n.group-icon.activity { background: #fef3c7; color: #854d0e; }\n.group-icon.user { background: #fce7f3; color: #db2777; }\n.group-icon.other { background: #f1f5f9; color: #475569; }\n\n.group-list { display: flex; flex-direction: column; gap: 8px; }\n.perm-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }\n.check { color: #10b981; flex-shrink: 0; }\n\n.empty-perms { text-align: center; color: #94a3b8; padding: 40px; }\n.btn-sm { margin-top: 10px; padding: 6px 12px; border: 1px solid #2563eb; color: #2563eb; background: white; border-radius: 4px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,0]},{"type":"text","position":[1,1,3,5,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1,1,1]},{"type":"text","position":[1,1,3]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"text","position":[1,3]}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["profileId","profile","permissionGroups","totalCount","isLoading","canManage"],

	data: function() {
		return {
			profileId: Lyte.attr("string", { default: "" }),

			// Data Models
			profile: Lyte.attr("object", { default: {} }),

			// Grouped Permissions for Template Loop
			// Structure: [{ title: "Deals", icon: "deal", perms: ["Create", "Edit"] }, ...]
			permissionGroups: Lyte.attr("array", { default: [] }),
			totalCount: Lyte.attr("number", { default: 0 }),

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
		const params = this.getData('params');
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/profiles";
			return;
		}

		this.setData('profileId', id);
		this.loadProfile();
	},

	loadProfile: function() {
		this.setData('isLoading', true);
		const id = this.getData('profileId');

		this.crmGetProfile(id)
			.then((res) => {
				const data = res.data || {};

				this.setData('profile', {
					id: data.id,
					name: data.name,
					description: data.description || "",
				});

				const rawPerms = data.permissions || [];
				this.setData('totalCount', rawPerms.length);

				// Group permissions
				this.groupPermissions(rawPerms);
			})
			.catch(err => {
				console.error("Profile Load Error", err);
				alert("Failed to load profile");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- GROUPING LOGIC ---
	groupPermissions: function(perms) {
		// Definitions
		const defs = {
			'COMPANY': { title: 'Company', icon: 'company', class: 'company' },
			'CONTACT': { title: 'Contact', icon: 'contact', class: 'contact' },
			'DEAL': { title: 'Deal', icon: 'deal', class: 'deal' },
			'ACTIVITY': { title: 'Activity', icon: 'activity', class: 'activity' },
			'USER': { title: 'Administration', icon: 'user', class: 'user' }
		};

		let groups = {};
		let other = [];

		perms.forEach(code => {
			const prefix = code.split('_')[0]; // e.g., "DEAL" from "DEAL_CREATE"

			if (defs[prefix]) {
				if (!groups[prefix]) {
					groups[prefix] = { ...defs[prefix], list: [] };
				}
				groups[prefix].list.push(this.formatPerm(code));
			} else {
				other.push(this.formatPerm(code));
			}
		});

		// Convert Map to Array
		let result = Object.values(groups);

		// Add "Other" if any
		if (other.length > 0) {
			result.push({
				title: 'Other',
				icon: 'other',
				class: 'other',
				list: other
			});
		}

		this.setData('permissionGroups', result);
	},

	formatPerm: function(code) {
		if (!code) return "";
		// DEAL_VIEW_SELF -> Deal View Self
		return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/profiles";
		},

		editProfile: function() {
			const id = this.getData('profileId');
			window.location.hash = "#/profiles/edit/" + id;
		},

		deleteProfile: function() {
			if (confirm("Delete this profile? Users with this profile will lose permissions.")) {
				this.crmDeleteProfile(this.getData('profileId')).then((res) => {
					if (res.success) {
						alert("Profile deleted");
						window.location.hash = "#/profiles";
					} else {
						alert("Failed: " + res.message);
					}
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });