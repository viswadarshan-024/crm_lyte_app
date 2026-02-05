Lyte.Component.register("activity-edit", {
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