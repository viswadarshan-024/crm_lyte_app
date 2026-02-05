Lyte.Component.register("user-create", {
_template:"<template tag-name=\"user-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add User</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading form data...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Username <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_username\" class=\"form-input\" placeholder=\"e.g. jdoe\" autocomplete=\"off\"> </div> <div class=\"form-group half\"> <label>Email <span class=\"required\">*</span></label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"user@example.com\" autocomplete=\"off\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Password <span class=\"required\">*</span></label> <input type=\"password\" id=\"inp_password\" class=\"form-input\" placeholder=\"Min 6 chars\" onkeyup=\"{{action('checkPassword',event)}}\"> <div class=\"strength-bar\"> <div class=\"bar-fill {{passwordStrength}}\"></div> </div> </div> <div class=\"form-group half\"> <label>Confirm Password <span class=\"required\">*</span></label> <input type=\"password\" id=\"inp_confirm\" class=\"form-input\" placeholder=\"Re-enter password\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Personal Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_fullname\" class=\"form-input\" placeholder=\"e.g. John Doe\"> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Role &amp; Access</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Role <span class=\"required\">*</span></label> <select id=\"sel_role\" class=\"form-select\"> <option value=\"\">Select Role...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"role\"></option> </select> <div class=\"hint\">Defines hierarchy and visibility</div> </div> <div class=\"form-group half\"> <label>Profile <span class=\"required\">*</span></label> <select id=\"sel_profile\" class=\"form-select\"> <option value=\"\">Select Profile...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{profiles}}\" item=\"prof\"></option> </select> <div class=\"hint\">Defines specific permissions</div> </div> </div> <div class=\"form-group\"> <label>Reports To (Manager)</label> <select id=\"sel_manager\" class=\"form-select\"> <option value=\"\">No Manager (Top Level)</option> <option is=\"for\" lyte-for=\"true\" items=\"{{users}}\" item=\"user\"></option> </select> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createUser')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create User</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 720px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.hint { font-size: 12px; color: #64748b; margin-top: 4px; }\n\n/* PASSWORD STRENGTH */\n.strength-bar { height: 4px; background: #e2e8f0; margin-top: 6px; border-radius: 2px; overflow: hidden; }\n.bar-fill { height: 100%; width: 0; transition: width 0.3s, background 0.3s; }\n.bar-fill.weak { width: 33%; background: #ef4444; }\n.bar-fill.medium { width: 66%; background: #f59e0b; }\n.bar-fill.strong { width: 100%; background: #10b981; }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,5,1,3]},{"type":"attr","position":[1,1,1,1,5,1,5,1]},{"type":"attr","position":[1,1,1,5,3,1,3,3]},{"type":"for","position":[1,1,1,5,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"role\"> <option value=\"{{role.id}}\">{{role.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,3,3,3,3]},{"type":"for","position":[1,1,1,5,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{profiles}}\" item=\"prof\"> <option value=\"{{prof.id}}\">{{prof.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,5,3,3]},{"type":"for","position":[1,1,1,5,5,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]},{"type":"text","position":[1,2]}],"actualTemplate":"<template is=\"for\" items=\"{{users}}\" item=\"user\"> <option value=\"{{user.id}}\">{{user.fullName}} ({{user.roleName}})</option> </template>"},{"type":"attr","position":[1,1,1,7,1]},{"type":"attr","position":[1,1,1,7,3]},{"type":"attr","position":[1,1,1,7,3,1]},{"type":"if","position":[1,1,1,7,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roles","profiles","users","passwordStrength","isLoading","isSaving"],

	data: function() {
		return {
			// Dropdown Options
			roles: Lyte.attr("array", { default: [] }),
			profiles: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }), // Potential managers

			// Form Data (Bound for UI feedback, but read manually on submit)
			passwordStrength: Lyte.attr("string", { default: "none" }), // weak, medium, strong

			// State
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
		this.loadFormData();
	},

	loadFormData: function() {
		this.setData('isLoading', true);

		// Fetch Metadata (Roles/Profiles) AND Existing Users (for Manager dropdown)
		Promise.all([
			this.crmAddUser(),
			this.crmGetUsers()
		]).then((responses) => {
			const [metaRes, usersRes] = responses;

			// 1. Roles & Profiles
			if (metaRes.success && metaRes.data) {
				// Convert Map/Object to Array for Lyte Loop
				const roleObj = metaRes.data.roles || {};
				const profObj = metaRes.data.profiles || {};

				this.setData('roles', this.mapToArray(roleObj));
				this.setData('profiles', this.mapToArray(profObj));
			}

			// 2. Managers (Existing Users)
			let userList = [];
			if (usersRes.success) {
				// Handle various response structures
				const d = usersRes.data;
				if (Array.isArray(d)) userList = d;
				else if (d && Array.isArray(d.data)) userList = d.data;
			}
			this.setData('users', userList);

		}).catch(err => {
			console.error("Form Load Error", err);
			alert("Failed to load form data");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// Helper: Convert { "1": "Admin" } -> [ { id: "1", name: "Admin" } ]
	mapToArray: function(obj) {
		return Object.keys(obj).map(key => ({
			id: key,
			name: obj[key]
		}));
	},

	actions: {
		checkPassword: function(event) {
			const val = event.target.value;
			let strength = "none";
			let score = 0;

			if (val.length >= 6) score++;
			if (val.length >= 8 && /[A-Z]/.test(val)) score++;
			if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

			if (score === 1) strength = "weak";
			else if (score === 2) strength = "medium";
			else if (score >= 3) strength = "strong";

			this.setData('passwordStrength', strength);
		},

		createUser: function() {
			// 1. Direct DOM Reading
			const username = document.getElementById('inp_username').value.trim();
			const email = document.getElementById('inp_email').value.trim();
			const password = document.getElementById('inp_password').value;
			const confirm = document.getElementById('inp_confirm').value;
			const fullName = document.getElementById('inp_fullname').value.trim();

			// For selects, getting value is standard
			const roleId = document.getElementById('sel_role').value;
			const profileId = document.getElementById('sel_profile').value;
			const managerId = document.getElementById('sel_manager').value;

			// 2. Validation
			if (!username || !email || !password || !fullName || !roleId || !profileId) {
				alert("Please fill in all required fields.");
				return;
			}

			if (password !== confirm) {
				alert("Passwords do not match.");
				return;
			}

			if (password.length < 6) {
				alert("Password must be at least 6 characters.");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				username: username,
				email: email,
				password: password,
				fullName: fullName,
				roleId: parseInt(roleId),
				profileId: parseInt(profileId),
				managerId: managerId ? parseInt(managerId) : null,
				active: true
			};

			this.crmSaveUser(payload)
				.then((res) => {
					if (res.success) {
						alert("User created successfully!");
						window.location.hash = "#/users";
					} else {
						alert("Error: " + (res.message || "Creation failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/users";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });