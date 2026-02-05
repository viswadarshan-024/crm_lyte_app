Lyte.Component.register("contact-edit", {
_template:"<template tag-name=\"contact-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Contact</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading contact...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Contact Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Professional Details</h3> <div class=\"form-group\"> <label>Company</label> <select id=\"sel_company\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group\"> <label>Job Title</label> <input type=\"text\" id=\"inp_job\" class=\"form-input\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateContact')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["contactId","contact","companies","isLoading","isSaving"],

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