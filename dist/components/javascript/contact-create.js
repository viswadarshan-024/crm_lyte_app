Lyte.Component.register("contact-create", {
_template:"<template tag-name=\"contact-create\"> <div class=\"page-content\"> <div class=\"card form-container\"> <div class=\"card-body\"> <h2 class=\"form-title\">Create New Contact</h2> <template is=\"if\" value=\"{{errorMessage}}\"> <div class=\"alert alert-error\">{{errorMessage}}</div> </template> <div class=\"form-section\"> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" lyte-model=\"contactName\" class=\"form-input\" placeholder=\"Contact Name\"> </div> <div class=\"form-row\"> <div class=\"form-group\"> <label>Email</label> <input type=\"email\" lyte-model=\"contactEmail\" class=\"form-input\" placeholder=\"email@example.com\"> </div> <div class=\"form-group\"> <label>Phone</label> <input type=\"tel\" lyte-model=\"contactPhone\" class=\"form-input\" placeholder=\"+91 9999999999\"> </div> </div> </div> <div class=\"form-section\"> <div class=\"form-group\"> <label>Company <span class=\"required\">*</span></label> <select lyte-model=\"selectedCompany\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"company\" index=\"i\"></option> </select> </div> <div class=\"form-group\"> <label>Designation</label> <input type=\"text\" lyte-model=\"contactDesignation\" class=\"form-input\" placeholder=\"e.g. CEO\"> </div> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('createContact')}}\" disabled=\"{{isLoading}}\"> <template is=\"if\" value=\"{{isLoading}}\"> Creating... </template> <template is=\"else\"> Create Contact </template> </button> <a href=\"#/contacts\" class=\"btn btn-secondary\">Cancel</a> </div> </div> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,7,1,3,3]},{"type":"for","position":[1,1,1,7,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"company\" index=\"i\"> <option value=\"{{company.id}}\">{{company.name}}</option> </template>"},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["contactName","contactEmail","contactPhone","contactDesignation","selectedCompany","companyList","isLoading","errorMessage"],

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