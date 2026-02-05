Lyte.Component.register("deal-list", {
_template:"<template tag-name=\"deal-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Deals Board</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createDeal')}}\" class=\"add-btn\"> <span>+ New Deal</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" placeholder=\"Search deals...\" class=\"search-input\"> </div> <div class=\"view-toggles\"> <button class=\"toggle-btn {{expHandlers(expHandlers(viewType,'==','kanban'),'?:','active','')}}\" onclick=\"{{action('setView','kanban')}}\" title=\"Kanban View\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg> </button> <button class=\"toggle-btn {{expHandlers(expHandlers(viewType,'==','list'),'?:','active','')}}\" onclick=\"{{action('setView','list')}}\" title=\"List View\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"></line><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"></line><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"></line><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"></line><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"></line><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"></line></svg> </button> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading pipeline...</p> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(isLoading,'!')}}\"><template case=\"true\"> <template is=\"if\" value=\"{{expHandlers(viewType,'==','kanban')}}\"><template case=\"true\"> <div class=\"kanban-container\"> <template is=\"for\" items=\"{{kanbanData}}\" item=\"column\" index=\"i\"> <div class=\"kanban-column {{column.cssClass}}\"> <div class=\"column-header\"> <span class=\"col-title\">{{column.label}}</span> <span class=\"col-count\">{{column.count}}</span> </div> <div class=\"column-body\"> <template is=\"if\" value=\"{{expHandlers(column.count,'===',0)}}\"><template case=\"true\"> <div class=\"empty-col\">No deals</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{column.items}}\" item=\"deal\" index=\"j\"> <div class=\"kanban-card\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"card-title\">{{deal.title}}</div> <div class=\"card-company\">{{deal.companyName}}</div> <div class=\"card-footer\"> <span class=\"amount\">{{deal.formattedAmount}}</span> <span class=\"date\">{{deal.date}}</span> </div> </div> </template> </template></template> </div> </div> </template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(viewType,'==','list')}}\"><template case=\"true\"> <div class=\"list-container\"> <template is=\"if\" value=\"{{expHandlers(displayedDeals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No deals found matching your search.</div> </template><template case=\"false\"> <div class=\"deal-table\"> <template is=\"for\" items=\"{{displayedDeals}}\" item=\"deal\" index=\"k\"> <div class=\"deal-row\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"deal-info\"> <div class=\"row-title\">{{deal.title}}</div> <div class=\"row-company\">{{deal.companyName}}</div> </div> <div class=\"deal-status\"> <span class=\"badge {{deal.status}}\">{{deal.status}}</span> </div> <div class=\"deal-amount\">{{deal.formattedAmount}}</div> <div class=\"deal-arrow\">›</div> </div> </template> </div> </template></template> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    background-color: #f4f7f6;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* HEADER & CONTROLS */\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n.title { margin: 0; color: #1e293b; font-size: 24px; }\n.add-btn { background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; border:none; cursor: pointer; }\n\n.controls-bar { display: flex; gap: 15px; margin-bottom: 20px; }\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 8px 12px; display: flex; align-items: center; flex-grow: 1;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; }\n.view-toggles { display: flex; gap: 5px; }\n.toggle-btn {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 6px 10px; cursor: pointer; color: #64748b;\n}\n.toggle-btn.active { background: #2563eb; color: white; border-color: #2563eb; }\n\n/* KANBAN BOARD */\n.kanban-container {\n    display: flex;\n    gap: 15px;\n    overflow-x: auto; /* Horizontal Scroll */\n    padding-bottom: 15px;\n    flex-grow: 1;\n    height: 100%;\n}\n\n.kanban-column {\n    min-width: 280px;\n    max-width: 280px;\n    background: #f1f5f9;\n    border-radius: 8px;\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n}\n\n.column-header {\n    padding: 12px 15px;\n    background: white;\n    border-radius: 8px 8px 0 0;\n    border-bottom: 1px solid #e2e8f0;\n    border-top: 3px solid transparent; /* Colored top border */\n    display: flex; justify-content: space-between; align-items: center;\n}\n.col-title { font-weight: 600; font-size: 14px; color: #334155; }\n.col-count { background: #f1f5f9; padding: 2px 8px; border-radius: 10px; font-size: 11px; }\n\n/* Column Colors */\n.kanban-column.new .column-header { border-top-color: #3b82f6; } /* Blue */\n.kanban-column.qualified .column-header { border-top-color: #0ea5e9; } /* Cyan */\n.kanban-column.proposal .column-header { border-top-color: #6366f1; } /* Indigo */\n.kanban-column.in-progress .column-header { border-top-color: #f59e0b; } /* Orange */\n.kanban-column.delivered .column-header { border-top-color: #8b5cf6; } /* Purple */\n.kanban-column.closed .column-header { border-top-color: #10b981; } /* Green */\n\n.column-body {\n    padding: 10px;\n    overflow-y: auto; /* Vertical Scroll per column */\n    flex-grow: 1;\n}\n\n/* KANBAN CARD */\n/* KANBAN COLUMN FIXES */\n.kanban-container {\n    display: flex;\n    gap: 15px;\n    overflow-x: auto;\n    padding-bottom: 15px;\n    height: 100%;\n}\n\n.kanban-column {\n    min-width: 280px;\n    max-width: 280px;\n    background: #f1f5f9; /* Light Grey Background */\n    border-radius: 8px;\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    border: 1px solid #e2e8f0; /* Ensure visibility */\n}\n\n.column-header {\n    padding: 12px;\n    background: white;\n    border-radius: 8px 8px 0 0;\n    border-bottom: 1px solid #e2e8f0;\n    font-weight: bold;\n    display: flex;\n    justify-content: space-between;\n}\n\n.column-body {\n    padding: 10px;\n    overflow-y: auto;\n    flex-grow: 1;\n    min-height: 100px; /* Force height so you can see it */\n}\n\n.kanban-card {\n    background: white;\n    padding: 12px;\n    border-radius: 6px;\n    box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n    margin-bottom: 10px;\n    cursor: pointer;\n    border: 1px solid transparent;\n}\n.kanban-card:hover { border-color: #cbd5e1; }\n\n.card-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }\n.card-company { font-size: 12px; color: #64748b; margin-bottom: 8px; }\n.card-footer { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }\n.amount { color: #10b981; font-weight: 600; }\n/* LIST VIEW */\n.list-container {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    overflow: hidden;\n    flex-grow: 1;\n    overflow-y: auto;\n}\n.deal-row {\n    display: flex; align-items: center; padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9; cursor: pointer;\n}\n.deal-row:hover { background: #f8fafc; }\n.deal-info { flex-grow: 1; }\n.row-title { font-weight: 600; color: #0f172a; }\n.row-company { font-size: 12px; color: #64748b; }\n.deal-status { width: 120px; }\n.deal-amount { width: 100px; font-weight: 600; color: #0f172a; text-align: right; margin-right: 20px; }\n.deal-arrow { color: #cbd5e1; font-weight: bold; }\n\n.badge { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #475569; font-weight: 600; }\n.badge.CLOSED { background: #dcfce7; color: #166534; }\n.badge.NEW { background: #dbeafe; color: #1e40af; }\n\n/* LOADING/EMPTY */\n.loading-state, .empty-state, .empty-col { text-align: center; color: #94a3b8; padding: 20px; font-size: 13px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 10px; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"if","position":[1,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,1,0]},{"type":"text","position":[1,5,3,0]}]}]}},"default":{}}]}]}},"default":{}},{"type":"attr","position":[3]},{"type":"if","position":[3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allDeals","displayedDeals","kanbanData","viewType","searchTerm","isLoading","canCreate","stages","stageLabels"],

	data: function() {
		return {
			// Master Data
			allDeals: Lyte.attr("array", { default: [] }),

			// UI Data (Derived from allDeals)
			displayedDeals: Lyte.attr("array", { default: [] }), // For List View
			kanbanData: Lyte.attr("array", { default: [] }),     // For Kanban View

			// Configuration
			viewType: Lyte.attr("string", { default: "kanban" }),
			searchTerm: Lyte.attr("string", { default: "" }),
			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Constants
			stages: Lyte.attr("array", {
				default: ['NEW', 'QUALIFIED', 'PROPOSAL', 'IN_PROGRESS', 'DELIVERED', 'CLOSED']
			}),
			stageLabels: Lyte.attr("object", {
				default: {
					NEW: 'New', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal',
					IN_PROGRESS: 'In Progress', DELIVERED: 'Delivered', CLOSED: 'Closed'
				}
			})
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('DEAL_CREATE'));
		this.loadDeals();
	},

	// --- MAIN LOGIC ---

	loadDeals: function() {
		this.setData('isLoading', true);

		// 1. USE THE MIXIN METHOD (Fixed)
		this.crmGetDeals()
			.then((res) => {
				console.log("Deals API Response:", res);

				let rawData = [];

				// 2. ROBUST DATA EXTRACTION (Same logic as Contact List)
				// Check if 'res' is the array (rare)
				if (Array.isArray(res)) {
					rawData = res;
				}
				// Check if 'res.data' is the array (Standard JSON)
				else if (res && Array.isArray(res.data)) {
					rawData = res.data;
				}
				// Check if 'res.data.data' is the array (Axios/HTTP Wrapper)
				else if (res && res.data && Array.isArray(res.data.data)) {
					rawData = res.data.data;
				}
				// Check for 'responseData' (Lyte specific cases)
				else if (res && res.responseData) {
					rawData = res.responseData;
				}

				console.log("Extracted Deals Count:", rawData.length);

				// 3. NORMALIZE DATA
				let cleanDeals = rawData.map(d => ({
					id: d.id,
					title: d.title,
					companyName: d.companyName || "No Company",
					status: d.status || "NEW",
					amount: d.amount, // Keep number for sorting if needed
					formattedAmount: this.formatMoney(d.amount),
					date: this.formatJavaDate(d.createdAt),
					assignedTo: d.assignedUserName || "Unassigned"
				}));

				this.setData('allDeals', cleanDeals);
				this.organizeDeals(); // Build the views
			})
			.catch(e => {
				console.error("Error loading deals", e);
				this.setData('allDeals', []); // Clear to prevent stale state
				this.organizeDeals();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// This function filters data AND rebuilds the Kanban columns
	organizeDeals: function() {
		let term = this.getData('searchTerm'); // Get raw value
		if (!term) term = "";
		term = term.toLowerCase().trim();

		let all = this.getData('allDeals') || [];
		let stages = this.getData('stages');
		let labels = this.getData('stageLabels');

		// 1. Filter
		let filtered = all;
		if (term) {
			filtered = all.filter(d =>
				(d.title && d.title.toLowerCase().includes(term)) ||
				(d.companyName && d.companyName.toLowerCase().includes(term))
			);
		}

		// 2. Update List View Data
		this.setData('displayedDeals', filtered);

		// 3. Build Kanban Groups
		let groups = {};
		stages.forEach(s => groups[s] = []);

		filtered.forEach(d => {
			// Determine status (handle unknown statuses safely)
			let status = d.status;
			if (!groups[status]) {
				status = 'NEW'; // Fallback
			}
			groups[status].push(d);
		});

		// Convert to Array for Template Loop
		let kanbanArray = stages.map(status => ({
			id: status,
			label: labels[status] || status,
			items: groups[status],
			count: groups[status].length,
			cssClass: status.toLowerCase().replace('_', '-') // e.g. "in-progress"
		}));

		this.setData('kanbanData', kanbanArray);
	},

	// --- HELPER FUNCTIONS ---

	formatMoney: function(amount) {
		if (amount === undefined || amount === null) return "₹ 0.00";
		return "₹ " + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		// Adjust monthValue (1-12) to index (0-11)
		let mStr = shortMonths[dateObj.monthValue - 1] || "";
		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	actions: {
		setView: function(type) {
			this.setData('viewType', type);
		},

		onSearch: function() {
			this.organizeDeals();
		},

		viewDeal: function(id) {
			// Consistent routing using hash
			window.location.hash = "/deals/" + id;
		},

		createDeal: function() {
			window.location.hash = "/deals/create";
		}
	}
}, {
	// CRITICAL: Added 'crm-api-mixin' here so this.crmGetDeals() works
	mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
});