Lyte.Component.register("profile-create", {
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