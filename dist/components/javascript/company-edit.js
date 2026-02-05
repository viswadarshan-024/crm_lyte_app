Lyte.Component.register("company-edit", {
_template:"<template tag-name=\"company-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Company</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading company...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Basic Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Domain</label> <input type=\"text\" id=\"inp_domain\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Industry</label> <input type=\"text\" id=\"inp_industry\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Company Size</label> <select id=\"sel_size\" class=\"form-select\"> <option value=\"\">Select size...</option> <option value=\"1-10\">1-10 employees</option> <option value=\"11-50\">11-50 employees</option> <option value=\"51-200\">51-200 employees</option> <option value=\"201-500\">201-500 employees</option> <option value=\"501+\">501+ employees</option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Address</h3> <div class=\"form-group\"> <label>Address Line 1</label> <input type=\"text\" id=\"inp_addr1\" class=\"form-input\"> </div> <div class=\"form-group\"> <label>Address Line 2</label> <input type=\"text\" id=\"inp_addr2\" class=\"form-input\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>City</label> <input type=\"text\" id=\"inp_city\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>State</label> <input type=\"text\" id=\"inp_state\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Country</label> <input type=\"text\" id=\"inp_country\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Postal Code</label> <input type=\"text\" id=\"inp_zip\" class=\"form-input\"> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateCompany')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyId","company","isLoading","isSaving"],

	data: function() {
		return {
			companyId: Lyte.attr("string", { default: "" }),

			// Data Model
			company: Lyte.attr("object", { default: {} }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('COMPANY_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/companies";
			return;
		}

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/companies";
			return;
		}

		this.setData('companyId', id);
		this.loadCompany();
	},

	loadCompany: function() {
		this.setData('isLoading', true);
		const id = this.getData('companyId');

		this.crmEditCompany(id)
			.then((res) => {
				if (!res.success) throw new Error(res.message);

				const data = res.data || {};
				this.setData('company', data);

				// FORCE POPULATE INPUTS
				setTimeout(() => {
					this.populateForm(data);
				}, 100);
			})
			.catch(err => {
				console.error("Load Error", err);
				alert("Failed to load company.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_name', data.name);
		setVal('inp_domain', data.domain);
		setVal('inp_email', data.email);
		setVal('inp_phone', data.phone);
		setVal('inp_industry', data.industry);

		// Handle Company Size dropdown
		const sizeEl = document.getElementById('sel_size');
		if (sizeEl && data.companySize) {
			sizeEl.value = data.companySize;
		}

		// Address (flat structure in API response based on action class)
		// Check if API returns nested address object or flat fields
		// Based on action: response returns CompanyResponse which likely has nested AddressDto or flat fields.
		// Let's handle both for safety.
		const addr = data.address || data;

		setVal('inp_addr1', addr.addressLine1 || addr.line1);
		setVal('inp_addr2', addr.addressLine2 || addr.line2);
		setVal('inp_city', addr.city);
		setVal('inp_state', addr.state);
		setVal('inp_country', addr.country);
		setVal('inp_zip', addr.postalCode);
	},

	actions: {
		updateCompany: function() {
			// Direct DOM Reading
			const name = document.getElementById('inp_name').value.trim();
			if (!name) { alert("Company Name is required"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('companyId')), // Important for Update
				name: name,
				domain: document.getElementById('inp_domain').value.trim(),
				email: document.getElementById('inp_email').value.trim(),
				phone: document.getElementById('inp_phone').value.trim(),
				industry: document.getElementById('inp_industry').value.trim(),
				companySize: document.getElementById('sel_size').value,

				addressLine1: document.getElementById('inp_addr1').value.trim(),
				addressLine2: document.getElementById('inp_addr2').value.trim(),
				city: document.getElementById('inp_city').value.trim(),
				state: document.getElementById('inp_state').value.trim(),
				country: document.getElementById('inp_country').value.trim(),
				postalCode: document.getElementById('inp_zip').value.trim()
			};

			this.crmSaveCompany(payload)
				.then((res) => {
					if (res.success) {
						alert("Company updated successfully!");
						window.location.hash = "#/companies/view/" + this.getData('companyId');
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
			window.location.hash = "#/companies/" + this.getData('companyId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });