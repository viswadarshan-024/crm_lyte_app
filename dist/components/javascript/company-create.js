Lyte.Component.register("company-create", {
_template:"<template tag-name=\"company-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add Company</h1> </div> </header> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Basic Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\" placeholder=\"Acme Corp\"> </div> <div class=\"form-group half\"> <label>Domain</label> <input type=\"text\" id=\"inp_domain\" class=\"form-input\" placeholder=\"acme.com\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"info@acme.com\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\" placeholder=\"+1 555-0199\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Industry</label> <input type=\"text\" id=\"inp_industry\" class=\"form-input\" placeholder=\"Technology\"> </div> <div class=\"form-group half\"> <label>Company Size</label> <select id=\"sel_size\" class=\"form-select\"> <option value=\"\">Select size...</option> <option value=\"1-10\">1-10 employees</option> <option value=\"11-50\">11-50 employees</option> <option value=\"51-200\">51-200 employees</option> <option value=\"201-500\">201-500 employees</option> <option value=\"501+\">501+ employees</option> </select> </div> </div> <button type=\"button\" class=\"btn-secondary mt-4\" onclick=\"{{action('previewEnrichment')}}\" disabled=\"{{isEnriching}}\"> <template is=\"if\" value=\"{{isEnriching}}\"><template case=\"true\"> <div class=\"spinner-sm inline\"></div> Enriching... </template><template case=\"false\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><path d=\"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83\"></path></svg> AI Enrich Data </template></template> </button> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Address</h3> <div class=\"form-group\"> <label>Address Line 1</label> <input type=\"text\" id=\"inp_addr1\" class=\"form-input\" placeholder=\"Street Address\"> </div> <div class=\"form-group\"> <label>Address Line 2</label> <input type=\"text\" id=\"inp_addr2\" class=\"form-input\" placeholder=\"Suite, Floor\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>City</label> <input type=\"text\" id=\"inp_city\" class=\"form-input\" placeholder=\"City\"> </div> <div class=\"form-group half\"> <label>State</label> <input type=\"text\" id=\"inp_state\" class=\"form-input\" placeholder=\"State\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Country</label> <input type=\"text\" id=\"inp_country\" class=\"form-input\" placeholder=\"Country\"> </div> <div class=\"form-group half\"> <label>Postal Code</label> <input type=\"text\" id=\"inp_zip\" class=\"form-input\" placeholder=\"Zip Code\"> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createCompany')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Company</template></template> </button> </div> </form> </div> </div> <template is=\"if\" value=\"{{showEnrichPreview}}\"><template case=\"true\"> <div class=\"modal-backdrop\"> <div class=\"modal-card\"> <div class=\"modal-header\"> <h3>Enrichment Preview</h3> <button onclick=\"{{action('closePreview')}}\" class=\"close-btn\">×</button> </div> <div class=\"modal-body\"> <div class=\"enrich-grid\"> <div class=\"enrich-item\"> <span class=\"lbl\">Domain:</span> <span class=\"val\">{{enrichedData.proposedDomain.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">Industry:</span> <span class=\"val\">{{enrichedData.proposedIndustry.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">Size:</span> <span class=\"val\">{{enrichedData.proposedCompanySize.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">City:</span> <span class=\"val\">{{enrichedData.proposedAddress.value.city}}</span> </div> </div> <p class=\"enrich-note\">Apply this data to auto-fill the form fields?</p> </div> <div class=\"modal-footer\"> <button onclick=\"{{action('closePreview')}}\" class=\"btn-secondary\">Cancel</button> <button onclick=\"{{action('applyEnrichment')}}\" class=\"btn-primary\">Apply Data</button> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 720px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* ACTIONS & BUTTONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.mt-4 { margin-top: 16px; }\n.mr-2 { margin-right: 8px; }\n.inline { display: inline-block; vertical-align: middle; }\n\n.spinner-sm { width: 14px; height: 14px; border: 2px solid #334155; border-top-color: transparent; border-radius: 50%; animation: spin 1s infinite linear; }\n\n/* MODAL */\n.modal-backdrop {\n    position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n    background: rgba(0,0,0,0.5); z-index: 100;\n    display: flex; align-items: center; justify-content: center;\n}\n.modal-card { background: white; border-radius: 12px; width: 400px; padding: 0; overflow: hidden; }\n.modal-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }\n.modal-header h3 { margin: 0; font-size: 16px; }\n.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }\n\n.modal-body { padding: 20px; }\n.enrich-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }\n.enrich-item { display: flex; justify-content: space-between; font-size: 14px; }\n.enrich-item .lbl { color: #64748b; }\n.enrich-item .val { font-weight: 600; color: #1e293b; }\n.enrich-note { font-size: 13px; color: #334155; text-align: center; }\n\n.modal-footer { padding: 16px 20px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px; }\n\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3,1,1,1,9]},{"type":"attr","position":[1,3,1,1,1,9,1]},{"type":"if","position":[1,3,1,1,1,9,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,1,1,5,1]},{"type":"attr","position":[1,3,1,1,5,3]},{"type":"attr","position":[1,3,1,1,5,3,1]},{"type":"if","position":[1,3,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3]},{"type":"text","position":[1,1,3,1,1,3,0]},{"type":"text","position":[1,1,3,1,3,3,0]},{"type":"text","position":[1,1,3,1,5,3,0]},{"type":"text","position":[1,1,3,1,7,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]}]}},"default":{}}],
_observedAttributes :["isEnriching","showEnrichPreview","enrichedData","isSaving"],

	data: function() {
		return {
			// Enrichment State
			isEnriching: Lyte.attr("boolean", { default: false }),
			showEnrichPreview: Lyte.attr("boolean", { default: false }),
			enrichedData: Lyte.attr("object", { default: null }),

			// Submission State
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('COMPANY_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/companies";
		}
	},

	actions: {
		// 1. TRIGGER ENRICHMENT PREVIEW
		previewEnrichment: function() {
			const name = document.getElementById('inp_name').value.trim();
			const domain = document.getElementById('inp_domain').value.trim();

			if (!name && !domain) {
				alert("Please enter a Company Name or Domain first.");
				return;
			}

			this.setData('isEnriching', true);

			const payload = { name: name, domain: domain };

			this.crmPreviewCompanyEnrichment(payload)
				.then((res) => {
					if (res.success && res.data) {
						this.setData('enrichedData', res.data);
						this.setData('showEnrichPreview', true);
					} else {
						alert(res.message || "No enrichment data found.");
					}
				})
				.catch(err => {
					console.error("Enrichment Error", err);
					alert("Enrichment failed.");
				})
				.finally(() => {
					this.setData('isEnriching', false);
				});
		},

		// 2. APPLY ENRICHED DATA TO FORM (FIXED)
		applyEnrichment: function() {
			const data = this.getData('enrichedData');
			if (!data) return;

			// --- SAFE VALUE EXTRACTOR ---
			const getVal = (key) => {
				const item = data[key];
				if (item === null || item === undefined) return "";
				// If it's a wrapper object like { value: "Tech" }, return .value
				if (typeof item === 'object') {
					return item.value || "";
				}
				// Otherwise return it as a string
				return String(item);
			};

			const setEl = (id, val) => {
				if(val) document.getElementById(id).value = val;
			};

			// 1. Domain
			setEl('inp_domain', getVal('proposedDomain'));

			// 2. Industry (Fix for .includes error)
			let industry = getVal('proposedIndustry');
			if (industry) {
				// Force String to be safe
				industry = String(industry);
				if (industry.includes(',')) {
					industry = industry.split(',')[0].trim();
				}
				setEl('inp_industry', industry);
			}

			// 3. Company Size
			const sizeRaw = getVal('proposedCompanySize');
			if (sizeRaw) {
				const range = this.mapCompanySize(sizeRaw);
				setEl('sel_size', range);
			}

			// 4. Address
			// Safe extraction for nested address object
			const addrWrapper = data.proposedAddress;
			const addr = (addrWrapper && addrWrapper.value) ? addrWrapper.value : (addrWrapper || {});

			setEl('inp_addr1', addr.line1 || addr.addressLine1);
			setEl('inp_addr2', addr.line2 || addr.addressLine2);
			setEl('inp_city', addr.city);
			setEl('inp_state', addr.state);
			setEl('inp_country', addr.country);
			setEl('inp_zip', addr.postalCode);

			// Close Modal
			this.setData('showEnrichPreview', false);
		},

		closePreview: function() {
			this.setData('showEnrichPreview', false);
		},

		// 3. CREATE COMPANY
		createCompany: function() {
			const name = document.getElementById('inp_name').value.trim();

			if (!name) {
				alert("Company Name is required");
				return;
			}

			this.setData('isSaving', true);

			const payload = {
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
				postalCode: document.getElementById('inp_zip').value.trim(),

				isEnriched: !!this.getData('enrichedData')
			};

			this.crmSaveCompany(payload)
				.then((res) => {
					if (res.success) {
						alert("Company created successfully!");
						window.location.hash = "#/companies";
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Submission failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/companies";
		}
	},

	// Helper: Map raw size string/number to dropdown range
	mapCompanySize: function(input) {
		if (!input) return "";
		// Handle "190,167" -> 190167
		const num = parseInt(String(input).replace(/[^0-9]/g, ''));
		if (isNaN(num)) return "";

		if (num <= 10) return "1-10";
		if (num <= 50) return "11-50";
		if (num <= 200) return "51-200";
		if (num <= 500) return "201-500";
		return "501+";
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });