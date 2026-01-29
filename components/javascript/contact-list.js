Lyte.Component.register("contact-list", {
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