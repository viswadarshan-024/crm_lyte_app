Lyte.Component.register("company-edit", {
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