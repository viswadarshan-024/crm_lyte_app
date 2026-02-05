Lyte.Component.register("user-view", {
	data: function() {
		return {
			userId: Lyte.attr("string", { default: "" }),

			// Data Model
			user: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			teamMembers: Lyte.attr("array", { default: [] }),

			// Visuals
			avatarColor: Lyte.attr("string", { default: "#cbd5e1" }),
			initials: Lyte.attr("string", { default: "" }),

			// State
			currentTab: Lyte.attr("string", { default: "deals" }), // 'deals', 'team'
			isLoading: Lyte.attr("boolean", { default: true }),

			// Permissions
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
			window.location.hash = "#/users";
			return;
		}

		this.setData('userId', id);
		this.loadUser();
	},

	loadUser: function() {
		this.setData('isLoading', true);
		const id = this.getData('userId');

		// Note: Mixin likely needs crmGetUser(id) mapping to user-view-detail.action
		// If not in mixin, we can use generic apiRequest
		this.apiRequest('user-view-detail.action?id=' + id, { method: 'GET' })
			.then((res) => {
				const data = res.data || {};

				// 1. Core User Data
				this.setData('user', {
					id: data.id,
					fullName: data.fullName,
					email: data.email,
					username: data.username,
					roleName: data.roleName || "No Role",
					profileName: data.profileName || "No Profile",
					active: !!data.active,
					reportsTo: data.reportsTo || "-",
					teamSize: data.teamSize || 0
				});

				// 2. Visuals
				this.setData('initials', this.getInitials(data.fullName));
				this.setData('avatarColor', this.getAvatarColor(data.fullName));

				// 3. Lists
				this.setData('deals', this.normalizeDeals(data.deals || []));
				this.setData('teamMembers', this.normalizeTeam(data.teamMembers || []));

			})
			.catch(err => {
				console.error("User Load Error", err);
				alert("Failed to load user details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- NORMALIZERS ---
	normalizeDeals: function(list) {
		return list.map(d => ({
			...d,
			formattedAmount: this.formatMoney(d.amount),
			statusClass: this.getStatusClass(d.status)
		}));
	},

	normalizeTeam: function(list) {
		return list.map(m => ({
			...m,
			initials: this.getInitials(m.fullName),
			avatarColor: this.getAvatarColor(m.fullName)
		}));
	},

	// --- UTILS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
		return colors[Math.abs(hash) % colors.length];
	},

	formatMoney: function(amount) {
		if (amount == null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	getStatusClass: function(status) {
		if(!status) return "badge-gray";
		const map = { NEW: 'badge-blue', WON: 'badge-green', LOST: 'badge-red', IN_PROGRESS: 'badge-yellow' };
		return map[status] || "badge-gray";
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},

		goBack: function() {
			window.location.hash = "#/users";
		},

		editUser: function() {
			// Placeholder for Edit Route
			const id = this.getData('userId');
			window.location.hash = "#/users/edit/" + id;
		},

		deleteUser: function() {
			if (confirm("Delete this user? This cannot be undone.")) {
				this.crmDeleteUser(this.getData('userId')).then((res) => {
					if (res.success) {
						alert("User deleted");
						window.location.hash = "#/users";
					} else {
						alert("Failed to delete: " + res.message);
					}
				});
			}
		},

		viewDeal: function(id) {
			window.location.hash = "#/deals/" + id;
		},

		viewUser: function(id) {
			window.location.hash = "#/users/" + id;
			// Force reload if same component
			this.setData('userId', id);
			this.loadUser();
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });