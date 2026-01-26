Lyte.Component.register("contact-list", {
	services: ["auth", "crm-api"],

	data: function() {
		return {
			allContacts: Lyte.attr("array", { default: [] }),
			displayedContacts: Lyte.attr("array", { default: [] }),
			companyList: Lyte.attr("array", { default: [] }),

			searchTerm: Lyte.attr("string", { default: "" }),
			selectedCompany: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),

			canCreate: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: async function() {
		this.setData('canCreate', this.auth.hasPermission('CONTACT_CREATE'));

		this.loadCompanies();
		this.loadContacts();
	},

	methods: {
		loadCompanies: async function() {
			try {
				let res = await this.crmApi.companies.list();
				if (res.success) this.setData('companyList', res.data);
			} catch (e) { console.error(e); }
		},

		loadContacts: async function() {
			this.setData('isLoading', true);
			try {
				let params = {};
				let compId = this.getData('selectedCompany');
				if (compId) params.companyId = compId;

				let res = await this.crmApi.contacts.list(params);

				if (res.success) {
					let contacts = res.data || [];
					this.setData('allContacts', contacts);
					// Apply current search term immediately
					this.applyClientFilter();
				}
			} catch (e) {
				console.error("Failed to load contacts", e);
			} finally {
				this.setData('isLoading', false);
			}
		},

		applyClientFilter: function() {
			let term = this.getData('searchTerm').toLowerCase().trim();
			let all = this.getData('allContacts');

			if (!term) {
				this.setData('displayedContacts', all);
				return;
			}

			let filtered = all.filter(function(c) {
				return (c.name && c.name.toLowerCase().includes(term)) ||
					(c.email && c.email.toLowerCase().includes(term)) ||
					(c.phone && c.phone.includes(term));
			});

			this.setData('displayedContacts', filtered);
		},

		getAvatarColor: function(name) {
			if(!window.Utils) return '#1a73e8';
			return Utils.getAvatarColor(name);
		},

		getInitials: function(name) {
			if(!window.Utils) return 'U';
			return Utils.getInitials(name);
		}
	},

	actions: {
		onSearch: function() {
			this.applyClientFilter();
		},

		onCompanyFilter: function() {
			this.loadContacts();
		},

		viewContact: function(id) {
			Lyte.Router.transport("#/contacts/" + id);
		}
	}
});