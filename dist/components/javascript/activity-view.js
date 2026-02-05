Lyte.Component.register("activity-view", {
_template:"<template tag-name=\"activity-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Activity Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activity...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"activity-header-card\"> <div class=\"header-top\"> <div class=\"type-icon {{activity.type}}\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"header-info\"> <h2>{{activity.type}}</h2> <div class=\"meta\">ID: #{{activity.id}}</div> </div> <div class=\"actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editActivity')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteActivity')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> </div> <div class=\"status-box\"> <div class=\"status-label\">Current Status</div> <div class=\"current-status\" style=\"background-color: {{statusBg}}; color: {{statusColor}}\"> {{expHandlers(activity.statusLabel,'||',activity.statusCode)}} <template is=\"if\" value=\"{{isTerminal}}\"><template case=\"true\"> ✓</template></template> </div> <template is=\"if\" value=\"{{canChangeStatus}}\"><template case=\"true\"> <template is=\"if\" value=\"{{expHandlers(statusOptions.length,'>',0)}}\"><template case=\"true\"> <div class=\"transition-row\"> <span class=\"move-label\">Move to:</span> <template is=\"for\" items=\"{{statusOptions}}\" item=\"opt\"> <button class=\"status-btn\" onclick=\"{{action('changeStatus',opt.code)}}\"> {{opt.label}} </button> </template> </div> </template></template> </template></template> </div> <div class=\"activity-body\"> <h3 class=\"section-title\">Details</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Due Date</div> <div class=\"value {{expHandlers(isOverdue,'?:','text-danger','')}}\"> {{formattedDueDate}} <template is=\"if\" value=\"{{isOverdue}}\"><template case=\"true\"> (Overdue)</template></template> </div> </div> <div class=\"info-item\"> <div class=\"label\">Owner</div> <div class=\"value\">User #{{activity.ownerUserId}}</div> </div> </div> <h3 class=\"section-title\">Description</h3> <div class=\"desc-box\"> {{activity.description}} </div> <template is=\"if\" value=\"{{deal}}\"><template case=\"true\"> <h3 class=\"section-title\">Linked Deal</h3> <div class=\"linked-card\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"card-icon deal\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"card-info\"> <div class=\"card-title\">{{deal.title}}</div> <div class=\"card-sub\">{{deal.status}}</div> </div> <div class=\"card-arrow\">›</div> </div> </template></template> <template is=\"if\" value=\"{{company}}\"><template case=\"true\"> <h3 class=\"section-title\">Related Company</h3> <div class=\"linked-card\" onclick=\"{{action('viewCompany',company.id)}}\"> <div class=\"card-icon company\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg> </div> <div class=\"card-info\"> <div class=\"card-title\">{{company.name}}</div> </div> </div> </template></template> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.activity-header-card {\n    background: white; border-bottom: 1px solid #e2e8f0;\n    padding: 24px; border-radius: 12px 12px 0 0;\n}\n.header-top { display: flex; gap: 20px; align-items: center; }\n\n.type-icon {\n    width: 56px; height: 56px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white;\n}\n/* Type Colors */\n.type-icon.CALL { background: #10b981; }\n.type-icon.MEETING { background: #8b5cf6; }\n.type-icon.TASK { background: #3b82f6; }\n.type-icon.EMAIL { background: #f59e0b; }\n\n.header-info h2 { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; }\n.meta { font-size: 13px; color: #64748b; }\n.actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* STATUS SECTION */\n.status-box {\n    background: #f8fafc; padding: 20px 24px; border-bottom: 1px solid #e2e8f0;\n}\n.status-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; font-weight: 600; }\n\n.current-status {\n    display: inline-block; padding: 8px 16px; border-radius: 6px;\n    font-size: 14px; font-weight: 600;\n}\n\n.transition-row { margin-top: 15px; display: flex; align-items: center; gap: 10px; }\n.move-label { font-size: 13px; color: #64748b; }\n.status-btn {\n    background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px;\n    font-size: 13px; cursor: pointer; transition: all 0.2s;\n}\n.status-btn:hover { border-color: #3b82f6; background: #eff6ff; color: #1e40af; }\n\n/* BODY */\n.activity-body { background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }\n.section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 24px 0 12px 0; }\n.section-title:first-child { margin-top: 0; }\n\n.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }\n.info-item { background: #f8fafc; padding: 12px; border-radius: 6px; }\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n.text-danger { color: #ef4444; }\n\n.desc-box { background: #f8fafc; padding: 15px; border-radius: 6px; color: #334155; font-size: 14px; line-height: 1.5; }\n\n/* LINKED CARDS */\n.linked-card {\n    display: flex; align-items: center; gap: 15px; padding: 15px;\n    background: #f8fafc; border-radius: 8px; cursor: pointer; transition: background 0.2s;\n}\n.linked-card:hover { background: #f1f5f9; }\n\n.card-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }\n.card-icon.deal { background: #dbeafe; color: #2563eb; }\n.card-icon.company { background: #dcfce7; color: #166534; }\n\n.card-info { flex: 1; }\n.card-title { font-size: 14px; font-weight: 600; color: #1e293b; }\n.card-sub { font-size: 12px; color: #64748b; }\n.card-arrow { color: #cbd5e1; font-weight: bold; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3,1,0]},{"type":"text","position":[1,1,1,3,3,1]},{"type":"attr","position":[1,1,1,5,1]},{"type":"if","position":[1,1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,1,5,3]},{"type":"if","position":[1,1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,3],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","statusBg","'; color: '","statusColor"]}}}},{"type":"text","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,3]},{"type":"if","position":[1,3,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3]},{"type":"for","position":[1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,5,3,1,3]},{"type":"text","position":[1,5,3,1,3,1]},{"type":"attr","position":[1,5,3,1,3,3]},{"type":"if","position":[1,5,3,1,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,5,3,3,3,1]},{"type":"text","position":[1,5,7,1]},{"type":"attr","position":[1,5,9]},{"type":"if","position":[1,5,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[3]},{"type":"text","position":[3,3,1,0]},{"type":"text","position":[3,3,3,0]}]}},"default":{}},{"type":"attr","position":[1,5,11]},{"type":"if","position":[1,5,11],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[3]},{"type":"text","position":[3,3,1,0]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["activityId","activity","deal","company","statusOptions","isTerminal","statusColor","statusBg","formattedDueDate","isOverdue","isLoading","canEdit","canDelete","canChangeStatus"],

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