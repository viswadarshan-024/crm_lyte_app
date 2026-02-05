Lyte.Component.register("deal-view", {
_template:"<template tag-name=\"deal-view\"> <div class=\"page-container\"> <header class=\"view-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"> <polyline points=\"15 18 9 12 15 6\"></polyline> </svg> </button> <h1 class=\"header-title\">Deal Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading deal...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{errorMsg}}\"><template case=\"true\"> <div class=\"error-container\"> <p class=\"error-text\">{{errorMsg}}</p> <button onclick=\"{{action('goBack')}}\" class=\"btn-primary\">Back to Board</button> </div> </template><template case=\"false\"> <div class=\"content-card\"> <div class=\"deal-highlight\"> <div class=\"deal-header-top\"> <div class=\"deal-icon {{deal.cssClass}}\"> <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"> <path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path> <path d=\"M2 17l10 5 10-5\"></path> </svg> </div> <div class=\"deal-info\"> <h2>{{deal.title}}</h2> <div class=\"deal-amount\">{{deal.amount}}</div> </div> <div class=\"deal-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editDeal')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteDeal')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"status-pipeline\"> <template is=\"for\" items=\"{{pipelineSteps}}\" item=\"step\" index=\"i\"> <template is=\"if\" value=\"{{step.isClickable}}\"><template case=\"true\"> <div class=\"status-step {{step.cssClass}}\" onclick=\"{{action('updateStatus',step.id)}}\" style=\"cursor:pointer\"> {{step.label}} </div> </template><template case=\"false\"> <div class=\"status-step {{step.cssClass}}\" style=\"cursor:default\"> {{step.label}} </div> </template></template> </template> </div> </div> <div class=\"info-grid\"> <div class=\"info-item\"> <label>Company</label> <div class=\"value link-text\">{{companyName}}</div> </div> <div class=\"info-item\"> <label>Amount</label> <div class=\"value highlight\">{{deal.amount}}</div> </div> <div class=\"info-item\"> <label>Owner</label> <div class=\"value\">{{deal.owner}}</div> </div> <div class=\"info-item\"> <label>Created</label> <div class=\"value\">{{deal.date}}</div> </div> </div> <div class=\"section-container\"> <h3 class=\"section-title\">Contacts ({{contacts.length}})</h3> <template is=\"if\" value=\"{{expHandlers(contacts.length,'>',0)}}\"><template case=\"true\"> <div class=\"list-card\"> <template is=\"for\" items=\"{{contacts}}\" item=\"c\" index=\"i\"> <div class=\"list-row\"> <div class=\"avatar-circle\">{{c.initials}}</div> <div class=\"row-content\"> <div class=\"row-title\">{{c.name}}</div> <div class=\"row-sub\">{{c.job}}</div> </div> </div> </template> </div> </template></template> </div> <div class=\"section-container\"> <h3 class=\"section-title\">Activities ({{activities.length}})</h3> <template is=\"if\" value=\"{{expHandlers(activities.length,'>',0)}}\"><template case=\"true\"> <div class=\"list-card\"> <template is=\"for\" items=\"{{activities}}\" item=\"a\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-content\"> <div class=\"row-title\">{{a.description}}</div> <div class=\"row-sub\"> {{a.date}} <span class=\"dot\">•</span> <span class=\"badge\">{{a.status}}</span> </div> </div> </div> </template> </div> </template><template case=\"false\"> <p class=\"empty-text\">No activities linked.</p> </template></template> </div> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow-y: auto;\n}\n.view-header { display: flex; align-items: center; margin-bottom: 20px; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; color: #1e293b; margin: 0; font-weight: 600; }\n.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; display: flex; }\n\n/* MAIN CARD */\n.content-card {\n    background: white; border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;\n}\n\n/* DEAL HIGHLIGHT (Header + Pipeline) */\n.deal-highlight {\n    padding: 24px;\n    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\n    border-bottom: 1px solid #e2e8f0;\n}\n.deal-header-top { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }\n\n/* ICON STYLES */\n.deal-icon {\n    width: 56px; height: 56px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; background: #cbd5e1; /* Default */\n}\n.deal-icon.new { background: #3b82f6; }\n.deal-icon.qualified { background: #0ea5e9; }\n.deal-icon.proposal { background: #6366f1; }\n.deal-icon.in-progress { background: #f59e0b; }\n.deal-icon.closed { background: #10b981; }\n\n.deal-info h2 { font-size: 24px; margin: 0 0 5px 0; color: #0f172a; }\n.deal-amount { font-size: 20px; font-weight: bold; color: #10b981; }\n.deal-actions { margin-left: auto; display: flex; gap: 10px; }\n\n/* PIPELINE STEPPER */\n.status-pipeline { display: flex; gap: 8px; margin-top: 10px; }\n.status-step {\n    flex: 1; text-align: center; padding: 10px;\n    border-radius: 6px; background: white;\n    border: 2px solid #e2e8f0; color: #94a3b8;\n    font-size: 13px; font-weight: 500;\n    transition: all 0.2s;\n}\n.status-step.active { background: #2563eb; border-color: #2563eb; color: white; }\n.status-step.completed { background: #e0f2fe; border-color: #2563eb; color: #2563eb; }\n.status-step.won { background: #10b981; border-color: #10b981; color: white; }\n.status-step:hover:not(.active) { border-color: #94a3b8; }\n\n/* INFO GRID */\n.info-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px; padding: 24px; border-bottom: 1px solid #f1f5f9;\n}\n.info-item label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }\n.info-item .value { font-size: 15px; color: #0f172a; font-weight: 500; }\n.link-text { color: #2563eb; cursor: pointer; }\n\n/* SUB SECTIONS */\n.section-container { padding: 24px; border-bottom: 1px solid #f1f5f9; }\n.section-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 15px 0; }\n.list-card { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }\n\n.list-row {\n    display: flex; align-items: center; padding: 12px 16px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.list-row:last-child { border-bottom: none; }\n.avatar-circle {\n    width: 32px; height: 32px; border-radius: 50%; background: #3b82f6;\n    color: white; display: flex; align-items: center; justify-content: center;\n    font-size: 12px; margin-right: 12px;\n}\n.row-content { flex-grow: 1; }\n.row-title { font-weight: 500; font-size: 14px; }\n.row-sub { font-size: 12px; color: #64748b; }\n.badge { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }\n.empty-text { color: #94a3b8; font-style: italic; }\n\n/* LOADING/ERROR */\n.loading-container, .error-container { padding: 50px; text-align: center; color: #64748b; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"attr","position":[1,3]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3,1,0]},{"type":"text","position":[1,1,1,3,3,0]},{"type":"attr","position":[1,1,1,5,1]},{"type":"if","position":[1,1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,1,5,3]},{"type":"if","position":[1,1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,3,1]},{"type":"for","position":[1,1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}},"default":{}}]},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,3,0]},{"type":"text","position":[1,3,5,3,0]},{"type":"text","position":[1,3,7,3,0]},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3]},{"type":"if","position":[1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]}]}]}},"default":{}},{"type":"text","position":[1,7,1,1]},{"type":"attr","position":[1,7,3]},{"type":"if","position":[1,7,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,1]},{"type":"text","position":[1,1,3,5,0]}]}]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["dealId","deal","companyName","companyId","contacts","activities","pipelineSteps","isLoading","errorMsg","canEdit","canDelete","canChangeStatus","STAGES","STAGE_LABELS"],


	data: function () {
		return {
			dealId: Lyte.attr("string", { default: "" }),
			deal: Lyte.attr("object", { default: {} }),
			companyName: Lyte.attr("string", { default: "-" }),
			companyId: Lyte.attr("string", { default: "" }),
			contacts: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),
			pipelineSteps: Lyte.attr("array", { default: [] }),
			isLoading: Lyte.attr("boolean", { default: true }),
			errorMsg: Lyte.attr("string", { default: "" }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			canChangeStatus: Lyte.attr("boolean", { default: false }),

			STAGES: Lyte.attr("array", { default: ['NEW','QUALIFIED','PROPOSAL','IN_PROGRESS','DELIVERED','CLOSED'] }),
			STAGE_LABELS: Lyte.attr("object", {
				default: {
					NEW:'New', QUALIFIED:'Qualified', PROPOSAL:'Proposal',
					IN_PROGRESS:'In Progress', DELIVERED:'Delivered', CLOSED:'Closed'
				}
			})
		};
	},

	didConnect: function () {
		const id = window.location.hash.split('/').pop();
		if (!id || id === "deals") return Lyte.Router.transitionTo("deals");

		this.setData('dealId', id);
		this.setData('canEdit', this.hasPermission('DEAL_UPDATE'));
		this.setData('canDelete', this.hasPermission('DEAL_DELETE'));
		this.setData('canChangeStatus', this.hasPermission('DEAL_CHANGE_STATUS'));
		this.loadDealDetails(id);
	},

	loadDealDetails: function (id) {
		this.setData('isLoading', true);

		this.crmGetDeal(id).then(res => {
			const data = res?.data?.data || res?.data || {};
			const d = data.deal || {};

			const status = String(d.status || "NEW");

			const cleanDeal = {
				id: String(d.id || ""),
				title: d.title || "Untitled Deal",
				amount: this.formatMoney(d.amount),
				status: status,
				owner: d.assignedUserName || "Unassigned",
				date: this.formatJavaDate(d.createdAt),
				cssClass: status.toLowerCase().replace(/_/g, '-')
			};

			const company = data.company || {};
			const contacts = (data.contacts || []).map(c => {
				const name = c?.name || "Unknown";
				return {
					id: String(c?.id || ""),
					name: name,
					job: c?.jobTitle || "N/A",
					initials: name.substring(0,2).toUpperCase()
				};
			});

			const activities = (data.activities || []).map(a => ({
				id: String(a?.id || ""),
				description: a?.description || "No Description",
				status: a?.statusCode || "PENDING",
				date: this.formatJavaDate(a?.dueDate || a?.createdAt)
			}));

			this.setData('deal', cleanDeal);
			this.setData('companyName', String(company?.name || "-"));
			this.setData('companyId', String(company?.id || ""));
			this.setData('contacts', contacts);
			this.setData('activities', activities);
			this.buildPipeline(status);
		})
			.catch(() => this.setData('errorMsg', "Failed to load deal."))
			.finally(() => this.setData('isLoading', false));
	},

	buildPipeline: function (currentStatus) {
		const stages = this.getData('STAGES');
		const labels = this.getData('STAGE_LABELS');
		const canChange = this.getData('canChangeStatus');
		const index = Math.max(0, stages.indexOf(currentStatus));

		const pipeline = stages.map((s, i) => ({
			id: s,
			label: labels[s] || s,
			cssClass: s === currentStatus ? "active" : (i < index ? "completed" : ""),
			isClickable: canChange && s !== currentStatus
		}));

		this.setData('pipelineSteps', pipeline);
	},

	formatMoney: function (amt) {
		return "₹" + Number(amt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function (d) {
		if (!d || !d.year || !d.monthValue || !d.dayOfMonth) return "";
		const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		return `${m[d.monthValue-1]} ${d.dayOfMonth}, ${d.year}`;
	},

	actions: {
		goBack: function () { Lyte.Router.transitionTo("deals"); },
		editDeal: function () {
				window.location.hash = "/deals/edit/:id".replace(":id", this.getData('dealId'));
			},
		updateStatus: function (s) {
			const deal = this.getData('deal');
			if (s === deal.status) return;
			this.buildPipeline(s);
			this.crmUpdateDealStatus({ id: this.getData('dealId'), status: s });
		},
		deleteDeal: function () {
			if (confirm("Delete this deal?")) {
				this.crmDeleteDeal(this.getData('dealId')).then(() => this.executeAction('goBack'));
			}
		}
	}

}, { mixins: ["auth-mixin","crm-api-mixin","utils-mixin","api-mixin"] });
