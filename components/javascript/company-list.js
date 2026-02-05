Lyte.Component.register("company-list", {
	data: function() {
		return {
			companyList: Lyte.attr("array", { default: [] }),
			searchTerm: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Search Debounce Timer
			searchTimer: Lyte.attr("number", { default: null })
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('COMPANY_CREATE'));
		this.loadCompanies();
	},

	loadCompanies: function() {
		this.setData('isLoading', true);

		// Prepare Params
		let term = this.getData('searchTerm');
		let params = {};
		if (term) {
			params.keyword = term;
		}

		this.crmGetCompanies(params)
			.then((res) => {
				let rawData = [];

				// Robust Extraction
				if (res && Array.isArray(res.data)) {
					rawData = res.data;
				} else if (Array.isArray(res)) {
					rawData = res;
				} else if (res && res.data && Array.isArray(res.data.data)) {
					rawData = res.data.data;
				}

				// Normalize for UI (Add Avatar props)
				let cleanList = rawData.map(c => ({
					id: c.id,
					name: c.name,
					email: c.email,
					phone: c.phone,
					industry: c.industry,
					// Pre-calculate visuals
					initials: this.getInitials(c.name),
					avatarColor: this.getAvatarColor(c.name)
				}));

				this.setData('companyList', cleanList);
			})
			.catch(err => {
				console.error("Error loading companies", err);
				this.setData('companyList', []);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- HELPERS (Ported from your Utils) ---
	getInitials: function(name) {
		if (!name) return "";
		return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
		// Debounced Search Action
		onSearchInput: function() {
			// Clear existing timer
			let timer = this.getData('searchTimer');
			if (timer) clearTimeout(timer);

			// Set new timer
			let newTimer = setTimeout(() => {
				this.loadCompanies();
			}, 300); // 300ms delay

			this.setData('searchTimer', newTimer);
		},

		createCompany: function() {
			window.location.hash = "#/companies/create";
		},

		viewCompany: function(id) {
			window.location.hash = "#/companies/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });