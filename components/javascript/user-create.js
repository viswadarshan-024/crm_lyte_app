Lyte.Component.register("user-create", {
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