Lyte.Component.register("contact-create", {
	services: ["auth", "crm-api"],

	data: function() {
		return {
			contactName: Lyte.attr("string"),
			contactEmail: Lyte.attr("string"),
			contactPhone: Lyte.attr("string"),
			contactDesignation: Lyte.attr("string"),
			selectedCompany: Lyte.attr("string", { default: "" }),

			// List Data
			companyList: Lyte.attr("array", { default: [] }),

			// UI States
			isLoading: Lyte.attr("boolean", { default: false }),
			errorMessage: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: async function() {
		// if (!this.auth.canAccess('contacts')) {
		// 	alert("Permission Denied");
		// 	Lyte.Router.transport("#/contacts"); // Redirect
		// 	return;
		// }

		try {
			let response = await this.crmApi.companies.list();
			if (response.success) {
				this.setData('companyList', response.data);
			}

			const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
			const preSelected = urlParams.get('companyId');
			if(preSelected) {
				this.setData('selectedCompany', preSelected);
			}

		} catch (error) {
			console.error("Failed to load companies", error);
		}
	},

	actions: {
		createContact: async function() {
			// 1. Validate
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

			try {
				let response = await this.crmApi.contacts.save(payload);
				if (response.success) {
					alert("Contact Created Successfully!");
					window.location.href = "#/contacts";
				} else {
					this.setData('errorMessage', response.message || "Unknown error");
				}
			} catch (error) {
				this.setData('errorMessage', error.message || "Network Error");
			} finally {
				this.setData('isLoading', false);
			}
		}
	}
});