Lyte.Component.register("profile-list", {
_template:"<template tag-name=\"profile-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Profiles</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createProfile')}}\" class=\"add-btn\"> <span>+ Create Profile</span> </button> </template></template> </header> <div class=\"info-banner\"> <div class=\"banner-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"banner-content\"> <p class=\"banner-title\">What are Profiles?</p> <p class=\"banner-text\">Profiles define what features users can access. Assign a profile to a user to grant them permissions.</p> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading profiles...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(profiles.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No profiles found.</div> </template><template case=\"false\"> <div class=\"profiles-grid\"> <template is=\"for\" items=\"{{profiles}}\" item=\"profile\"> <div class=\"profile-card\"> <div class=\"card-header\"> <div class=\"profile-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"></line><line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"></line></svg> </div> <div class=\"dropdown-wrapper\"> <button class=\"btn-icon-dots\" onclick=\"{{action('toggleDropdown',profile.id,event)}}\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"5\" r=\"1\"></circle><circle cx=\"12\" cy=\"19\" r=\"1\"></circle></svg> </button> <template is=\"if\" value=\"{{expHandlers(openDropdownId,'==',profile.id)}}\"><template case=\"true\"> <div class=\"dropdown-menu\"> <a onclick=\"{{action('viewProfile',profile.id)}}\" class=\"menu-item\">View Details</a> <a onclick=\"{{action('editProfile',profile.id)}}\" class=\"menu-item\">Edit Profile</a> <div class=\"divider\"></div> <a onclick=\"{{action('deleteProfile',profile.id,profile.name)}}\" class=\"menu-item text-danger\">Delete</a> </div> </template></template> </div> </div> <h3 class=\"profile-name\">{{profile.name}}</h3> <p class=\"profile-desc\">{{profile.description}}</p> <div class=\"perm-count\">{{profile.totalCount}} permission(s)</div> <template is=\"if\" value=\"{{expHandlers(profile.totalCount,'>',0)}}\"><template case=\"true\"> <div class=\"perm-section\"> <div class=\"perm-label\">Permissions</div> <div class=\"tags-container\"> <template is=\"for\" items=\"{{profile.visiblePermissions}}\" item=\"perm\"> <span class=\"tag\">{{perm}}</span> </template> <template is=\"if\" value=\"{{expHandlers(profile.remainingCount,'>',0)}}\"><template case=\"true\"> <span class=\"tag more\">+{{profile.remainingCount}} more</span> </template></template> </div> </div> </template></template> <div class=\"card-footer\"> <button onclick=\"{{action('viewProfile',profile.id)}}\" class=\"btn-sm\">View</button> <button onclick=\"{{action('editProfile',profile.id)}}\" class=\"btn-sm ghost\">Edit</button> </div> </div> </template> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n/* INFO BANNER */\n.info-banner {\n    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);\n    border: 1px solid #bae6fd; border-radius: 8px;\n    padding: 15px; display: flex; gap: 15px; margin-bottom: 25px; flex-shrink: 0;\n}\n.banner-icon { color: #0284c7; }\n.banner-title { font-weight: bold; color: #0369a1; font-size: 14px; margin: 0 0 4px 0; }\n.banner-text { color: #475569; font-size: 13px; margin: 0; }\n\n/* GRID */\n.profiles-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* Scroll Logic */\n    flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 20px;\n}\n\n/* CARD */\n.profile-card {\n    background: white; border-radius: 8px; padding: 20px;\n    border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n    display: flex; flex-direction: column;\n}\n.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }\n\n.profile-icon {\n    width: 48px; height: 48px; border-radius: 8px;\n    background: #dbeafe; color: #2563eb;\n    display: flex; align-items: center; justify-content: center;\n}\n\n.profile-name { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 5px 0; }\n.profile-desc { font-size: 13px; color: #64748b; margin: 0 0 15px 0; line-height: 1.4; flex-grow: 1; }\n.perm-count { font-size: 12px; color: #94a3b8; margin-bottom: 15px; }\n\n/* PERMISSIONS TAGS */\n.perm-section { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 15px; }\n.perm-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 8px; }\n.tags-container { display: flex; flex-wrap: wrap; gap: 6px; }\n\n.tag {\n    font-size: 11px; padding: 4px 8px; border-radius: 4px;\n    background: #f1f5f9; color: #475569;\n}\n.tag.more { background: #dbeafe; color: #1e40af; font-weight: 600; }\n\n/* FOOTER & BUTTONS */\n.card-footer { margin-top: 20px; display: flex; gap: 10px; }\n.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 4px; cursor: pointer; border: none; background: #2563eb; color: white; }\n.btn-sm.ghost { background: white; border: 1px solid #cbd5e1; color: #475569; }\n\n/* DROPDOWN */\n.dropdown-wrapper { position: relative; }\n.btn-icon-dots { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 5px; }\n.btn-icon-dots:hover { color: #1e293b; background: #f1f5f9; border-radius: 50%; }\n\n.dropdown-menu {\n    position: absolute; right: 0; top: 30px;\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n    min-width: 140px; z-index: 10;\n}\n.menu-item {\n    display: block; padding: 8px 12px; font-size: 13px; color: #334155;\n    cursor: pointer; text-decoration: none;\n}\n.menu-item:hover { background: #f8fafc; }\n.menu-item.text-danger { color: #ef4444; }\n.menu-item.text-danger:hover { background: #fef2f2; }\n.divider { height: 1px; background: #e2e8f0; margin: 4px 0; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; margin: auto; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1,1,3,1]},{"type":"attr","position":[1,1,3,3]},{"type":"if","position":[1,1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"attr","position":[1,3]},{"type":"attr","position":[1,7]}]}},"default":{}},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,0]},{"type":"text","position":[1,7,0]},{"type":"attr","position":[1,9]},{"type":"if","position":[1,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"text","position":[1,0]}]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,11,1]},{"type":"attr","position":[1,11,3]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["profiles","isLoading","openDropdownId","canManage"],

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