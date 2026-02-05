Lyte.Component.register("activity-create", {
	data: function() {
		return {
			// Dropdown Data
			deals: Lyte.attr("array", { default: [] }),

			// UI State
			selectedType: Lyte.attr("string", { default: "TASK" }),
			selectedDealId: Lyte.attr("string", { default: "" }),
			currentStatusHint: Lyte.attr("string", { default: "PENDING" }),

			// Visual Config (Types)
			activityTypes: Lyte.attr("array", { default: [
					{ id: 'TASK', label: 'Task', defaultStatus: 'PENDING', icon: 'task' },
					{ id: 'CALL', label: 'Call', defaultStatus: 'SCHEDULED', icon: 'call' },
					{ id: 'MEETING', label: 'Meeting', defaultStatus: 'SCHEDULED', icon: 'meeting' },
					{ id: 'EMAIL', label: 'Email', defaultStatus: 'DRAFT', icon: 'email' },
					{ id: 'LETTER', label: 'Letter', defaultStatus: 'DRAFT', icon: 'letter' },
					{ id: 'SOCIAL_MEDIA', label: 'Social Media', defaultStatus: 'DRAFT', icon: 'social' }
				]}),

			// Loading
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false }),
			todayDate: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('ACTIVITY_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/activities";
			return;
		}

		// Set Min Date to Today
		this.setData('todayDate', new Date().toISOString().split('T')[0]);

		// Check for URL param (pre-select deal)
		const params = this.getData('params') || {};
		// If your router passes query params differently, adjust here.
		// Assuming standard Lyte routing or URL parsing:
		const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
		const dealId = urlParams.get('dealId');
		if (dealId) {
			this.setData('selectedDealId', dealId);
		}

		this.loadDeals();
	},

	loadDeals: function() {
		this.setData('isLoading', true);
		this.crmGetDeals()
			.then((res) => {
				const list = res.data || [];
				// API returns flat deal objects
				this.setData('deals', list);
			})
			.catch(err => {
				console.error("Deals Load Error", err);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	actions: {
		selectType: function(typeId, defaultStatus) {
			this.setData('selectedType', typeId);
			this.setData('currentStatusHint', defaultStatus.replace('_', ' '));
		},

		createActivity: function() {
			// 1. Direct DOM Reading
			const type = this.getData('selectedType'); // This is safe from state
			const dealId = document.getElementById('sel_deal').value;
			const description = document.getElementById('inp_desc').value.trim();
			const dueDate = document.getElementById('inp_date').value;

			// 2. Validation
			if (!dealId) {
				alert("Please select a Related Deal");
				return;
			}
			if (!dueDate) {
				alert("Please select a Due Date");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				dealId: parseInt(dealId),
				type: type,
				description: description,
				dueDate: dueDate
			};

			this.crmSaveActivity(payload)
				.then((res) => {
					if (res.success) {
						alert("Activity created successfully!");
						window.location.hash = "#/activities";
					} else {
						alert("Error: " + (res.message || "Creation failed"));
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
			window.location.hash = "#/activities";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });