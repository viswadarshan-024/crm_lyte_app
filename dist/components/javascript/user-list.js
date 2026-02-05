Lyte.Component.register("user-list", {
_template:"<template tag-name=\"user-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Users</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createUser')}}\" class=\"add-btn\"> <span>+ Add User</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search users...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading users...</p> </div> </template><template case=\"false\"> <div class=\"users-list-container\"> <template is=\"if\" value=\"{{expHandlers(groupedUsers.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No users found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{groupedUsers}}\" item=\"group\" index=\"i\"> <div class=\"role-section\"> <div class=\"role-header\"> <div class=\"role-title\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> {{group.roleName}} </div> <span class=\"role-count\">{{group.count}} user(s)</span> </div> <div class=\"role-users\"> <template is=\"for\" items=\"{{group.users}}\" item=\"u\" index=\"j\"> <div class=\"user-card {{expHandlers(u.active,'?:','','user-inactive')}}\"> <div class=\"user-avatar\" style=\"background-color: {{u.avatarColor}}\"> {{u.initials}} </div> <div class=\"user-info\"> <div class=\"user-name-row\"> <span class=\"u-name\">{{u.fullName}}</span> <template is=\"if\" value=\"{{u.active}}\"><template case=\"true\"> <span class=\"badge badge-success\">Active</span> </template><template case=\"false\"> <span class=\"badge badge-danger\">Inactive</span> </template></template> </div> <div class=\"user-meta\"> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94\"></path></svg> {{u.username}} </span> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> {{u.email}} </span> </div> </div> <template is=\"if\" value=\"{{u.profileName}}\"><template case=\"true\"> <div class=\"user-badges\"> <span class=\"badge badge-profile\">{{u.profileName}}</span> </div> </template></template> <div class=\"user-actions\"> <button onclick=\"{{action('viewUser',u.id)}}\" class=\"btn-icon-sm\" title=\"View\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg> </button> <button onclick=\"{{action('deleteUser',u.id,u.fullName)}}\" class=\"btn-icon-sm text-danger\" title=\"Delete\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg> </button> </div> </div> </template> </div> </div> </template> </template></template> </div> </template></template> </div> </template>\n<style>/* 1. LAYOUT & SCROLLING */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n}\n\n.page-header, .controls-bar {\n    flex-shrink: 0;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar { margin-bottom: 25px; }\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 2. MAIN LIST SCROLL */\n.users-list-container {\n    flex-grow: 1;\n    overflow-y: auto;\n    min-height: 0;\n    padding-bottom: 20px;\n}\n\n/* 3. ROLES & CARDS */\n.role-section { margin-bottom: 20px; }\n\n.role-header {\n    display: flex; align-items: center; justify-content: space-between;\n    padding: 10px 15px; background-color: #f1f5f9;\n    border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; border-bottom: none;\n}\n.role-title { font-size: 13px; font-weight: 600; color: #334155; display: flex; gap: 8px; align-items: center; }\n.role-count { font-size: 11px; background: white; padding: 2px 8px; border-radius: 10px; color: #64748b; }\n\n.role-users {\n    border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;\n    background: white;\n}\n\n.user-card {\n    display: flex; align-items: center; gap: 15px;\n    padding: 15px; border-bottom: 1px solid #f1f5f9;\n}\n.user-card:last-child { border-bottom: none; }\n.user-card:hover { background-color: #f8fafc; }\n.user-inactive { background-color: #f9fafb; opacity: 0.8; }\n\n/* 4. USER DETAILS */\n.user-avatar {\n    width: 42px; height: 42px; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: 600; font-size: 14px; flex-shrink: 0;\n}\n.user-info { flex: 1; min-width: 0; }\n.user-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }\n.u-name { font-weight: 600; color: #1e293b; font-size: 14px; }\n\n.user-meta { display: flex; gap: 15px; font-size: 12px; color: #64748b; }\n.meta-item { display: flex; align-items: center; gap: 4px; }\n\n/* 5. BADGES & ACTIONS */\n.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }\n.badge-success { background: #dcfce7; color: #166534; }\n.badge-danger { background: #fee2e2; color: #991b1b; }\n.badge-profile { background: #e0e7ff; color: #4338ca; }\n\n.user-actions { display: flex; gap: 5px; }\n.btn-icon-sm {\n    background: transparent; border: 1px solid transparent;\n    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\n    border-radius: 4px; cursor: pointer; color: #64748b;\n}\n.btn-icon-sm:hover { background: #f1f5f9; color: #1e293b; }\n.btn-icon-sm.text-danger:hover { background: #fee2e2; color: #ef4444; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,3]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","u.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,1,0]},{"type":"attr","position":[1,3,1,3]},{"type":"if","position":[1,3,1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,3,1,3]},{"type":"text","position":[1,3,3,3,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]}]}},"default":{}},{"type":"attr","position":[1,7,1]},{"type":"attr","position":[1,7,3]}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allUsers","groupedUsers","searchTerm","isLoading","canManage"],

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