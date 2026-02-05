Lyte.Component.register("profile-list", {
	data: function() {
		return {
			// Data
			profiles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			openDropdownId: Lyte.attr("string", { default: null }), // Tracks which menu is open
			canManage: Lyte.attr("boolean", { default: false })
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

		// Close dropdowns when clicking anywhere else
		document.addEventListener('click', this.closeAllDropdowns.bind(this));

		this.loadProfiles();
	},

	didDestroy: function() {
		document.removeEventListener('click', this.closeAllDropdowns.bind(this));
	},

	// Helper to close menus
	closeAllDropdowns: function() {
		this.setData('openDropdownId', null);
	},

	loadProfiles: function() {
		this.setData('isLoading', true);

		this.crmGetProfiles()
			.then((res) => {
				let rawList = [];
				// 1. EXTRACTION
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// 2. NORMALIZE
				const cleanList = rawList.map(p => {
					let perms = p.permissions || [];

					// Logic for "First 5 + More"
					const maxVisible = 5;
					const visibleRaw = perms.slice(0, maxVisible);
					const remaining = perms.length - maxVisible;

					// Format strings (DEAL_CREATE -> Deal Create)
					const formattedVisible = visibleRaw.map(code => this.formatPermString(code));

					return {
						id: p.id,
						name: p.name,
						description: p.description || "",
						totalCount: perms.length,
						visiblePermissions: formattedVisible,
						remainingCount: remaining > 0 ? remaining : 0
					};
				});

				this.setData('profiles', cleanList);
			})
			.catch(err => {
				console.error("Profile load error", err);
				this.setData('profiles', []);
			})
			.finally(() => this.setData('isLoading', false));
	},

	// Helper: Formats "DEAL_CREATE" -> "Deal Create"
	formatPermString: function(code) {
		if (!code) return "";
		return code.split('_')
			.map(word => word.charAt(0) + word.slice(1).toLowerCase())
			.join(' ');
	},

	actions: {
		createProfile: function() {
			window.location.hash = "#/profiles/create";
		},

		viewProfile: function(id) {
			window.location.hash = "#/profiles/" + id;
		},

		editProfile: function(id) {
			window.location.hash = "#/profiles/edit/" + id;
		},

		// Dropdown Logic
		toggleDropdown: function(id, event) {
			event.stopPropagation(); // Stop document click from firing immediately
			let current = this.getData('openDropdownId');

			if (current === String(id)) {
				this.setData('openDropdownId', null); // Close if same
			} else {
				this.setData('openDropdownId', String(id)); // Open new
			}
		},

		deleteProfile: function(id, name) {
			if (confirm("Are you sure you want to delete profile: " + name + "? Users with this profile will lose permissions.")) {
				this.crmDeleteProfile(id).then((res) => {
					if (res.success) {
						alert("Profile deleted");
						this.loadProfiles();
					} else {
						alert(res.message || "Failed to delete");
					}
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });