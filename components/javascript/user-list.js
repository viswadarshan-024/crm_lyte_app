Lyte.Component.register("user-list", {
	data: function() {
		return {
			// Data
			allUsers: Lyte.attr("array", { default: [] }),
			groupedUsers: Lyte.attr("array", { default: [] }), // The render target

			// Search
			searchTerm: Lyte.attr("string", { default: "" }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("You do not have permission to access this page");
			window.location.hash = "#/dashboard"; // Redirect
			return;
		}

		this.setData('canManage', true);
		this.loadUsers();
	},

	loadUsers: function() {
		this.setData('isLoading', true);

		this.crmGetUsers()
			.then((res) => {
				let rawList = [];
				// 1. ROBUST EXTRACTION
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// 2. NORMALIZE
				const cleanList = rawList.map(u => {
					let name = u.fullName || u.username || "Unknown";
					return {
						id: u.id,
						fullName: name,
						username: u.username || "",
						email: u.email || "",
						roleName: u.roleName || "No Role",
						profileName: u.profileName || "", // e.g. "Standard Profile"
						active: !!u.active, // Force boolean

						// Pre-calculate Visuals
						initials: this.getInitials(name),
						avatarColor: this.getAvatarColor(name)
					};
				});

				this.setData('allUsers', cleanList);
				this.groupUsers(); // Initial Grouping
			})
			.catch(err => {
				console.error("User load error", err);
				this.setData('allUsers', []);
				this.groupUsers();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// --- GROUPING & FILTERING ---

	groupUsers: function() {
		const all = this.getData('allUsers');
		const term = (this.getData('searchTerm') || "").toLowerCase().trim();

		// 1. Filter First
		let filtered = all;
		if (term) {
			filtered = all.filter(u =>
				u.fullName.toLowerCase().includes(term) ||
				u.username.toLowerCase().includes(term) ||
				u.email.toLowerCase().includes(term) ||
				u.roleName.toLowerCase().includes(term)
			);
		}

		// 2. Group by Role
		const groups = {};
		filtered.forEach(u => {
			const role = u.roleName;
			if (!groups[role]) groups[role] = [];
			groups[role].push(u);
		});

		// 3. Convert to Array for Template
		let finalGroups = [];
		// Optional: Sort roles alphabetically or specific order
		Object.keys(groups).sort().forEach(role => {
			finalGroups.push({
				roleName: role,
				count: groups[role].length,
				users: groups[role]
			});
		});

		this.setData('groupedUsers', finalGroups);
	},

	// --- HELPERS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	},

	actions: {
		onSearchInput: function() {
			// Debounce or immediate? Immediate is fine for local lists
			this.groupUsers();
		},

		createUser: function() {
			window.location.hash = "#/users/create";
		},

		viewUser: function(id) {
			window.location.hash = "#/users/" + id;
		},

		deleteUser: function(id, name) {
			// Use browser confirm or custom modal
			if (confirm("Are you sure you want to delete " + name + "? This cannot be undone.")) {
				this.crmDeleteUser(id).then((res) => {
					if (res.success) {
						alert("User deleted");
						this.loadUsers(); // Refresh list
					} else {
						alert(res.message || "Failed to delete user");
					}
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });