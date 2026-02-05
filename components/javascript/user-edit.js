Lyte.Component.register("user-edit", {
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