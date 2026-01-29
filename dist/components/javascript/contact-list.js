Lyte.Component.register("contact-list", {
_template:"<template tag-name=\"contact-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Contacts</h1> <template is=\"if\" value=\"{{canCreate}}\"> <a href=\"#/contacts/create\" class=\"add-btn\"> <span>+ Add Contact</span> </a> </template> </header> <div class=\"search-bar\"> <div class=\"input-group\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" placeholder=\"Search contacts...\" class=\"clean-input\"> </div> <div class=\"select-group\"> <select lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanyFilter',this)}}\" class=\"clean-select\"> <option value=\"\">All Companies</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"></option> </select> </div> </div> <div class=\"list-card\"> <div style=\"padding: 10px; color: #888; font-size: 12px; border-bottom: 1px solid #eee;\"> Debug: Found {{displayedContacts.length}} contacts. </div> <div class=\"list-scroll-area\"> <template is=\"for\" items=\"{{displayedContacts}}\" item=\"contact\" index=\"i\"> <div class=\"list-item\" onclick=\"{{action('viewContact',contact.id)}}\"> <div class=\"item-avatar\"> <span style=\"font-size: 14px; font-weight: bold;\"> {{contact.name.0}} </span> </div> <div class=\"item-details\"> <div class=\"item-name\">{{contact.name}}</div> <div class=\"item-meta\"> <span>{{contact.email}}</span> <span class=\"dot\">•</span> <span>{{contact.phone}}</span> </div> <div class=\"item-company\">{{contact.companyName}}</div> </div> <div class=\"item-action\">›</div> </div> </template> </div> </div> </div> </template>\n<style>.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh; /* Full Height */\n    display: flex;\n    flex-direction: column;\n}\n\n.page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n}\n\n.title { margin: 0; color: #1e293b; font-size: 24px; }\n\n.add-btn {\n    background: #2563eb; color: white; padding: 8px 16px;\n    border-radius: 6px; text-decoration: none; display: inline-block;\n}\n\n.search-bar { display: flex; gap: 15px; margin-bottom: 20px; }\n\n.input-group {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 8px 12px; display: flex; align-items: center; flex-grow: 1;\n}\n.clean-input { border: none; outline: none; width: 100%; }\n\n.clean-select {\n    padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;\n    background: white; min-width: 180px; height: 100%;\n}\n\n/* LIST STYLES */\n.list-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    flex-grow: 1;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Contains the scroll area */\n}\n\n.list-scroll-area {\n    overflow-y: auto;\n    flex-grow: 1;\n    height: 100%; /* Force height */\n}\n\n.list-item {\n    display: flex;\n    align-items: center;\n    padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9;\n    cursor: pointer;\n}\n.list-item:hover { background-color: #f8fafc; }\n\n.item-avatar {\n    width: 40px; height: 40px; border-radius: 50%;\n    background-color: #e2e8f0; color: #64748b;\n    display: flex; align-items: center; justify-content: center;\n    margin-right: 15px;\n}\n\n.item-details { flex-grow: 1; }\n.item-name { font-weight: 600; color: #0f172a; }\n.item-meta { font-size: 13px; color: #64748b; }\n.dot { margin: 0 5px; }\n.item-company { font-size: 12px; color: #3b82f6; font-weight: 500; }\n.item-action { color: #cbd5e1; font-size: 20px; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,1,3]},{"type":"for","position":[1,3,3,1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3,1]},{"type":"for","position":[1,5,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1,0]},{"type":"text","position":[1,3,3,5,0]},{"type":"text","position":[1,3,5,0]}]}],
_observedAttributes :["allContacts","displayedContacts","companyList","searchTerm","selectedCompany","isLoading","canCreate"],

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

		didConnect: function() {
			this.setData('canCreate', this.hasPermission('CONTACT_CREATE'));
			this.loadCompanies();
			this.loadContacts();
		},

		// --- LOGIC FUNCTIONS ---

		loadCompanies: function() {
			this.crmGetCompanies()
				.then((res) => {
					// handle different response structures safely
					let list = [];
					if(res && Array.isArray(res.data)){
						list = res.data;
					} else if(res && res.data && Array.isArray(res.data.data)){
						list = res.data.data;
					}
					this.setData('companyList', list);
				})
				.catch(e => console.error("Error loading companies", e));
		},

		loadContacts: function() {
			this.setData('isLoading', true);

			// 1. Prepare Query Parameters
			let params = {};
			let compId = this.getData('selectedCompany');

			// Only add if compId is valid (not null/empty)
			if (compId) {
				params.companyId = compId;
			}

			// 2. Call API
			this.crmGetContacts(params)
				.then((res) => {
					// 3. Extract Data Directly
					// Your API returns: { data: [Array], success: true }
					// So we simply access res.data. If it's null/undefined, default to []
					let rawContacts = (res && Array.isArray(res.data)) ? res.data : [];

					// 4. Normalize Data (Best Practice)
					// This prevents crashes if a specific field (like phone) is missing in the DB
					let cleanContacts = rawContacts.map(item => ({
						id: item.id,
						name: item.name || "Unknown",
						email: item.email || "",
						phone: item.phone || "",
						companyName: item.companyName || ""
					}));

					// 5. Update UI
					this.setData('allContacts', cleanContacts);
					this.applyClientFilter(); // Refresh the list view
				})
				.catch(e => {
					console.error("Failed to load contacts", e);
					this.setData('allContacts', []); // Clear list on error
					this.applyClientFilter();
				})
				.finally(() => {
					this.setData('isLoading', false);
				});
		},


		applyClientFilter: function() {
			// Always get a fresh copy of the master list
			let all = this.getData('allContacts');
			let term = this.getData('searchTerm'); // Get raw value first

			// Safety check
			if(!all) all = [];
			if(!term) term = "";

			term = term.toLowerCase().trim();

			if (term === "") {
				// Use slice() to create a new array reference.
				// This is CRITICAL for Lyte to detect the change.
				this.setData('displayedContacts', all.slice());
				return;
			}

			let filtered = all.filter(function(c) {
				let name = (c.name || "").toLowerCase();
				let email = (c.email || "").toLowerCase();
				let phone = (c.phone || "").toString();

				return name.includes(term) || email.includes(term) || phone.includes(term);
			});

			this.setData('displayedContacts', filtered);
		},

		actions: {
			onSearch: function() {
				this.applyClientFilter();
			},

			onCompanyFilter: function(element) {
				// 1. Get the value directly from the Select Element
				let selectedValue = element.value;

				console.log("UI Selected Value:", selectedValue);

				// 2. Manually update the data (Bypassing lyte-model delay)
				this.setData('selectedCompany', selectedValue);

				// 3. Now loadContacts will definitely see the new ID
				this.loadContacts();
			},

			viewContact: function(id) {
				window.location.hash = "/contacts/" + id;
			}
		}
	},
	{
		mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
	});