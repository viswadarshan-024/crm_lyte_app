Lyte.Component.register("activity-list", {
	data: function() {
		return {
			// Data
			allActivities: Lyte.attr("array", { default: [] }),
			// FIX 1: Change to array so .length check works in template
			groupedActivities: Lyte.attr("array", { default: [] }),
			groupOrder: Lyte.attr("array", { default: [] }),

			// Filters
			currentStatusFilter: Lyte.attr("string", { default: "all" }),
			currentTypeFilter: Lyte.attr("string", { default: null }),

			// Counts
			counts: Lyte.attr("object", {
				default: { all: 0, pending: 0, overdue: 0, completed: 0 }
			}),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Constants
			ACTIVITY_TYPES: Lyte.attr("array", {
				default: ['TASK', 'CALL', 'MEETING', 'EMAIL', 'LETTER', 'SOCIAL_MEDIA']
			}),
			TERMINAL_STATUSES: Lyte.attr("object", {
				default: {
					TASK: ['DONE'],
					CALL: ['COMPLETED', 'MISSED'],
					MEETING: ['HELD', 'CANCELLED'],
					EMAIL: ['SENT', 'FAILED'],
					LETTER: ['SENT', 'CANCELLED'],
					SOCIAL_MEDIA: ['POSTED']
				}
			})
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('ACTIVITY_CREATE'));
		this.loadActivities();
	},

	loadActivities: function() {
		this.setData('isLoading', true);

		this.crmGetActivities()
			.then((res) => {
				let rawList = [];

				// 1. EXTRACTION (Matches your API: { data: [...] })
				if (res && Array.isArray(res.data)) {
					rawList = res.data;
				} else if (Array.isArray(res)) {
					rawList = res;
				} else if (res && res.data && Array.isArray(res.data.data)) {
					rawList = res.data.data;
				}

				// 2. NORMALIZE
				const cleanList = rawList.map(a => {
					let type = a.type || 'TASK';
					let status = a.statusCode || 'PENDING';
					// Handles your API where date is an object inside 'dueDate' or 'createdAt'
					let targetDate = a.dueDate || a.createdAt;

					return {
						id: a.id,
						description: a.description || "No description",
						type: type,
						statusCode: status,
						dealTitle: a.dealTitle, // API has this field

						// Helper booleans
						isCompleted: this.checkIfCompleted(type, status),
						isOverdue: this.checkIfOverdue(targetDate, type, status),

						// Formatted Strings
						formattedDate: this.formatJavaDate(targetDate),
						relativeLabel: this.getRelativeDateLabel(targetDate),

						// UI Helpers
						iconClass: type.toLowerCase(),
						statusColor: this.getStatusColor(status)
					};
				});

				this.setData('allActivities', cleanList);
				this.updateCounts();
				this.applyFilters();
			})
			.catch(err => {
				console.error("Activity load error", err);
				this.setData('allActivities', []); // Ensure empty state on error
				this.applyFilters();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// ... (Your Filter/Group Logic is Correct) ...

	applyFilters: function() {
		const all = this.getData('allActivities');
		const statusFilter = this.getData('currentStatusFilter');
		const typeFilter = this.getData('currentTypeFilter');

		let filtered = all.filter(a => {
			if (typeFilter && a.type !== typeFilter) return false;

			if (statusFilter === 'pending') return !a.isCompleted && !a.isOverdue;
			if (statusFilter === 'overdue') return a.isOverdue;
			if (statusFilter === 'completed') return a.isCompleted;

			return true;
		});

		this.groupByDate(filtered);
	},

	groupByDate: function(list) {
		const groups = { 'Overdue': [], 'Today': [], 'Tomorrow': [], 'This Week': [], 'Later': [], 'Completed': [] };

		list.forEach(a => {
			if (a.isCompleted) {
				groups['Completed'].push(a);
			} else if (a.isOverdue) {
				groups['Overdue'].push(a);
			} else {
				const label = a.relativeLabel || 'Later';
				if (groups[label]) groups[label].push(a);
				else groups['Later'].push(a);
			}
		});

		let finalGroups = [];
		let order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'Completed'];

		order.forEach(key => {
			if (groups[key].length > 0) {
				finalGroups.push({
					title: key,
					count: groups[key].length,
					items: groups[key]
				});
			}
		});

		this.setData('groupedActivities', finalGroups);
	},

	updateCounts: function() {
		const all = this.getData('allActivities');
		const typeFilter = this.getData('currentTypeFilter');

		const base = typeFilter ? all.filter(a => a.type === typeFilter) : all;

		const overdue = base.filter(a => a.isOverdue).length;
		const completed = base.filter(a => a.isCompleted).length;
		const total = base.length;
		const pending = total - overdue - completed;

		this.setData('counts', { all: total, pending: pending, overdue: overdue, completed: completed });
	},

	// --- HELPER LOGIC (Correct) ---
	checkIfCompleted: function(type, status) {
		const terminals = this.getData('TERMINAL_STATUSES');
		const doneStates = terminals[type] || [];
		return doneStates.includes(status);
	},

	checkIfOverdue: function(dateObj, type, status) {
		if (this.checkIfCompleted(type, status)) return false;
		if (!dateObj || !dateObj.year) return false;

		const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
		const today = new Date();
		today.setHours(0,0,0,0);

		return d < today;
	},

	getRelativeDateLabel: function(dateObj) {
		if (!dateObj || !dateObj.year) return 'Later';

		const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
		const today = new Date();
		today.setHours(0,0,0,0);

		const diffTime = d - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays > 1 && diffDays <= 7) return 'This Week';

		return 'Later';
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let mStr = shortMonths[dateObj.monthValue - 1] || "";
		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	getStatusColor: function(status) {
		if (['DONE', 'COMPLETED', 'HELD', 'SENT', 'POSTED'].includes(status)) return '#10b981';
		if (['MISSED', 'CANCELLED', 'FAILED'].includes(status)) return '#ef4444';
		return '#64748b';
	},

	actions: {
		filterStatus: function(status) {
			this.setData('currentStatusFilter', status);
			this.applyFilters();
		},
		filterType: function(type) {
			let current = this.getData('currentTypeFilter');
			let newFilter = (current === type) ? null : type;
			this.setData('currentTypeFilter', newFilter);
			this.applyFilters();
			this.updateCounts();
		},
		createActivity: function() { window.location.hash = "#/activities/create"; },
		viewActivity: function(id) { window.location.hash = "#/activities/" + id; }
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });