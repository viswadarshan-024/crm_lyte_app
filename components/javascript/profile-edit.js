Lyte.Component.register("profile-edit", {
	data: function() {
		return {
			profileId: Lyte.attr("string", { default: "" }),

			// Data
			profile: Lyte.attr("object", { default: {} }),
			permissionGroups: Lyte.attr("array", { default: [] }),
			selectedPermissionIds: Lyte.attr("array", { default: [] }),

			// UI State
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

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/profiles";
			return;
		}

		this.setData('profileId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('profileId');

		// Parallel Fetch: Profile + All Permissions
		Promise.all([
			this.crmGetProfile(id),
			this.crmGetPermissions()
		]).then((responses) => {
			const [profRes, permRes] = responses;

			if (!profRes.success) throw new Error(profRes.message);

			// 1. Process Profile
			const profile = profRes.data || {};
			this.setData('profile', profile);

			// 2. Process Permissions & Pre-selection
			const allPerms = permRes.data || [];

			// Profile has list of codes ["DEAL_READ", ...]. Need to find matching IDs.
			const currentCodes = profile.permissions || [];
			const preSelected = [];

			allPerms.forEach(p => {
				if (currentCodes.includes(p.permissionCode)) {
					preSelected.push(p.id);
				}
			});
			this.setData('selectedPermissionIds', preSelected);

			// Group them for UI (Reusing logic from Create)
			this.groupPermissions(allPerms);

			// 3. Force Populate Text Inputs
			setTimeout(() => {
				this.populateForm(profile);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load profile data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};
		setVal('inp_name', data.name);
		setVal('inp_desc', data.description);
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
		const selected = this.getData('selectedPermissionIds');

		perms.forEach(p => {
			const code = p.permissionCode;
			const prefix = code.split('_')[0];

			const item = {
				id: p.id,
				code: code,
				label: this.formatPerm(code),
				// Add checked state for template
				isChecked: selected.includes(p.id)
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
			const id = parseInt(permId);

			if (event.target.checked) {
				if (!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedPermissionIds', selected);
		},

		toggleGroup: function(groupKey) {
			const groups = this.getData('permissionGroups');
			const targetGroup = groups.find(g => g.key === groupKey);
			if (!targetGroup) return;

			let selected = this.getData('selectedPermissionIds') || [];
			const allIds = targetGroup.list.map(p => p.id);
			const allSelected = allIds.every(id => selected.includes(id));

			if (allSelected) {
				// Deselect All
				selected = selected.filter(id => !allIds.includes(id));
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

		updateProfile: function() {
			const name = document.getElementById('inp_name').value.trim();
			const desc = document.getElementById('inp_desc').value.trim();

			// 1. Get raw array from Lyte data
			const rawPerms = this.getData('selectedPermissionIds');

			if (!name) { alert("Profile Name is required"); return; }

			this.setData('isSaving', true);

			// 2. Ensure permissions are clean numbers (or strings that are valid numbers)
			// Struts2 needs: permissionIds=1, permissionIds=2
			// Our api-mixin handles arrays correctly, so we just need to ensure 'rawPerms' is a simple array

			// Convert to array if it's a Set (though Lyte uses arrays usually)
			const permissionIdsArray = Array.isArray(rawPerms) ? rawPerms : Array.from(rawPerms);

			const payload = {
				id: parseInt(this.getData('profileId')),
				name: name,
				description: desc,
				// Pass the CLEAN array. The updated api-mixin will loop this
				// and append 'permissionIds=1&permissionIds=2...' which is correct.
				permissionIds: permissionIdsArray
			};

			this.crmUpdateProfile(payload)
				.then((res) => {
					if (res.success) {
						alert("Profile updated successfully!");
						window.location.hash = "#/profiles/view/" + this.getData('profileId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/profiles/" + this.getData('profileId');
		}
	},

	// UI Helpers
	checkGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
	},
	uncheckGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });