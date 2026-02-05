Lyte.Component.register("contact-edit", {
	data: function() {
		return {
			contactId: Lyte.attr("string", { default: "" }),

			// Data Models
			contact: Lyte.attr("object", { default: {} }),
			companies: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('CONTACT_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/contacts";
			return;
		}

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/contacts";
			return;
		}

		this.setData('contactId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('contactId');

		Promise.all([
			this.crmEditContact(id),
			this.crmGetCompanies()
		]).then((responses) => {
			const [contactRes, compRes] = responses;

			if (!contactRes.success) throw new Error(contactRes.message);

			// 1. Process Contact
			const contactData = contactRes.data || {};
			this.setData('contact', contactData);

			// 2. Process Companies
			this.setData('companies', compRes.data || []);

			// 3. Force Populate Form
			setTimeout(() => {
				this.populateForm(contactData);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load contact.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_name', data.name);
		setVal('inp_email', data.email);
		setVal('inp_phone', data.phone);
		// API returns jobTitle, sometimes mapped to designation in older UIs
		setVal('inp_job', data.jobTitle || data.designation);

		// Select Company
		const compEl = document.getElementById('sel_company');
		if (compEl && data.companyId) {
			compEl.value = data.companyId;
		}
	},

	actions: {
		updateContact: function() {
			// Direct DOM Reading
			const name = document.getElementById('inp_name').value.trim();
			if (!name) { alert("Contact Name is required"); return; }

			const companyId = document.getElementById('sel_company').value;

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('contactId')),
				name: name,
				email: document.getElementById('inp_email').value.trim(),
				phone: document.getElementById('inp_phone').value.trim(),
				jobTitle: document.getElementById('inp_job').value.trim(),
				companyId: companyId ? parseInt(companyId) : null
			};

			this.crmSaveContact(payload)
				.then((res) => {
					if (res.success) {
						alert("Contact updated successfully!");
						window.location.hash = "#/contacts/view/" + this.getData('contactId');
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
			window.location.hash = "#/contacts/" + this.getData('contactId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });