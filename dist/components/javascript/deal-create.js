Lyte.Component.register("deal-create", {
_template:"<template tag-name=\"deal-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">New Deal</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading configuration...</p> </div> </template><template case=\"false\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Deal Details</h3> <div class=\"form-group\"> <label>Deal Title <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_title\" lyte-model=\"title\" class=\"form-input\" placeholder=\"e.g. Acme Corp Enterprise License\" maxlength=\"150\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Amount ($) <span class=\"required\">*</span></label> <input type=\"number\" id=\"inp_amount\" lyte-model=\"amount\" class=\"form-input\" step=\"0.01\" min=\"0.01\" placeholder=\"0.00\"> </div> <div class=\"form-group half\"> <label>Order Type <span class=\"required\">*</span></label> <select lyte-model=\"orderType\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{orderTypes}}\" item=\"type\"></option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Ownership</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company <span class=\"required\">*</span></label> <select id=\"sel_company\" lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanySelect',event)}}\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group half\"> <label>Assigned To <span class=\"required\">*</span></label> <select lyte-model=\"assignedUserId\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{users}}\" item=\"u\"></option> </select> </div> </div> <div class=\"form-group\"> <label>Contacts <span class=\"hint-text\">(Select company to view)</span></label> <div class=\"contacts-box\"> <template is=\"if\" value=\"{{expHandlers(selectedCompany,'!')}}\"><template case=\"true\"> <div class=\"empty-msg\">Please select a company first.</div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(filteredContacts.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-msg\">No contacts found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{filteredContacts}}\" item=\"c\"> <label class=\"contact-row\"> <input type=\"checkbox\" onchange=\"{{action('toggleContact',c.id,event)}}\"> <div class=\"contact-text\"> <div class=\"c-name\">{{c.name}}</div> <div class=\"c-job\">{{c.jobTitle}}</div> </div> </label> </template> </template></template> </template></template> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createDeal')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Create Deal</template></template> </button> </div> </form> </div> </template></template> </div> </template>\n<style>.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    overflow-y: auto;\n}\n\n.form-card {\n    background: white;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 30px;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}\n\n.form-section { margin-bottom: 30px; }\n.section-title {\n    font-size: 12px; font-weight: bold; text-transform: uppercase;\n    color: #94a3b8; border-bottom: 1px solid #e2e8f0;\n    padding-bottom: 8px; margin-bottom: 15px;\n}\n\n.form-row { display: flex; gap: 20px; }\n.half { flex: 1; }\n\n.form-group { margin-bottom: 15px; }\n.form-group label {\n    display: block; font-size: 14px; font-weight: 500;\n    color: #334155; margin-bottom: 5px;\n}\n.required { color: #ef4444; }\n.hint-text { font-weight: normal; font-size: 12px; color: #94a3b8; margin-left: 5px; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px; border: 1px solid #cbd5e1;\n    border-radius: 6px; font-size: 14px; box-sizing: border-box; /* Fix width issues */\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; }\n\n/* CONTACTS BOX */\n.contacts-box {\n    border: 1px solid #cbd5e1; border-radius: 6px;\n    background: #f8fafc;\n    height: 200px; overflow-y: auto;\n}\n.empty-msg {\n    padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;\n    display: flex; align-items: center; justify-content: center; height: 100%;\n}\n\n.contact-row {\n    display: flex; align-items: center; gap: 10px;\n    padding: 10px 15px; border-bottom: 1px solid #e2e8f0;\n    cursor: pointer; background: white;\n}\n.contact-row:hover { background: #f1f5f9; }\n.contact-row input { cursor: pointer; }\n\n.c-name { font-size: 14px; font-weight: 500; color: #1e293b; }\n.c-job { font-size: 12px; color: #64748b; }\n\n/* ACTIONS */\n.form-actions {\n    display: flex; justify-content: flex-end; gap: 10px;\n    padding-top: 20px; border-top: 1px solid #e2e8f0;\n}\n.btn-primary, .btn-secondary {\n    padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;\n}\n.btn-primary { background: #2563eb; color: white; border: none; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; }\n.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,3,3,1]},{"type":"for","position":[1,1,1,5,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{orderTypes}}\" item=\"type\"> <option value=\"{{type}}\">{{type}}</option> </template>"},{"type":"attr","position":[1,1,3,3,1,3]},{"type":"attr","position":[1,1,3,3,1,3,3]},{"type":"for","position":[1,1,3,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,3,3,3,3,1]},{"type":"for","position":[1,1,3,3,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]},{"type":"text","position":[1,2]}],"actualTemplate":"<template is=\"for\" items=\"{{users}}\" item=\"u\"> <option value=\"{{u.id}}\">{{u.fullName}} ({{u.roleName}})</option> </template>"},{"type":"attr","position":[1,1,3,5,3,1]},{"type":"if","position":[1,1,3,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"attr","position":[1,1,5,3,1]},{"type":"if","position":[1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companies","users","orderTypes","allContacts","filteredContacts","selectedContactIds","title","amount","orderType","selectedCompany","assignedUserId","isLoading","isSaving"],

	// ... (keep data and didConnect the same) ...
	data: function() {
		return {
			companies: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }),
			orderTypes: Lyte.attr("array", { default: [] }),
			allContacts: Lyte.attr("array", { default: [] }),
			filteredContacts: Lyte.attr("array", { default: [] }),
			selectedContactIds: Lyte.attr("array", { default: [] }),

			title: Lyte.attr("string", { default: "" }),
			amount: Lyte.attr("string", { default: "" }),
			orderType: Lyte.attr("string", { default: "STANDARD" }),
			selectedCompany: Lyte.attr("string", { default: "" }),
			assignedUserId: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('DEAL_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/deals";
			return;
		}
		this.loadInitialData();
	},

	loadInitialData: function() {
		this.setData('isLoading', true);
		Promise.all([
			this.crmAddDeal(),
			this.crmGetContacts({})
		]).then((responses) => {
			const [metaRes, contactRes] = responses;
			if (metaRes.success && metaRes.data) {
				this.setData('companies', metaRes.data.companies || []);
				this.setData('users', metaRes.data.users || []);
				this.setData('orderTypes', metaRes.data.orderTypes || []);
				const currentUser = this.getAuthUser();
				if (currentUser && currentUser.userId) {
					this.setData('assignedUserId', currentUser.userId);
				}
			}
			let contacts = [];
			if (contactRes && contactRes.data && Array.isArray(contactRes.data.data)) {
				contacts = contactRes.data.data;
			} else if (contactRes && Array.isArray(contactRes.data)) {
				contacts = contactRes.data;
			}
			this.setData('allContacts', contacts);
		}).catch(err => {
			console.error(err);
			alert("Error loading form data");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	actions: {
		onCompanySelect: function(event) {
			const element = event.target;
			const compId = element.value;

			this.setData('selectedCompany', compId);
			this.setData('selectedContactIds', []); // Reset contacts

			if (!compId) {
				this.setData('filteredContacts', []);
				return;
			}

			const all = this.getData('allContacts');
			const relevant = all.filter(c => String(c.companyId) === String(compId));
			this.setData('filteredContacts', relevant);
		},

		toggleContact: function(contactId, event) {
			let selected = this.getData('selectedContactIds') || [];
			if (event.target.checked) {
				selected.push(contactId);
			} else {
				selected = selected.filter(id => id !== contactId);
			}
			this.setData('selectedContactIds', selected);
		},

		createDeal: function() {
			// 1. Get Elements
			const titleInput = document.getElementById('inp_title');
			const amountInput = document.getElementById('inp_amount');
			const companySelect = document.getElementById('sel_company'); // FIX: Get Select Element

			// 2. Read Values Directly
			const rawTitle = titleInput ? titleInput.value : "";
			const rawAmount = amountInput ? amountInput.value : "";
			const rawCompId = companySelect ? companySelect.value : ""; // FIX: Read Value

			console.log("DOM Read - Title:", rawTitle, "Amount:", rawAmount, "Company:", rawCompId);

			// 3. Validation
			if (!rawTitle || rawTitle.trim() === "") {
				alert("Please enter a Deal Title");
				return;
			}

			const amountVal = parseFloat(rawAmount);
			if (isNaN(amountVal) || amountVal <= 0) {
				alert("Please enter a valid Amount");
				return;
			}

			// Check if Company ID exists
			if (!rawCompId || rawCompId === "") {
				alert("Please select a Company");
				return;
			}

			this.setData('isSaving', true);

			// 4. Payload
			const payload = {
				title: rawTitle.trim(),
				amount: Number(amountVal),
				orderType: this.getData('orderType'),
				companyId: Number(rawCompId),
				assignedUserId: Number(this.getData('assignedUserId')),
				contactIds: this.getData('selectedContactIds')
			};


			this.crmSaveDeal(payload)
				.then((res) => {
					if (res.success) {
						alert("Deal created successfully!");
						window.location.hash = "#/deals";
					} else {
						throw new Error(res.message || "Creation failed");
					}
				})
				.catch((err) => {
					alert("Error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/deals";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });