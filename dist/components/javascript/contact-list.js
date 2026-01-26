Lyte.Component.register("contact-list", {
_template:"<template tag-name=\"contact-list\"> <div class=\"page-content\"> <header class=\"header-row\"> <h1 class=\"header-title\">Contacts</h1> <template is=\"if\" value=\"{{canCreate}}\"> <a href=\"#/contacts/create\" class=\"btn btn-primary\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"margin-right:8px\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg> Add Contact </a> </template> </header> <div class=\"filter-bar\"> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" class=\"form-input search-input\" placeholder=\"Search contacts...\"> <select lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanyFilter')}}\" class=\"form-select company-select\"> <option value=\"\">All Companies</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"></option> </select> </div> <div class=\"card\"> <template is=\"if\" value=\"{{isLoading}}\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> </div> </template> <template is=\"else\"> <template is=\"if\" value=\"{{displayedContacts.length === 0}}\"> <div class=\"empty-state\"> <div class=\"empty-icon\">Inbox</div> <h3>No contacts found</h3> <p>Try changing your filters or add a new contact.</p> </div> </template> <template is=\"else\"> <div class=\"contacts-list\"> <template is=\"for\" items=\"{{displayedContacts}}\" item=\"contact\" index=\"i\"> <div class=\"contact-card\" onclick=\"{{action('viewContact', contact.id)}}\"> <div class=\"contact-avatar\" style=\"background-color: {{method('getAvatarColor', contact.name)}}\"> {{method('getInitials', contact.name)}} </div> <div class=\"contact-info\"> <div class=\"contact-name\">{{contact.name}}</div> <div class=\"contact-meta\"> <template is=\"if\" value=\"{{contact.email}}\"> <span>{{contact.email}}</span> </template> <template is=\"if\" value=\"{{contact.email &amp;&amp; contact.phone}}\"> • </template> <template is=\"if\" value=\"{{contact.phone}}\"> <span>{{contact.phone}}</span> </template> </div> <div class=\"contact-company\">{{contact.companyName}}</div> </div> </div> </template> </div> </template> </template> </div> </div> </template>\n<style>.header-row {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 24px;\n}\n.header-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; }\n\n.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }\n.search-input { flex: 1; max-width: 400px; }\n.company-select { max-width: 200px; }\n\n/* Contact Card Styles */\n.contact-card {\n    display: flex;\n    align-items: center;\n    gap: 16px;\n    padding: 16px;\n    border-bottom: 1px solid #e2e8f0;\n    transition: background-color 0.2s;\n    cursor: pointer;\n}\n.contact-card:hover { background-color: #f8fafc; }\n.contact-card:last-child { border-bottom: none; }\n\n.contact-avatar {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 1rem;\n    font-weight: 600;\n    color: white;\n    flex-shrink: 0;\n}\n\n.contact-info { flex: 1; min-width: 0; }\n.contact-name { font-size: 1rem; font-weight: 600; color: #1e293b; }\n.contact-meta { font-size: 0.875rem; color: #64748b; margin-top: 2px; }\n.contact-company { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }\n\n/* States */\n.loading-state { padding: 40px; display: flex; justify-content: center; }\n.empty-state { padding: 40px; text-align: center; color: #64748b; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,3,1]},{"type":"attr","position":[1,3,3]},{"type":"attr","position":[1,3,3,3]},{"type":"for","position":[1,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,5,1]},{"type":"if","position":[1,5,1],"cases":{},"default":{}}],
_observedAttributes :["allContacts","displayedContacts","companyList","searchTerm","selectedCompany","isLoading","canCreate"],

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