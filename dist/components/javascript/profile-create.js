Lyte.Component.register("profile-create", {
_template:"<template tag-name=\"profile-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Create Profile</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading permissions...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Profile Information</h3> <div class=\"form-group\"> <label>Profile Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" lyte-model=\"profileName\" class=\"form-input\" placeholder=\"e.g. Sales Manager\"> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" lyte-model=\"description\" class=\"form-textarea\" rows=\"3\" placeholder=\"Describe the role...\"></textarea> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Permissions</h3> <p class=\"section-subtitle\">Select the access levels for this profile.</p> <div class=\"permissions-list\"> <template is=\"for\" items=\"{{permissionGroups}}\" item=\"group\"> <div class=\"permission-group\" data-group-key=\"{{group.key}}\"> <div class=\"group-header\"> <div class=\"group-title\"> <div class=\"group-icon {{group.class}}\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> {{group.title}} </div> <button type=\"button\" class=\"btn-text-sm\" onclick=\"{{action('toggleGroup',group.key)}}\">Select All</button> </div> <div class=\"group-items\"> <template is=\"for\" items=\"{{group.list}}\" item=\"p\"> <label class=\"perm-checkbox\"> <input type=\"checkbox\" onchange=\"{{action('togglePermission',p.id,event)}}\"> <span>{{p.label}}</span> </label> </template> </div> </div> </template> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createProfile')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Profile</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 800px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.section-subtitle { font-size: 13px; color: #64748b; margin: -5px 0 15px 0; }\n\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* PERMISSION GROUPS */\n.permission-group {\n    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;\n    padding: 16px; margin-bottom: 16px;\n}\n.group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }\n.group-title { font-size: 14px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px; }\n\n.group-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }\n/* Colors matching view page */\n.group-icon.company { background: #dbeafe; color: #1e40af; }\n.group-icon.contact { background: #f3e8ff; color: #7c3aed; }\n.group-icon.deal { background: #dcfce7; color: #166534; }\n.group-icon.activity { background: #fef3c7; color: #854d0e; }\n.group-icon.user { background: #fce7f3; color: #db2777; }\n.group-icon.other { background: #f1f5f9; color: #475569; }\n\n.btn-text-sm { background: none; border: none; color: #2563eb; font-size: 12px; cursor: pointer; font-weight: 500; }\n.btn-text-sm:hover { text-decoration: underline; }\n\n.group-items {\n    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n    gap: 10px;\n}\n.perm-checkbox {\n    display: flex; align-items: center; gap: 8px; padding: 8px;\n    background: white; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; transition: all 0.2s;\n}\n.perm-checkbox:hover { border-color: #cbd5e1; }\n.perm-checkbox span { font-size: 13px; color: #334155; }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,5,1]},{"type":"for","position":[1,1,1,3,5,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,0]}]}]},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allPermissions","permissionGroups","selectedPermissionIds","profileName","description","isLoading","isSaving"],

	data: function() {
		return {
			// Data
			allPermissions: Lyte.attr("array", { default: [] }),
			permissionGroups: Lyte.attr("array", { default: [] }),
			selectedPermissionIds: Lyte.attr("array", { default: [] }), // IDs of selected perms

			// Form Data (Bound)
			profileName: Lyte.attr("string", { default: "" }),
			description: Lyte.attr("string", { default: "" }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/profiles";
			return;
		}
		this.loadPermissions();
	},

	loadPermissions: function() {
		this.setData('isLoading', true);

		// Assume apiRequest to permission.action returns list of { id, permissionCode, ... }
		this.crmGetPermissions()
			.then((res) => {
				const list = res.data || [];
				this.setData('allPermissions', list);
				this.groupPermissions(list);
			})
			.catch(err => {
				console.error("Perms Load Error", err);
				alert("Failed to load permissions");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	groupPermissions: function(perms) {
		const defs = {
			'COMPANY': { title: 'Company', icon: 'company', class: 'company' },
			'CONTACT': { title: 'Contact', icon: 'contact', class: 'contact' },
			'DEAL': { title: 'Deal', icon: 'deal', class: 'deal' },
			'ACTIVITY': { title: 'Activity', icon: 'activity', class: 'activity' },
			'USER': { title: 'Administration', icon: 'user', class: 'user' }
		};

		let groups = {};
		let other = [];

		perms.forEach(p => {
			const code = p.permissionCode;
			const prefix = code.split('_')[0];

			// Normalize Object
			const item = {
				id: p.id,
				code: code,
				label: this.formatPerm(code),
				checked: false
			};

			if (defs[prefix]) {
				if (!groups[prefix]) {
					groups[prefix] = { ...defs[prefix], key: prefix, list: [] };
				}
				groups[prefix].list.push(item);
			} else {
				other.push(item);
			}
		});

		let result = Object.values(groups);
		if (other.length > 0) {
			result.push({
				title: 'Other',
				icon: 'other',
				class: 'other',
				key: 'OTHER',
				list: other
			});
		}

		this.setData('permissionGroups', result);
	},

	formatPerm: function(code) {
		if (!code) return "";
		return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
	},

	actions: {
		togglePermission: function(permId, event) {
			let selected = this.getData('selectedPermissionIds') || [];
			// Ensure ID is number
			const id = parseInt(permId);

			if (event.target.checked) {
				if (!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedPermissionIds', selected);
		},

		toggleGroup: function(groupKey) {
			// Find the group in data
			const groups = this.getData('permissionGroups');
			const targetGroup = groups.find(g => g.key === groupKey);

			if (!targetGroup) return;

			let selected = this.getData('selectedPermissionIds') || [];

			// Check if all are currently selected to decide toggle direction
			const allIds = targetGroup.list.map(p => p.id);
			const allSelected = allIds.every(id => selected.includes(id));

			if (allSelected) {
				// Deselect All
				selected = selected.filter(id => !allIds.includes(id));
				// Update UI state manually (since checkboxes are not strictly two-way bound here)
				this.uncheckGroupDOM(groupKey);
			} else {
				// Select All
				allIds.forEach(id => {
					if (!selected.includes(id)) selected.push(id);
				});
				this.checkGroupDOM(groupKey);
			}

			this.setData('selectedPermissionIds', selected);
		},

		createProfile: function() {
			// 1. Direct DOM Reading for Safety
			const nameInput = document.getElementById('inp_name');
			const descInput = document.getElementById('inp_desc');

			const rawName = nameInput ? nameInput.value : "";
			const rawDesc = descInput ? descInput.value : "";
			const permIds = this.getData('selectedPermissionIds');

			// 2. Validation
			if (!rawName || rawName.trim() === "") {
				alert("Profile Name is required");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				name: rawName.trim(),
				description: rawDesc.trim(),
				permissionIds: permIds
			};

			this.crmCreateProfile(payload)
				.then((res) => {
					if (res.success) {
						alert("Profile created successfully!");
						window.location.hash = "#/profiles";
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Submission failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/profiles";
		}
	},

	// Helpers to update checkbox DOM visually during "Select All"
	checkGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) {
			groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
		}
	},
	uncheckGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) {
			groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
		}
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });