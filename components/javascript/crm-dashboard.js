Lyte.Component.register("crm-dashboard", {
	data: function() {
		return {
			currentUser: Lyte.attr("object", { default: {} }),

			summaryStats: Lyte.attr("array", { default: [] }),
			pipelineStages: Lyte.attr("array", { default: [] }),

			// FIX 1: Initialize specific keys to ensure reactivity
			perms: Lyte.attr("object", {
				default: {
					VIEW_DEALS: false,
					DEAL_CREATE: false,
					ACTIVITY_CREATE: false,
					COMPANY_CREATE: false,
					CONTACT_CREATE: false
				}
			}),

			isLoading: Lyte.attr("boolean", { default: true }),
			totalPipelineValue: Lyte.attr("string", { default: "₹0.00" })
		}
	},

	didConnect: function() {
		this.loadDashboard();
	},

	loadDashboard: function() {
		this.setData('isLoading', true);

		this.crmGetDashboard()
			.then((res) => {
				console.log("Dashboard API Response:", res); // Debug Log

				const data = res.data || {};

				// 1. User Context
				if (data.userContext) {
					this.setData('currentUser', data.userContext);
					this.setupPermissions(data.userContext.permissions || []);
				}

				// 2. Summary
				this.buildSummary(data.summary || {});

				// 3. Pipeline (Check if data exists)
				if (data.dealWidget) {
					console.log("Building Pipeline with:", data.dealWidget); // Debug Log
					this.buildPipeline(data.dealWidget);
				} else {
					console.warn("No dealWidget data found in response");
				}

			})
			.catch(err => {
				console.error("Dashboard error", err);
			})
			.finally(() => this.setData('isLoading', false));
	},

	setupPermissions: function(permArray) {
		console.log("User Permissions:", permArray);

		let p = {
			DEAL_CREATE: permArray.includes('DEAL_CREATE'),
			ACTIVITY_CREATE: permArray.includes('ACTIVITY_CREATE'),
			COMPANY_CREATE: permArray.includes('COMPANY_CREATE'),
			CONTACT_CREATE: permArray.includes('CONTACT_CREATE'),

			// View Logic
			VIEW_DEALS: permArray.includes('DEAL_VIEW_ALL') ||
				permArray.includes('DEAL_VIEW_TEAM') ||
				permArray.includes('DEAL_VIEW_SELF')
		};

		console.log("Calculated Perms Object:", p);
		this.setData('perms', p);
	},

	buildSummary: function(summary) {
		let stats = [];
		const add = (key, label, icon, link) => {
			if (summary[key] !== undefined) {
				stats.push({ value: summary[key], label: label, icon: icon, link: link });
			}
		};

		add('totalDeals', 'Total Deals', 'deals', '#/deals');
		add('pendingActivities', 'Pending Activities', 'activities', '#/activities');
		add('totalCompanies', 'Companies', 'companies', '#/companies');
		add('totalContacts', 'Contacts', 'contacts', '#/contacts');
		add('totalUsers', 'Users', 'users', '#/users');

		this.setData('summaryStats', stats);
	},

	buildPipeline: function(widget) {
		// Map API keys to Display Labels
		const stages = [
			{ key: 'newDeals', label: 'New Lead', css: 'open' },
			{ key: 'qualifiedDeals', label: 'Qualified', css: 'open' },
			{ key: 'proposalSentDeals', label: 'Proposal', css: 'in-progress' },
			{ key: 'inProgressDeals', label: 'In Progress', css: 'in-progress' },
			{ key: 'deliveredDeals', label: 'Delivered', css: 'won' },
			{ key: 'closedDeals', label: 'Closed', css: 'lost' }
		];

		let result = stages.map(s => ({
			label: s.label,
			count: widget[s.key] || 0,
			cssClass: s.css
		}));

		this.setData('pipelineStages', result);
		this.setData('totalPipelineValue', this.formatMoney(widget.totalPipelineAmount));
	},

	formatMoney: function(amount) {
		if (!amount) return "₹0.00";
		return "₹" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	actions: {
		navigateTo: function(hash) {
			window.location.hash = hash;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });