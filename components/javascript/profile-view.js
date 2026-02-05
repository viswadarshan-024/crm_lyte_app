Lyte.Component.register("profile-view", {
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