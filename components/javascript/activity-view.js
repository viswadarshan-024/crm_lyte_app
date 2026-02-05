Lyte.Component.register("activity-view", {
	data: function() {
		return {
			activityId: Lyte.attr("string", { default: "" }),

			// Data Models
			activity: Lyte.attr("object", { default: {} }),
			deal: Lyte.attr("object", { default: null }), // Can be null
			company: Lyte.attr("object", { default: null }), // Can be null

			// Status Logic
			statusOptions: Lyte.attr("array", { default: [] }), // List of next allowed states
			isTerminal: Lyte.attr("boolean", { default: false }),

			// Visuals
			statusColor: Lyte.attr("string", { default: "#cbd5e1" }),
			statusBg: Lyte.attr("string", { default: "#f1f5f9" }),
			formattedDueDate: Lyte.attr("string", { default: "" }),
			isOverdue: Lyte.attr("boolean", { default: false }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			canChangeStatus: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		const params = this.getData('params');
		// Fallback if router doesn't pass params directly
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/activities";
			return;
		}

		this.setData('activityId', id);

		// Permissions
		this.setData('canEdit', this.hasPermission('ACTIVITY_UPDATE'));
		this.setData('canDelete', this.hasPermission('ACTIVITY_DELETE'));
		this.setData('canChangeStatus', this.hasPermission('ACTIVITY_CHANGE_STATUS'));

		this.loadActivity();
	},

	loadActivity: function() {
		this.setData('isLoading', true);
		const id = this.getData('activityId');

		this.crmGetActivity(id)
			.then((res) => {
				const data = res.data || {};
				const act = data.activity || {};

				// 1. Core Data
				this.setData('activity', act);
				this.setData('deal', data.deal || null);
				this.setData('company', data.company || null);

				// 2. Status Options (Next Steps)
				const opts = data.statusOptions || {};
				this.setData('statusOptions', opts.allowedNext || []);
				this.setData('isTerminal', !!opts.terminal);

				// 3. Visuals & Formatting
				this.calculateStatusVisuals(act.statusCode, act.type);
				this.calculateDates(act.dueDate, opts.terminal);

			})
			.catch(err => {
				console.error("Activity Load Error", err);
				alert("Failed to load activity.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- LOGIC HELPERS ---

	calculateStatusVisuals: function(status, type) {
		// Simple color mapping
		const colors = {
			'COMPLETED': { text: '#10b981', bg: '#dcfce7' }, // Green
			'DONE': { text: '#10b981', bg: '#dcfce7' },
			'MISSED': { text: '#ef4444', bg: '#fee2e2' },    // Red
			'CANCELLED': { text: '#64748b', bg: '#f1f5f9' }, // Gray
			'SCHEDULED': { text: '#3b82f6', bg: '#dbeafe' }, // Blue
			'PENDING': { text: '#f59e0b', bg: '#fef3c7' }    // Orange
		};

		const theme = colors[status] || colors['PENDING'];
		this.setData('statusColor', theme.text);
		this.setData('statusBg', theme.bg);
	},

	calculateDates: function(dateObj, isTerminal) {
		if (!dateObj || !dateObj.year) {
			this.setData('formattedDueDate', '-');
			this.setData('isOverdue', false);
			return;
		}

		// Format
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let str = shortMonths[dateObj.monthValue - 1] + " " + dateObj.dayOfMonth + ", " + dateObj.year;
		this.setData('formattedDueDate', str);

		// Overdue Check
		if (isTerminal) {
			this.setData('isOverdue', false);
		} else {
			const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
			const today = new Date();
			today.setHours(0,0,0,0);
			this.setData('isOverdue', d < today);
		}
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/activities";
		},

		editActivity: function() {
			// window.location.hash = "#/activities/:id/edit".replace(':id', this.getData('activityId'));
			window.location.hash = "#/activities/edit/" + this.getData('activityId');
		},

		deleteActivity: function() {
			if (confirm("Delete this activity? This cannot be undone.")) {
				this.crmDeleteActivity(this.getData('activityId')).then((res) => {
					if (res.success) {
						alert("Activity deleted");
						window.location.hash = "#/activities";
					} else {
						alert(res.message || "Failed to delete");
					}
				});
			}
		},

		changeStatus: function(newCode) {
			this.crmUpdateActivityStatus({
				id: this.getData('activityId'),
				statusCode: newCode
			}).then((res) => {
				if (res.success) {
					// Reload to get new allowed options
					this.loadActivity();
				} else {
					alert("Status update failed: " + res.message);
				}
			});
		},

		viewDeal: function(id) {
			window.location.hash = "#/deals/" + id;
		},

		viewCompany: function(id) {
			window.location.hash = "#/companies/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });