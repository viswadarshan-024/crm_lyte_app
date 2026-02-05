Lyte.Component.register("activity-edit", {
_template:"<template tag-name=\"activity-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Activity</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activity...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Type</h3> <div class=\"activity-display\"> <div class=\"type-icon {{activity.type}}\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> <div class=\"act-meta\"> <div class=\"act-type\">{{activity.type}}</div> <div class=\"act-id\">ID: #{{activity.id}}</div> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Details</h3> <div class=\"form-group\"> <label>Related Deal <span class=\"required\">*</span></label> <select id=\"sel_deal\" class=\"form-select\" lyte-model=\"selectedDealId\"> <option value=\"\">Select Deal...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{deals}}\" item=\"d\"></option> </select> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" class=\"form-textarea\" rows=\"4\" lyte-model=\"description\"></textarea> </div> <div class=\"form-group\"> <label>Due Date <span class=\"required\">*</span></label> <input type=\"date\" id=\"inp_date\" class=\"form-input\" lyte-model=\"dueDate\"> </div> <div class=\"form-group\"> <label>Status</label> <template is=\"if\" value=\"{{isTerminal}}\"><template case=\"true\"> <div class=\"status-badge\" style=\"background-color: {{statusBg}}; color: {{statusColor}}\"> {{currentStatusLabel}} </div> </template><template case=\"false\"> <select id=\"sel_status\" class=\"form-select\" lyte-model=\"selectedStatus\"> <option is=\"for\" lyte-for=\"true\" items=\"{{statusOptions}}\" item=\"opt\"></option> </select> </template></template> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateActivity')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n/* ACTIVITY TYPE HEADER */\n.activity-display { display: flex; align-items: center; gap: 15px; }\n.type-icon {\n    width: 48px; height: 48px; border-radius: 10px; background: #e0f2fe; color: #0284c7;\n    display: flex; align-items: center; justify-content: center;\n}\n/* Color overrides if needed */\n.type-icon.CALL { background: #dcfce7; color: #166534; }\n.type-icon.TASK { background: #dbeafe; color: #1e40af; }\n\n.act-type { font-weight: 700; color: #334155; font-size: 16px; }\n.act-id { font-size: 13px; color: #94a3b8; }\n\n/* FORMS */\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.status-badge {\n    display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;\n}\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,3,1]},{"type":"text","position":[1,1,1,1,3,3,1,0]},{"type":"text","position":[1,1,1,1,3,3,3,1]},{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{deals}}\" item=\"d\"> <option value=\"{{d.id}}\">{{d.title}}</option> </template>"},{"type":"attr","position":[1,1,1,3,9,3]},{"type":"if","position":[1,1,1,3,9,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","statusBg","'; color: '","statusColor"]}}}},{"type":"text","position":[1,1]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{statusOptions}}\" item=\"opt\"> <option value=\"{{opt.code}}\">{{opt.label}}</option> </template>"}]}},"default":{}},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["activityId","activity","deals","statusOptions","isLoading","isSaving","isTerminal","currentStatusLabel","statusColor","statusBg"],

	data: function() {
		return {
			activityId: Lyte.attr("string", { default: "" }),

			// Data Models
			activity: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			statusOptions: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false }),
			isTerminal: Lyte.attr("boolean", { default: false }),
			currentStatusLabel: Lyte.attr("string", { default: "" }),
			statusColor: Lyte.attr("string", { default: "" }),
			statusBg: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('ACTIVITY_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/activities";
			return;
		}

		// Robust ID Extraction
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/activities";
			return;
		}

		this.setData('activityId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('activityId');

		Promise.all([
			this.crmGetActivity(id),
			this.crmGetDeals()
		]).then((responses) => {
			const [actRes, dealsRes] = responses;

			if (!actRes.success) throw new Error(actRes.message);

			// 1. Setup Data
			const actData = actRes.data || {};
			const activity = actData.activity || {};
			this.setData('activity', activity);
			this.setData('deals', dealsRes.data || []);

			// 2. Status Logic
			if (actData.statusOptions) {
				this.processStatusOptions(actData.statusOptions, activity.statusCode);
			} else {
				this.crmGetActivityStatusOptions(activity.type, activity.statusCode)
					.then((sRes) => this.processStatusOptions(sRes.data || {}, activity.statusCode));
			}

			// 3. FORCE POPULATE FORM (FIXED)
			// Use setTimeout to ensure DOM is rendered before setting values
			setTimeout(() => {
				this.populateForm(activity, actData.deal);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// --- MANUALLY SET INPUT VALUES ---
	populateForm: function(activity, deal) {
		// 1. Description
		const descEl = document.getElementById('inp_desc');
		if (descEl) descEl.value = activity.description || "";

		// 2. Deal Selector
		const dealId = activity.dealId || (deal ? deal.id : "");
		const dealEl = document.getElementById('sel_deal');
		if (dealEl) dealEl.value = dealId;

		// 3. Date
		const dateEl = document.getElementById('inp_date');
		if (dateEl) dateEl.value = this.parseDateForInput(activity.dueDate);

		// 4. Status (if dropdown exists)
		const statusEl = document.getElementById('sel_status');
		if (statusEl) statusEl.value = activity.statusCode;
	},

	// Helper: Format Date for Input
	parseDateForInput: function(dateObj) {
		if (!dateObj) return "";
		if (typeof dateObj === 'string') return dateObj.split('T')[0];

		if (typeof dateObj === 'object' && dateObj.year) {
			const y = dateObj.year;
			const m = String(dateObj.monthValue).padStart(2, '0');
			const d = String(dateObj.dayOfMonth).padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		return "";
	},

	processStatusOptions: function(options, currentCode) {
		const allowed = options.allowedNext || [];
		const isTerminal = !!options.terminal;

		this.setData('isTerminal', isTerminal);

		if (!isTerminal) {
			const currentLabel = this.formatStatus(currentCode) + " (Current)";
			const dropdownList = [
				{ code: currentCode, label: currentLabel },
				...allowed
			];
			this.setData('statusOptions', dropdownList);
		} else {
			this.setData('currentStatusLabel', this.formatStatus(currentCode));
			const colorMap = { 'COMPLETED': '#10b981', 'MISSED': '#ef4444', 'CANCELLED': '#64748b' };
			const bgMap = { 'COMPLETED': '#dcfce7', 'MISSED': '#fee2e2', 'CANCELLED': '#f1f5f9' };

			this.setData('statusColor', colorMap[currentCode] || '#64748b');
			this.setData('statusBg', bgMap[currentCode] || '#f1f5f9');
		}
	},

	formatStatus: function(code) {
		if(!code) return "";
		return code.charAt(0) + code.slice(1).toLowerCase().replace('_', ' ');
	},

	actions: {
		updateActivity: function() {
			// Direct DOM Reading
			const dealId = document.getElementById('sel_deal').value;
			const description = document.getElementById('inp_desc').value.trim();
			const dueDate = document.getElementById('inp_date').value;
			const statusSelect = document.getElementById('sel_status');
			const statusCode = statusSelect ? statusSelect.value : this.getData('activity').statusCode;

			if (!dealId) { alert("Please select a Deal"); return; }
			if (!dueDate) { alert("Please select a Due Date"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('activityId')),
				type: this.getData('activity').type,
				dealId: parseInt(dealId),
				description: description,
				dueDate: dueDate,
				statusCode: statusCode
			};

			this.crmUpdateActivity(payload)
				.then((res) => {
					if (res.success) {
						alert("Activity updated successfully!");
						window.location.hash = "#/activities/view/" + this.getData('activityId');
					} else {
						alert("Error: " + (res.message || "Update failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/activities/" + this.getData('activityId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });