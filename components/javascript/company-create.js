Lyte.Component.register("company-create", {
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