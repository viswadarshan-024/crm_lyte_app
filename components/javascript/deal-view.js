Lyte.Component.register("deal-view", {

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
