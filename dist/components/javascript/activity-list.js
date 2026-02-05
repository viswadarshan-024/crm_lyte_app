Lyte.Component.register("activity-list", {
_template:"<template tag-name=\"activity-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Activities</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createActivity')}}\" class=\"add-btn\"> <span>+ New Activity</span> </button> </template></template> </header> <div class=\"filter-bar\"> <div class=\"status-tabs\"> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','all'),'?:','active','')}}\" onclick=\"{{action('filterStatus','all')}}\"> All <span class=\"count\">{{counts.all}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','pending'),'?:','active','')}}\" onclick=\"{{action('filterStatus','pending')}}\"> Pending <span class=\"count\">{{counts.pending}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','overdue'),'?:','active','')}}\" onclick=\"{{action('filterStatus','overdue')}}\"> Overdue <span class=\"count\">{{counts.overdue}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','completed'),'?:','active','')}}\" onclick=\"{{action('filterStatus','completed')}}\"> Completed <span class=\"count\">{{counts.completed}}</span> </button> </div> <div class=\"type-filters\"> <template is=\"for\" items=\"{{ACTIVITY_TYPES}}\" item=\"type\" index=\"k\"> <button class=\"type-btn {{expHandlers(expHandlers(currentTypeFilter,'==',type),'?:','active','')}}\" onclick=\"{{action('filterType',type)}}\" title=\"{{type}}\"> <span class=\"type-icon {{type}}\"></span> </button> </template> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activities...</p> </div> </template><template case=\"false\"> <div class=\"activities-card\"> <template is=\"if\" value=\"{{expHandlers(groupedActivities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No activities found matching your filters.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{groupedActivities}}\" item=\"group\" index=\"i\"> <div class=\"group-section\"> <div class=\"group-header\">{{group.title}} ({{group.count}})</div> <template is=\"for\" items=\"{{group.items}}\" item=\"act\" index=\"j\"> <div class=\"activity-row {{expHandlers(act.isOverdue,'?:','overdue','')}}\" onclick=\"{{action('viewActivity',act.id)}}\"> <div class=\"row-icon-box {{act.type}}\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"row-content\"> <div class=\"row-header\"> <span class=\"type-label\">{{act.type}}</span> <span class=\"status-badge\" style=\"color: {{act.statusColor}}\">{{act.statusCode}}</span> </div> <div class=\"row-desc\">{{act.description}}</div> <div class=\"row-meta\"> <span class=\"{{expHandlers(act.isOverdue,'?:','text-danger','')}}\">{{act.formattedDate}}</span> <template is=\"if\" value=\"{{act.dealTitle}}\"><template case=\"true\"> <span class=\"dot\">•</span> <span class=\"deal-link\">{{act.dealTitle}}</span> </template></template> </div> </div> <div class=\"row-action\">›</div> </div> </template> </div> </template> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* FIX: Stop the whole page from scrolling */\n}\n\n/* HEADER */\n.page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Prevent header from squishing */\n}\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n/* FILTERS */\n.filter-bar {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 15px;\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Prevent filters from squishing */\n}\n/* ... (Keep existing status-tabs and type-filters styles) ... */\n.status-tabs { display: flex; gap: 10px; }\n.status-tab {\n    padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0;\n    background: white; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer;\n}\n.status-tab.active { background: #2563eb; color: white; border-color: #2563eb; }\n.count { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 5px; }\n\n.type-filters { margin-left: auto; display: flex; gap: 5px; }\n.type-btn {\n    width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white;\n    border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;\n}\n.type-btn.active { background: #cbd5e1; border-color: #94a3b8; }\n.type-icon { width: 12px; height: 12px; background: #64748b; border-radius: 50%; }\n\n/* LIST CARD - SCROLL FIX IS HERE */\n.activities-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n\n    /* FIX: Make this element fill space and scroll */\n    flex-grow: 1;\n    overflow-y: auto;\n    min-height: 0; /* Crucial for flex child scrolling */\n\n    display: flex;\n    flex-direction: column;\n}\n\n/* ... (Keep existing row styles) ... */\n.group-header {\n    background: #f8fafc; padding: 10px 20px; border-bottom: 1px solid #f1f5f9;\n    font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;\n    position: sticky; top: 0; z-index: 1; /* Bonus: Sticky Group Headers */\n}\n\n.activity-row {\n    display: flex; gap: 15px; padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9; cursor: pointer;\n}\n.activity-row:hover { background: #fdfdfd; }\n.activity-row.overdue { border-left: 3px solid #ef4444; }\n\n.row-icon-box {\n    width: 40px; height: 40px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.row-icon-box.TASK { background: #3b82f6; }\n.row-icon-box.CALL { background: #10b981; }\n.row-icon-box.MEETING { background: #8b5cf6; }\n.row-icon-box.EMAIL { background: #f59e0b; }\n.row-icon-box.LETTER { background: #64748b; }\n.row-icon-box.SOCIAL_MEDIA { background: #ec4899; }\n\n.row-content { flex-grow: 1; }\n.row-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }\n.type-label { font-size: 11px; font-weight: bold; color: #64748b; }\n.status-badge { font-size: 11px; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }\n\n.row-desc { font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 4px; }\n.row-meta { font-size: 12px; color: #94a3b8; }\n.text-danger { color: #ef4444; font-weight: 500; }\n.row-action { color: #cbd5e1; font-weight: bold; }\n\n.loading-state, .empty-state { padding: 40px; text-align: center; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,1]},{"type":"text","position":[1,3,1,1,1,0]},{"type":"attr","position":[1,3,1,3]},{"type":"text","position":[1,3,1,3,1,0]},{"type":"attr","position":[1,3,1,5]},{"type":"text","position":[1,3,1,5,1,0]},{"type":"attr","position":[1,3,1,7]},{"type":"text","position":[1,3,1,7,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"for","position":[1,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]}]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"text","position":[1,1,2]},{"type":"attr","position":[1,3]},{"type":"for","position":[1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,1,1,0]},{"type":"attr","position":[1,3,1,3],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'color: '","act.statusColor"]}}}},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,0]},{"type":"attr","position":[1,3,5,1]},{"type":"text","position":[1,3,5,1,0]},{"type":"attr","position":[1,3,5,3]},{"type":"if","position":[1,3,5,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[3,0]}]}},"default":{}}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allActivities","groupedActivities","groupOrder","currentStatusFilter","currentTypeFilter","counts","isLoading","canCreate","ACTIVITY_TYPES","TERMINAL_STATUSES"],

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