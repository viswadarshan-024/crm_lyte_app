Lyte.Component.register("crm-dashboard", {
_template:"<template tag-name=\"crm-dashboard\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <h1 class=\"title\">Dashboard</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading dashboard...</p> </div> </template><template case=\"false\"> <div class=\"dashboard-content\"> <div class=\"welcome-banner\"> <h1>Welcome back, {{currentUser.fullName}}!</h1> <p>Here's what's happening with your CRM today.</p> </div> <div class=\"quick-actions\"> <template is=\"if\" value=\"{{perms.DEAL_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/deals/create')}}\" class=\"quick-btn\"> <div class=\"icon-box blue\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg></div> New Deal </button> </template></template> <template is=\"if\" value=\"{{perms.ACTIVITY_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/activities/create')}}\" class=\"quick-btn\"> <div class=\"icon-box yellow\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg></div> New Activity </button> </template></template> <template is=\"if\" value=\"{{perms.COMPANY_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/companies/create')}}\" class=\"quick-btn\"> <div class=\"icon-box green\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg></div> New Company </button> </template></template> <template is=\"if\" value=\"{{perms.CONTACT_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/contacts/create')}}\" class=\"quick-btn\"> <div class=\"icon-box purple\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg></div> New Contact </button> </template></template> </div> <div class=\"stats-grid\"> <template is=\"for\" items=\"{{summaryStats}}\" item=\"stat\"> <div class=\"stat-card\" onclick=\"{{action('navigateTo',stat.link)}}\"> <div class=\"stat-header\"> <div class=\"stat-icon {{stat.icon}}\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> </div> <div class=\"stat-value\">{{stat.value}}</div> <div class=\"stat-label\">{{stat.label}}</div> </div> </template> </div> <template is=\"if\" value=\"{{perms.VIEW_DEALS}}\"><template case=\"true\"> <div class=\"widget-card\"> <div class=\"widget-header\"> <h3 class=\"widget-title\">Deal Pipeline</h3> <button onclick=\"{{action('navigateTo','#/deals')}}\" class=\"btn-text\">View All</button> </div> <div class=\"widget-body\"> <div class=\"pipeline-grid\"> <template is=\"for\" items=\"{{pipelineStages}}\" item=\"stage\"> <div class=\"pipeline-stage {{stage.cssClass}}\"> <div class=\"stage-val\">{{stage.count}}</div> <div class=\"stage-lbl\">{{stage.label}}</div> </div> </template> </div> <div class=\"pipeline-footer\"> <span class=\"label\">Total Pipeline Value</span> <span class=\"value\">{{totalPipelineValue}}</span> </div> </div> </div> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Stop main page scroll */\n    box-sizing: border-box;\n}\n\n/* HEADER */\n.page-header {\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Keep header fixed size */\n}\n.title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }\n\n/* SCROLLABLE WRAPPER (This fixes the scroll) */\n.dashboard-content {\n    flex-grow: 1;         /* Take up remaining space */\n    overflow-y: auto;     /* Enable Vertical Scroll */\n    min-height: 0;        /* Flexbox fix for scrolling */\n    padding-bottom: 40px; /* Space at bottom */\n\n    /* Hide scrollbar for cleaner look (optional) */\n    scrollbar-width: thin;\n}\n\n/* BANNER */\n.welcome-banner {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    border-radius: 12px; padding: 24px; color: white;\n    margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n}\n.welcome-banner h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }\n.welcome-banner p { margin: 0; opacity: 0.9; font-size: 14px; }\n\n/* QUICK ACTIONS */\n.quick-actions { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }\n.quick-btn {\n    background: white; border: 1px solid #e2e8f0; border-radius: 8px;\n    padding: 12px 20px; display: flex; align-items: center; gap: 10px;\n    font-size: 14px; font-weight: 600; color: #334155; cursor: pointer;\n    transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n}\n.quick-btn:hover { border-color: #cbd5e1; transform: translateY(-1px); }\n\n.icon-box { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }\n.icon-box.blue { background: #dbeafe; color: #2563eb; }\n.icon-box.yellow { background: #fef3c7; color: #d97706; }\n.icon-box.green { background: #dcfce7; color: #166534; }\n.icon-box.purple { background: #f3e8ff; color: #9333ea; }\n\n/* STATS GRID */\n/* STATS GRID */\n.stats-grid {\n    display: grid;\n    /* CHANGE: Force 5 equal columns. */\n    grid-template-columns: repeat(5, 1fr);\n    gap: 20px;\n    margin-bottom: 30px;\n\n    /* OPTIONAL: Ensure it doesn't break on very small screens */\n    min-width: 800px;\n}\n.stat-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 20px; cursor: pointer; transition: all 0.2s;\n}\n.stat-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-color: #cbd5e1; }\n\n.stat-header { margin-bottom: 15px; }\n.stat-icon {\n    width: 40px; height: 40px; border-radius: 10px;\n    display: flex; align-items: center; justify-content: center;\n}\n.stat-icon.deals { background: #dbeafe; color: #2563eb; }\n.stat-icon.activities { background: #fef3c7; color: #d97706; }\n.stat-icon.companies { background: #dcfce7; color: #166534; }\n.stat-icon.contacts { background: #f3e8ff; color: #9333ea; }\n.stat-icon.users { background: #fce7f3; color: #db2777; }\n\n.stat-value { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }\n.stat-label { font-size: 13px; color: #64748b; }\n\n/* PIPELINE WIDGET */\n.widget-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    overflow: hidden; margin-bottom: 30px;\n}\n.widget-header {\n    padding: 16px 24px; border-bottom: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n}\n.widget-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }\n.btn-text { background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 500; cursor: pointer; }\n\n.widget-body { padding: 24px; }\n.pipeline-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n    gap: 12px;\n}\n.pipeline-stage {\n    background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;\n    border-top: 4px solid #cbd5e1; /* Ensured border thickness */\n}\n.pipeline-stage.open { border-color: #3b82f6; }\n.pipeline-stage.in-progress { border-color: #f59e0b; }\n.pipeline-stage.won { border-color: #10b981; }\n.pipeline-stage.lost { border-color: #ef4444; }\n\n.stage-val { font-size: 20px; font-weight: 700; color: #0f172a; }\n.stage-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }\n\n.pipeline-footer {\n    margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;\n    text-align: center;\n}\n.pipeline-footer .label { font-size: 13px; color: #64748b; display: block; margin-bottom: 4px; }\n.pipeline-footer .value { font-size: 24px; font-weight: 700; color: #10b981; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,1,1]},{"type":"attr","position":[1,3,1]},{"type":"if","position":[1,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,7]},{"type":"if","position":[1,3,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,5,1]},{"type":"for","position":[1,5,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1,1]},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,0]}]},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,1,1]},{"type":"for","position":[1,3,1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,0]}]},{"type":"text","position":[1,3,3,3,0]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["currentUser","summaryStats","pipelineStages","perms","isLoading","totalPipelineValue"],

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