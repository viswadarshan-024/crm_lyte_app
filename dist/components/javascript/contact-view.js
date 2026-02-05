Lyte.Component.register("contact-view", {
_template:"<template tag-name=\"contact-view\"> <div class=\"page-container\"> <header class=\"view-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Contact Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading details...</p> </div> </template></template> <template is=\"if\" value=\"{{errorMsg}}\"><template case=\"true\"> <div class=\"error-container\"> <p class=\"error-text\">{{errorMsg}}</p> <button onclick=\"{{action('goBack')}}\" class=\"btn-primary\">Back to List</button> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(expHandlers(isLoading,'!'),'&amp;&amp;',expHandlers(errorMsg,'!'))}}\"><template case=\"true\"> <div class=\"content-card\"> <div class=\"contact-profile\"> <div class=\"profile-avatar\"> <span>{{contact.initials}}</span> </div> <div class=\"profile-info\"> <h2 class=\"profile-name\">{{contact.name}}</h2> <div class=\"profile-meta\"> <span>{{contact.designation}}</span> <template is=\"if\" value=\"{{company}}\"><template case=\"true\"> <span> at <span class=\"link-text\">{{company.name}}</span></span> </template></template> </div> </div> <div class=\"profile-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editContact')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteContact')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"info-grid\"> <div class=\"info-item\"> <label>Email</label> <div class=\"value\">{{contact.email}}</div> </div> <div class=\"info-item\"> <label>Phone</label> <div class=\"value\">{{contact.phone}}</div> </div> <div class=\"info-item\"> <label>Company</label> <div class=\"value\">{{expHandlers(company,'?:',company.name,'-')}}</div> </div> <div class=\"info-item\"> <label>Designation</label> <div class=\"value\">{{contact.designation}}</div> </div> </div> <div class=\"tabs-nav\"> <div class=\"tab-item {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Deals ({{deals.length}}) </div> <div class=\"tab-item {{expHandlers(expHandlers(currentTab,'==','activities'),'?:','active','')}}\" onclick=\"{{action('switchTab','activities')}}\"> Activities ({{activities.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-panel\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals linked to this contact.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"deal\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-icon blue\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"row-content\"> <div class=\"row-title\">{{deal.title}}</div> <div class=\"row-sub\"> {{deal.amount}} <span style=\"margin: 0 5px; color: #cbd5e1;\">•</span> {{deal.date}} </div> </div> <div class=\"row-badge\">{{deal.status}}</div> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','activities')}}\"><template case=\"true\"> <div class=\"tab-panel\"> <template is=\"if\" value=\"{{expHandlers(activities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No activities recorded.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{activities}}\" item=\"act\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-icon gray\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"row-content\"> <div class=\"row-title\">{{act.description}}</div> <div class=\"row-sub\"> {{act.type}} <span style=\"margin: 0 5px; color: #cbd5e1;\">•</span> {{act.date}} </div> </div> <div class=\"row-badge\">{{act.status}}</div> </div> </template> </template></template> </div> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER & HEADER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow-y: auto;\n}\n\n.view-header {\n    display: flex;\n    align-items: center;\n    margin-bottom: 20px;\n}\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; color: #1e293b; margin: 0; font-weight: 600; }\n\n.btn-icon {\n    background: none; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 6px; cursor: pointer; color: #64748b; background: white;\n    display: flex; align-items: center;\n}\n.btn-icon:hover { background: #f1f5f9; color: #0f172a; }\n\n/* MAIN CARD */\n.content-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    overflow: hidden;\n}\n\n/* PROFILE HEADER */\n.contact-profile {\n    padding: 24px;\n    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\n    border-bottom: 1px solid #e2e8f0;\n    display: flex;\n    align-items: center;\n    gap: 20px;\n}\n.profile-avatar {\n    width: 64px; height: 64px;\n    border-radius: 50%;\n    background-color: #3b82f6;\n    color: white;\n    font-size: 24px; font-weight: bold;\n    display: flex; align-items: center; justify-content: center;\n    flex-shrink: 0;\n}\n.profile-info { flex-grow: 1; }\n.profile-name { margin: 0 0 4px 0; font-size: 24px; color: #0f172a; }\n.profile-meta { color: #64748b; font-size: 14px; }\n.link-text { color: #2563eb; font-weight: 500; cursor: pointer; }\n\n/* ACTION BUTTONS */\n.profile-actions { display: flex; gap: 10px; }\n.btn-secondary {\n    padding: 8px 16px; border: 1px solid #cbd5e1; background: white;\n    border-radius: 6px; cursor: pointer; font-weight: 500; color: #334155;\n}\n.btn-danger-ghost {\n    padding: 8px 16px; border: none; background: transparent;\n    cursor: pointer; font-weight: 500; color: #ef4444;\n}\n.btn-secondary:hover { background: #f8fafc; }\n.btn-danger-ghost:hover { background: #fee2e2; }\n\n/* INFO GRID */\n.info-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px;\n    padding: 24px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.info-item label {\n    display: block; font-size: 11px; text-transform: uppercase;\n    color: #94a3b8; margin-bottom: 4px; letter-spacing: 0.5px;\n}\n.info-item .value { font-size: 14px; color: #0f172a; font-weight: 500; }\n\n/* TABS */\n.tabs-nav {\n    display: flex;\n    border-bottom: 1px solid #e2e8f0;\n    padding: 0 24px;\n}\n.tab-item {\n    padding: 12px 20px;\n    cursor: pointer;\n    color: #64748b;\n    border-bottom: 2px solid transparent;\n    font-weight: 500;\n    font-size: 14px;\n}\n.tab-item:hover { color: #334155; }\n.tab-item.active {\n    color: #2563eb;\n    border-bottom-color: #2563eb;\n}\n\n/* TAB PANELS & LISTS */\n.tab-panel { padding: 0; }\n.empty-tab { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }\n\n.list-row {\n    display: flex; align-items: center;\n    padding: 16px 24px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.list-row:last-child { border-bottom: none; }\n\n.row-icon {\n    width: 36px; height: 36px; border-radius: 6px;\n    display: flex; align-items: center; justify-content: center;\n    margin-right: 15px;\n}\n.row-icon.blue { background: #e0f2fe; color: #0284c7; }\n.row-icon.gray { background: #f1f5f9; color: #64748b; }\n\n.row-content { flex-grow: 1; }\n.row-title { font-weight: 500; color: #0f172a; font-size: 14px; }\n.row-sub { color: #64748b; font-size: 12px; margin-top: 2px; }\n\n.row-badge {\n    font-size: 11px; padding: 2px 8px; border-radius: 10px;\n    background: #f1f5f9; color: #475569; font-weight: 600;\n    text-transform: uppercase;\n}\n\n/* LOADING / ERROR */\n.loading-container, .error-container {\n    padding: 50px; text-align: center; color: #64748b;\n}\n.spinner {\n    width: 30px; height: 30px; border: 3px solid #cbd5e1;\n    border-top-color: #2563eb; border-radius: 50%;\n    margin: 0 auto 15px; animation: spin 1s infinite linear;\n}\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"attr","position":[1,3]}]}},"default":{}},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,1,1,0]},{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,1,0]},{"type":"attr","position":[1,1,3,3,3]},{"type":"if","position":[1,1,3,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]}]}},"default":{}},{"type":"attr","position":[1,1,5,1]},{"type":"if","position":[1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,5,3]},{"type":"if","position":[1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,3,0]},{"type":"text","position":[1,3,5,3,0]},{"type":"text","position":[1,3,7,3,0]},{"type":"attr","position":[1,5,1]},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3]},{"type":"text","position":[1,5,3,1]},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1]},{"type":"text","position":[1,3,3,5]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,9]},{"type":"if","position":[1,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1]},{"type":"text","position":[1,3,3,5]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["contactId","contact","company","deals","activities","isLoading","errorMsg","currentTab","canEdit","canDelete"],

	data: function() {
		return {
			contactId: Lyte.attr("string", { default: "" }),
			contact: Lyte.attr("object", { default: {} }),
			company: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),
			isLoading: Lyte.attr("boolean", { default: true }),
			errorMsg: Lyte.attr("string", { default: "" }),
			currentTab: Lyte.attr("string", { default: "deals" }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];
		if (!id || id === "contacts") {
			window.location.hash = "#/contacts";
			return;
		}
		this.setData('contactId', id);
		this.setData('canEdit', this.hasPermission('CONTACT_UPDATE'));
		this.setData('canDelete', this.hasPermission('CONTACT_DELETE'));
		this.loadContactDetails(id);
	},

	loadContactDetails: function(id) {
		this.setData('isLoading', true);

		this.crmGetContact(id)
			.then((res) => {
				console.log("API RAW RESPONSE:", res);

				// --- 1. ROBUST DATA EXTRACTION ---
				let rootData = {};

				// Case A: Axios/HTTP Wrapper -> { data: { data: { ... } } }
				if (res && res.data && res.data.data) {
					rootData = res.data.data;
				}
				// Case B: Standard JSON -> { data: { ... }, success: true }
				else if (res && res.data) {
					rootData = res.data;
				}
					// Case C: Already Unwrapped -> { contact: ..., deals: ... }
				// (This catches mixins that return response.data automatically)
				else if (res && (res.contact || res.deals)) {
					rootData = res;
				}

				console.log("FINAL ROOT DATA:", rootData);

				// --- 2. NORMALIZE DATA ---

				// Contact
				let c = rootData.contact || {};
				this.setData('contact', {
					id: c.id,
					name: c.name || "Unknown",
					email: c.email || "",
					phone: c.phone || "",
					designation: c.jobTitle || c.designation || "-",
					initials: (c.name || "U").substring(0, 2).toUpperCase()
				});

				// Company
				this.setData('company', rootData.company || null);

				// Deals
				let rawDeals = Array.isArray(rootData.deals) ? rootData.deals : [];
				let cleanDeals = rawDeals.map(d => {
					return {
						id: d.id,
						title: d.title,
						// Safe check for status
						status: (d.status || "NEW").replace("_", " "),
						// Call helper methods via 'this'
						amount: this.formatMoney(d.amount),
						date: this.formatJavaDate(d.createdAt)
					};
				});
				this.setData('deals', cleanDeals);

				// Activities
				let rawActivities = Array.isArray(rootData.activities) ? rootData.activities : [];
				let cleanActivities = rawActivities.map(a => {
					return {
						id: a.id,
						description: a.description,
						type: a.type || "ACTIVITY",
						status: a.statusCode || "PENDING",
						date: this.formatJavaDate(a.createdAt)
					};
				});
				this.setData('activities', cleanActivities);

			})
			.catch((err) => {
				console.error("View Error:", err);
				this.setData('errorMsg', "Failed to load data.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- HELPER FUNCTIONS (Must be strictly defined) ---

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let mIndex = months.indexOf(dateObj.month);
		let mStr = mIndex > -1 ? shortMonths[mIndex] : dateObj.month;

		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	formatMoney: function(amount) {
		if (amount === undefined || amount === null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},
		goBack: function() {
			window.location.hash = "#/contacts";
		},
		editContact: function() {
			window.location.hash = "contacts/edit/:id".replace(":id", this.getData('contactId'));
		},
		deleteContact: function() {
			if (confirm("Delete this contact?")) {
				let id = this.getData('contactId');
				this.crmDeleteContact(id).then(() => {
					alert("Deleted");
					this.executeAction('goBack');
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });