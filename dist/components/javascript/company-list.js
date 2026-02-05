Lyte.Component.register("company-list", {
_template:"<template tag-name=\"company-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Companies</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createCompany')}}\" class=\"add-btn\"> <span>+ Add Company</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search companies...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading companies...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(companyList.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\"> <div class=\"empty-icon\">🏢</div> <h3>No companies found</h3> <p>Create your first company to get started</p> </div> </template><template case=\"false\"> <div class=\"companies-grid\"> <template is=\"for\" items=\"{{companyList}}\" item=\"comp\"> <div class=\"company-card\" onclick=\"{{action('viewCompany',comp.id)}}\"> <div class=\"company-avatar\" style=\"background-color: {{comp.avatarColor}}\"> {{comp.initials}} </div> <div class=\"company-info\"> <div class=\"company-name\">{{comp.name}}</div> <div class=\"company-meta\"> <template is=\"if\" value=\"{{comp.email}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> <span>{{comp.email}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.phone}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg> <span>{{comp.phone}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.industry}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg> <span>{{comp.industry}}</span> </div> </template></template> </div> </div> </div> </template> </div> </template></template> </template></template> </div> </template>\n<style>/* 1. LOCK THE PAGE CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh; /* Force full viewport height */\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Stop main page scroll */\n}\n\n/* 2. PREVENT HEADER SHRINKING */\n.page-header {\n    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;\n    flex-shrink: 0;\n}\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar {\n    margin-bottom: 25px;\n    flex-shrink: 0;\n}\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 3. MAKE THE GRID SCROLLABLE */\n.companies-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* SCROLL PROPERTIES */\n    flex-grow: 1;         /* Fill remaining space */\n    overflow-y: auto;     /* Scroll internally */\n    min-height: 0;        /* Flexbox fix */\n    padding-bottom: 20px; /* Padding for bottom of scroll */\n    align-content: start; /* Keep items at top even if few */\n}\n\n/* 4. CENTER LOADING/EMPTY STATES */\n.loading-state, .empty-state {\n    flex-grow: 1; /* Fill space */\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    color: #94a3b8;\n    text-align: center;\n}\n.empty-icon { font-size: 40px; margin-bottom: 10px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n\n/* CARD STYLES (Unchanged) */\n.company-card {\n    background: white;\n    border-radius: 8px;\n    padding: 20px;\n    display: flex;\n    gap: 15px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n    border: 1px solid #e2e8f0;\n    cursor: pointer;\n    transition: transform 0.1s, box-shadow 0.1s;\n    height: fit-content; /* Don't stretch vertically in grid */\n}\n\n.company-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n    border-color: #cbd5e1;\n}\n\n.company-avatar {\n    width: 48px; height: 48px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: bold; font-size: 18px;\n    flex-shrink: 0;\n}\n\n.company-info { flex: 1; min-width: 0; }\n.company-name { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }\n\n.company-meta { display: flex; flex-direction: column; gap: 5px; }\n.meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }\n.meta-item svg { color: #94a3b8; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","comp.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"if","position":[1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}},{"type":"attr","position":[1,3,3,3]},{"type":"if","position":[1,3,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}},{"type":"attr","position":[1,3,3,5]},{"type":"if","position":[1,3,3,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyList","searchTerm","isLoading","canCreate","searchTimer"],

	data: function() {
		return {
			companyList: Lyte.attr("array", { default: [] }),
			searchTerm: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Search Debounce Timer
			searchTimer: Lyte.attr("number", { default: null })
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('COMPANY_CREATE'));
		this.loadCompanies();
	},

	loadCompanies: function() {
		this.setData('isLoading', true);

		// Prepare Params
		let term = this.getData('searchTerm');
		let params = {};
		if (term) {
			params.keyword = term;
		}

		this.crmGetCompanies(params)
			.then((res) => {
				let rawData = [];

				// Robust Extraction
				if (res && Array.isArray(res.data)) {
					rawData = res.data;
				} else if (Array.isArray(res)) {
					rawData = res;
				} else if (res && res.data && Array.isArray(res.data.data)) {
					rawData = res.data.data;
				}

				// Normalize for UI (Add Avatar props)
				let cleanList = rawData.map(c => ({
					id: c.id,
					name: c.name,
					email: c.email,
					phone: c.phone,
					industry: c.industry,
					// Pre-calculate visuals
					initials: this.getInitials(c.name),
					avatarColor: this.getAvatarColor(c.name)
				}));

				this.setData('companyList', cleanList);
			})
			.catch(err => {
				console.error("Error loading companies", err);
				this.setData('companyList', []);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- HELPERS (Ported from your Utils) ---
	getInitials: function(name) {
		if (!name) return "";
		return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	},

	actions: {
		// Debounced Search Action
		onSearchInput: function() {
			// Clear existing timer
			let timer = this.getData('searchTimer');
			if (timer) clearTimeout(timer);

			// Set new timer
			let newTimer = setTimeout(() => {
				this.loadCompanies();
			}, 300); // 300ms delay

			this.setData('searchTimer', newTimer);
		},

		createCompany: function() {
			window.location.hash = "#/companies/create";
		},

		viewCompany: function(id) {
			window.location.hash = "#/companies/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });