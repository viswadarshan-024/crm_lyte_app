Lyte.Component.register("contact-create", {
		// 1. Remove 'services' property

		data: function() {
			return {
				contactName: Lyte.attr("string"),
				contactEmail: Lyte.attr("string"),
				contactPhone: Lyte.attr("string"),
				contactDesignation: Lyte.attr("string"),
				selectedCompany: Lyte.attr("string", { default: "" }),

				companyList: Lyte.attr("array", { default: [] }),

				isLoading: Lyte.attr("boolean", { default: false }),
				errorMessage: Lyte.attr("string", { default: "" })
			}
		},

		didConnect: function() {
			// 2. Use the helper from auth-mixin (if available)
			// if (this.hasPermission && !this.hasPermission('CONTACT_CREATE')) { ... }

			// 3. Load Companies using the MIXIN method (Same as contact-list)
			this.crmGetCompanies()
				.then((res) => {
					// Use the same safe data extraction as contact-list
					let list = [];
					if(res && Array.isArray(res.data)){
						list = res.data;
					} else if(res && res.data && Array.isArray(res.data.data)){
						list = res.data.data;
					}
					this.setData('companyList', list);

					// Handle Pre-selection from URL
					const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
					const preSelected = urlParams.get('companyId');
					if(preSelected) {
						this.setData('selectedCompany', preSelected);
					}
				})
				.catch(error => {
					console.error("Failed to load companies", error);
				});
		},

		actions: {
			createContact: function() {
				let name = this.getData('contactName');
				let companyId = this.getData('selectedCompany');

				if (!name || !companyId) {
					this.setData('errorMessage', "Please fill in Name and Company.");
					return;
				}

				this.setData('isLoading', true);
				this.setData('errorMessage', "");

				let payload = {
					name: name,
					email: this.getData('contactEmail'),
					phone: this.getData('contactPhone'),
					designation: this.getData('contactDesignation'),
					companyId: companyId
				};

				// 4. Use Mixin method for creation
				// Note: Ensure 'crmCreateContact' exists in your crm-api-mixin.js file!
				this.crmCreateContact(payload)
					.then((response) => {
						// Check success based on your API structure
						if (response && (response.success || response.id)) {
							alert("Contact Created Successfully!");
							window.location.hash = "/contacts"; // Use hash for redirection
						} else {
							this.setData('errorMessage', (response.message || "Unknown error"));
						}
					})
					.catch((error) => {
						this.setData('errorMessage', error.message || "Network Error");
					})
					.finally(() => {
						this.setData('isLoading', false);
					});
			}
		}
	},
// 5. REGISTER MIXINS HERE
	{
		mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
	});