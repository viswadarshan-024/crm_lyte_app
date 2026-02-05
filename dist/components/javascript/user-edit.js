Lyte.Component.register("user-edit", {
_template:"<template tag-name=\"user-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit User</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading user data...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Username <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_username\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Email <span class=\"required\">*</span></label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Personal Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_fullname\" class=\"form-input\"> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Role &amp; Permissions</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Role <span class=\"required\">*</span></label> <select id=\"sel_role\" class=\"form-select\"> <option value=\"\">Select Role...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"role\"></option> </select> </div> <div class=\"form-group half\"> <label>Profile <span class=\"required\">*</span></label> <select id=\"sel_profile\" class=\"form-select\"> <option value=\"\">Select Profile...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{profiles}}\" item=\"prof\"></option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Security</h3> <div class=\"form-group\"> <label>New Password</label> <input type=\"password\" id=\"inp_password\" class=\"form-input\" placeholder=\"Leave blank to keep current password\"> <div class=\"hint\">Only fill this if you want to reset the user's password.</div> </div> <div class=\"form-group checkbox-row\"> <label class=\"checkbox-label\"> <input type=\"checkbox\" id=\"chk_active\"> <span class=\"lbl-text\">Account is Active</span> </label> <div class=\"hint\">Inactive users cannot sign in.</div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateUser')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* Inherit standard form styles from previous Create/Edit pages */\n/* ... (Container, header, form-group, inputs, actions) ... */\n\n.form-container { max-width: 720px; margin: 0 auto; }\n.form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.form-section { margin-bottom: 30px; }\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.hint { font-size: 12px; color: #64748b; margin-top: 4px; }\n\n/* CHECKBOX STYLES */\n.checkbox-row { display: flex; flex-direction: column; gap: 4px; }\n.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }\n.checkbox-label input { margin: 0; width: 16px; height: 16px; }\n.lbl-text { font-size: 14px; font-weight: 500; color: #1e293b; }\n\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,3,1,3,3]},{"type":"for","position":[1,1,1,5,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"role\"> <option value=\"{{role.id}}\">{{role.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,3,3,3,3]},{"type":"for","position":[1,1,1,5,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{profiles}}\" item=\"prof\"> <option value=\"{{prof.id}}\">{{prof.name}}</option> </template>"},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,3]},{"type":"attr","position":[1,1,1,9,3,1]},{"type":"if","position":[1,1,1,9,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["userId","user","roles","profiles","isLoading","isSaving"],

	data: function() {
		return {
			userId: Lyte.attr("string", { default: "" }),

			// Data Models
			user: Lyte.attr("object", { default: {} }),
			roles: Lyte.attr("array", { default: [] }),
			profiles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/users";
			return;
		}

		// Robust ID Extraction from URL (e.g., #/users/edit/1)
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/users";
			return;
		}

		this.setData('userId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('userId');

		// Parallel Fetch:
		// 1. User Details (crmGetUser)
		// 2. Form Options like Roles/Profiles (crmAddUser)
		Promise.all([
			this.crmGetUser(id),
			this.crmAddUser()
		]).then((responses) => {
			const [userRes, optionsRes] = responses;

			if (!userRes.success) throw new Error(userRes.message);

			// 1. Process Form Options (Roles & Profiles)
			if (optionsRes.success && optionsRes.data) {
				this.setData('roles', this.mapToArray(optionsRes.data.roles || {}));
				this.setData('profiles', this.mapToArray(optionsRes.data.profiles || {}));
			}

			// 2. Process User Data
			const userData = userRes.data || {};
			this.setData('user', userData);

			// 3. Force Populate Form (Wait for DOM render)
			setTimeout(() => {
				this.populateForm(userData);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load user data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// Helper to convert API Maps { "1": "Admin" } to Arrays [{id: 1, name: "Admin"}]
	mapToArray: function(obj) {
		return Object.keys(obj).map(key => ({
			id: key,
			name: obj[key]
		}));
	},

	// Manually set input values to ensure accuracy
	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_username', data.username);
		setVal('inp_email', data.email);
		setVal('inp_fullname', data.fullName);

		// Selects
		const roleEl = document.getElementById('sel_role');
		if (roleEl) roleEl.value = data.roleId;

		const profEl = document.getElementById('sel_profile');
		if (profEl) profEl.value = data.profileId;

		// Checkbox
		const activeEl = document.getElementById('chk_active');
		if (activeEl) activeEl.checked = (data.active === true || data.isActive === true);
	},

	actions: {
		updateUser: function() {
			// 1. Direct DOM Reading
			const username = document.getElementById('inp_username').value.trim();
			const email = document.getElementById('inp_email').value.trim();
			const fullName = document.getElementById('inp_fullname').value.trim();
			const roleId = document.getElementById('sel_role').value;
			const profileId = document.getElementById('sel_profile').value;
			const isActive = document.getElementById('chk_active').checked;
			const password = document.getElementById('inp_password').value;

			// 2. Validation
			if (!username || !email || !fullName || !roleId || !profileId) {
				alert("Please fill in all required fields.");
				return;
			}

			this.setData('isSaving', true);

			// 3. Construct Payload
			const payload = {
				id: parseInt(this.getData('userId')),
				username: username,
				email: email,
				fullName: fullName,
				roleId: parseInt(roleId),
				profileId: parseInt(profileId),
				active: isActive
			};

			// Only send password if user entered a new one
			if (password) {
				payload.password = password;
			}

			// 4. Submit
			this.crmUpdateUser(payload)
				.then((res) => {
					if (res.success) {
						alert("User updated successfully!");
						window.location.hash = "#/users/view/" + this.getData('userId');
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
			window.location.hash = "#/users/view/" + this.getData('userId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });