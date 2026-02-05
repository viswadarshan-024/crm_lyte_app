Lyte.Component.register("user-view", {
_template:"<template tag-name=\"user-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">User Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading user...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"user-header-card\"> <div class=\"user-avatar-lg\" style=\"background-color: {{avatarColor}}\"> {{initials}} </div> <div class=\"user-main-info\"> <div class=\"name-row\"> <h2>{{user.fullName}}</h2> <template is=\"if\" value=\"{{user.active}}\"><template case=\"true\"> <span class=\"badge badge-success\">Active</span> </template><template case=\"false\"> <span class=\"badge badge-danger\">Inactive</span> </template></template> </div> <div class=\"user-email\">{{user.email}}</div> <div class=\"badges-row\"> <span class=\"badge-pill role\">{{user.roleName}}</span> <span class=\"badge-pill profile\">{{user.profileName}}</span> </div> </div> <div class=\"user-actions\"> <button onclick=\"{{action('editUser')}}\" class=\"btn-primary-ghost\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"></path><path d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"></path></svg> Edit </button> <button onclick=\"{{action('deleteUser')}}\" class=\"btn-danger-ghost\">Delete</button> </div> </div> <div class=\"user-body\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Username</div> <div class=\"value\">{{user.username}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Email</div> <div class=\"value\">{{user.email}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Role</div> <div class=\"value\">{{user.roleName}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Profile</div> <div class=\"value\">{{user.profileName}}</div> </div> </div> <h3 class=\"section-title mt-4\">Reporting Structure</h3> <div class=\"info-grid two-col\"> <div class=\"info-item\"> <div class=\"label\">Reports To</div> <div class=\"value\">{{user.reportsTo}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Team Size</div> <div class=\"value\">{{user.teamSize}} direct reports</div> </div> </div> <div class=\"tabs-container\"> <div class=\"tabs-header\"> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Assigned Deals ({{deals.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','team'),'?:','active','')}}\" onclick=\"{{action('switchTab','team')}}\"> Team Members ({{teamMembers.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals assigned.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"d\"> <div class=\"list-item\"> <div class=\"item-main\"> <div class=\"item-title\">{{d.title}}</div> <div class=\"item-sub\">{{d.formattedAmount}}</div> </div> <span class=\"badge {{d.statusClass}}\">{{d.status}}</span> <button onclick=\"{{action('viewDeal',d.id)}}\" class=\"btn-sm ml-2\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','team')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(teamMembers.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No direct reports.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{teamMembers}}\" item=\"m\"> <div class=\"list-item\"> <div class=\"mini-avatar\" style=\"background-color: {{m.avatarColor}}\"> {{m.initials}} </div> <div class=\"item-main\"> <div class=\"item-title\">{{m.fullName}}</div> <div class=\"item-sub\">{{m.email}}</div> </div> <button onclick=\"{{action('viewUser',m.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.user-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 24px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.user-avatar-lg {\n    width: 80px; height: 80px; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-size: 28px; font-weight: 700; flex-shrink: 0;\n}\n\n.user-main-info { flex: 1; }\n.name-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }\n.name-row h2 { margin: 0; font-size: 22px; color: #1e293b; }\n\n.user-email { color: #64748b; font-size: 14px; margin-bottom: 12px; }\n\n.badges-row { display: flex; gap: 8px; }\n.badge-pill { font-size: 11px; padding: 2px 10px; border-radius: 12px; font-weight: 600; text-transform: uppercase; }\n.badge-pill.role { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }\n.badge-pill.profile { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }\n\n.user-actions { display: flex; gap: 10px; align-self: flex-start; }\n.btn-primary-ghost {\n    background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px;\n    cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;\n}\n.btn-primary-ghost:hover { background: #f8fafc; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-size: 13px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* STATUS BADGES */\n.badge-success { background: #dcfce7; color: #166534; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n.badge-danger { background: #fee2e2; color: #991b1b; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n\n/* BODY */\n.user-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.mt-4 { margin-top: 24px; }\n\n.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n\n/* TABS */\n.tabs-header { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; margin-top: 30px; }\n.tab {\n    padding: 10px 20px; cursor: pointer; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -1px;\n}\n.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }\n.tab:hover:not(.active) { color: #1e293b; }\n\n.empty-tab { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }\n\n/* LIST ITEMS */\n.list-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }\n.list-item:last-child { border-bottom: none; }\n\n.mini-avatar {\n    width: 32px; height: 32px; border-radius: 50%; color: white;\n    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;\n}\n\n.item-main { flex: 1; }\n.item-title { font-size: 14px; font-weight: 500; color: #1e293b; }\n.item-sub { font-size: 12px; color: #64748b; }\n\n.badge-blue { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-green { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-yellow { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-gray { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n\n.btn-sm { padding: 4px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; }\n.ml-2 { margin-left: 8px; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","avatarColor"]}}}},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,1,3,1,1,0]},{"type":"attr","position":[1,1,3,1,3]},{"type":"if","position":[1,1,3,1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,1,3,3,0]},{"type":"text","position":[1,1,3,5,1,0]},{"type":"text","position":[1,1,3,5,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"text","position":[1,3,3,1,3,0]},{"type":"text","position":[1,3,3,3,3,0]},{"type":"text","position":[1,3,3,5,3,0]},{"type":"text","position":[1,3,3,7,3,0]},{"type":"text","position":[1,3,7,1,3,0]},{"type":"text","position":[1,3,7,3,3,0]},{"type":"attr","position":[1,3,9,1,1]},{"type":"text","position":[1,3,9,1,1,1]},{"type":"attr","position":[1,3,9,1,3]},{"type":"text","position":[1,3,9,1,3,1]},{"type":"attr","position":[1,3,9,3]},{"type":"if","position":[1,3,9,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3]},{"type":"text","position":[1,3,0]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,9,5]},{"type":"if","position":[1,3,9,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","m.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["userId","user","deals","teamMembers","avatarColor","initials","currentTab","isLoading","canManage"],

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