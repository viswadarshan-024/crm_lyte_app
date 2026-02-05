Lyte.Component.register("company-view", {
_template:"<template tag-name=\"company-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Company Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading details...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"company-header-card\"> <div class=\"company-avatar\" style=\"background-color: {{avatarColor}}\"> {{initials}} </div> <div class=\"company-info\"> <h2>{{company.name}}</h2> <div class=\"company-meta\"> <template is=\"if\" value=\"{{company.industry}}\"><template case=\"true\"> <span>{{company.industry}}</span> • </template></template> <span>{{company.companySize}}</span> </div> </div> <div class=\"company-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editCompany')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteCompany')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"company-body\"> <h3 class=\"section-title\">Company Information</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Email</div> <div class=\"value\">{{company.email}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Phone</div> <div class=\"value\">{{company.phone}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Domain</div> <div class=\"value link\">{{company.domain}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Industry</div> <div class=\"value\">{{company.industry}}</div> </div> </div> <template is=\"if\" value=\"{{fullAddress}}\"><template case=\"true\"> <h3 class=\"section-title\">Address</h3> <div class=\"info-box\"> {{fullAddress}} </div> </template></template> <div class=\"tabs-container\"> <div class=\"tabs-header\"> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','contacts'),'?:','active','')}}\" onclick=\"{{action('switchTab','contacts')}}\"> Contacts ({{contacts.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Deals ({{deals.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','activities'),'?:','active','')}}\" onclick=\"{{action('switchTab','activities')}}\"> Activities ({{activities.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','contacts')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(contacts.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No contacts linked to this company.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{contacts}}\" item=\"c\"> <div class=\"list-item\"> <div class=\"item-main\"> <div class=\"item-title\">{{c.name}}</div> <div class=\"item-sub\">{{c.jobTitle}}</div> </div> <button onclick=\"{{action('viewRelated','contacts',c.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"d\"> <div class=\"list-item\"> <div class=\"item-icon deal\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"item-main\"> <div class=\"item-title\">{{d.title}}</div> <div class=\"item-sub\">{{d.formattedAmount}} • {{d.assignedUserName}}</div> </div> <span class=\"badge {{d.statusClass}}\">{{d.status}}</span> <button onclick=\"{{action('viewRelated','deals',d.id)}}\" class=\"btn-sm ml-2\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','activities')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(activities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No activities recorded.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{activities}}\" item=\"a\"> <div class=\"list-item\"> <div class=\"item-icon activity\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"item-main\"> <div class=\"item-title\">{{a.description}}</div> <div class=\"item-sub\">{{a.formattedDate}} • {{a.statusCode}}</div> </div> <button onclick=\"{{action('viewRelated','activities',a.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n/* CONTENT WRAPPER */\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.company-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 20px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.company-avatar {\n    width: 64px; height: 64px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-size: 24px; font-weight: 700;\n}\n.company-info h2 { margin: 0 0 4px 0; font-size: 24px; color: #1e293b; }\n.company-meta { color: #64748b; font-size: 14px; }\n.company-actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* INFO BODY */\n.company-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.info-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px; margin-bottom: 30px;\n}\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n.info-item .value.link { color: #2563eb; cursor: pointer; }\n\n.info-box { background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 14px; color: #334155; margin-bottom: 30px; }\n\n/* TABS */\n.tabs-header { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }\n.tab {\n    padding: 10px 20px; cursor: pointer; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -1px;\n}\n.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }\n.tab:hover:not(.active) { color: #1e293b; }\n\n.tab-pane { min-height: 100px; }\n.empty-tab { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }\n\n/* LIST ITEMS */\n.list-item {\n    display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;\n}\n.list-item:last-child { border-bottom: none; }\n.item-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }\n.item-icon.deal { background: #e0f2fe; color: #0284c7; }\n.item-icon.activity { background: #f3f4f6; color: #4b5563; }\n\n.item-main { flex: 1; }\n.item-title { font-size: 14px; font-weight: 500; color: #1e293b; }\n.item-sub { font-size: 12px; color: #64748b; }\n\n.badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n.badge-blue { background: #dbeafe; color: #1e40af; }\n.badge-green { background: #dcfce7; color: #166534; }\n.badge-yellow { background: #fef9c3; color: #854d0e; }\n.badge-gray { background: #f1f5f9; color: #475569; }\n\n.btn-sm { padding: 4px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; }\n.ml-2 { margin-left: 8px; }\n\n/* LOADING */\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","avatarColor"]}}}},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,1,3,1,0]},{"type":"attr","position":[1,1,3,3,1]},{"type":"if","position":[1,1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,0]}]}},"default":{}},{"type":"text","position":[1,1,3,3,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"if","position":[1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,5,3]},{"type":"if","position":[1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"text","position":[1,3,3,1,3,0]},{"type":"text","position":[1,3,3,3,3,0]},{"type":"text","position":[1,3,3,5,3,0]},{"type":"text","position":[1,3,3,7,3,0]},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[3,1]}]}},"default":{}},{"type":"attr","position":[1,3,7,1,1]},{"type":"text","position":[1,3,7,1,1,1]},{"type":"attr","position":[1,3,7,1,3]},{"type":"text","position":[1,3,7,1,3,1]},{"type":"attr","position":[1,3,7,1,5]},{"type":"text","position":[1,3,7,1,5,1]},{"type":"attr","position":[1,3,7,3]},{"type":"if","position":[1,3,7,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,7,5]},{"type":"if","position":[1,3,7,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"text","position":[1,3,3,2]},{"type":"attr","position":[1,5]},{"type":"text","position":[1,5,0]},{"type":"attr","position":[1,7]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,7,7]},{"type":"if","position":[1,3,7,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"text","position":[1,3,3,2]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyId","company","contacts","deals","activities","isLoading","currentTab","canEdit","canDelete","avatarColor","initials","fullAddress"],

	data: function() {
		return {
			// ID from URL
			companyId: Lyte.attr("string", { default: "" }),

			// Data Models
			company: Lyte.attr("object", { default: {} }),
			contacts: Lyte.attr("array", { default: [] }),
			deals: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			currentTab: Lyte.attr("string", { default: "contacts" }), // 'contacts', 'deals', 'activities'

			// Permissions & Visuals
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			avatarColor: Lyte.attr("string", { default: "#cbd5e1" }),
			initials: Lyte.attr("string", { default: "" }),
			fullAddress: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		// 1. Get ID from Router Param
		// In Lyte, params are usually available via this.getData('params') or routed directly
		// Assuming standard Lyte routing where :id is passed to the component
		const params = this.getData('params'); // Check your router config if this differs

		// Fallback: Parse URL hash manually if needed
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/companies";
			return;
		}

		this.setData('companyId', id);

		// 2. Set Permissions
		this.setData('canEdit', this.hasPermission('COMPANY_UPDATE'));
		this.setData('canDelete', this.hasPermission('COMPANY_DELETE'));

		this.loadCompany();
	},

	loadCompany: function() {
		this.setData('isLoading', true);
		const id = this.getData('companyId');

		this.crmGetCompany(id)
			.then((res) => {
				// 1. Robust Extraction
				// API structure: { data: { company: {}, contacts: [], ... } }
				let data = res.data || {};

				// 2. Extract Company
				let comp = data.company || {};
				this.setData('company', comp);

				// 3. Visual Helpers
				this.setData('initials', this.getInitials(comp.name));
				this.setData('avatarColor', this.getAvatarColor(comp.name));

				// Construct Address String
				const addrParts = [comp.addressLine1, comp.addressLine2, comp.city, comp.state, comp.country, comp.postalCode];
				this.setData('fullAddress', addrParts.filter(Boolean).join(', ') || "");

				// 4. Extract Related Lists (Safe defaults)
				this.setData('contacts', data.contacts || []);
				this.setData('deals', this.normalizeDeals(data.deals || []));
				this.setData('activities', this.normalizeActivities(data.activities || []));

			})
			.catch(err => {
				console.error("View Error:", err);
				alert("Failed to load company details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- NORMALIZATION HELPERS ---

	normalizeDeals: function(list) {
		return list.map(d => ({
			...d,
			formattedAmount: this.formatMoney(d.amount),
			statusClass: this.getStatusClass(d.status)
		}));
	},

	normalizeActivities: function(list) {
		return list.map(a => ({
			...a,
			formattedDate: this.formatJavaDate(a.createdAt),
			iconClass: (a.type || 'TASK').toUpperCase()
		}));
	},

	// --- UTILS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
		return colors[Math.abs(hash) % colors.length];
	},

	formatMoney: function(amount) {
		if (amount == null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return shortMonths[dateObj.monthValue - 1] + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	getStatusClass: function(status) {
		if(!status) return "badge-gray";
		const map = { NEW: 'badge-blue', WON: 'badge-green', LOST: 'badge-red', IN_PROGRESS: 'badge-yellow' };
		return map[status] || "badge-gray";
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},

		goBack: function() {
			window.location.hash = "#/companies";
		},

		editCompany: function() {
			// Implement edit route later
			// alert("Edit feature coming soon");
			window.location.hash = "#/companies/edit/:id".replace(":id", this.getData('companyId'));
		},

		deleteCompany: function() {
			if (confirm("Delete this company?")) {
				this.crmDeleteCompany(this.getData('companyId')).then((res) => {
					if (res.success) {
						alert("Company deleted");
						window.location.hash = "#/companies";
					} else {
						alert("Failed to delete: " + res.message);
					}
				});
			}
		},

		viewRelated: function(type, id) {
			window.location.hash = `#/${type}/${id}`;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });