Lyte.Component.register("activity-create", {
_template:"<template tag-name=\"activity-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Create Activity</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading deals...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Type</h3> <div class=\"type-grid\"> <template is=\"for\" items=\"{{activityTypes}}\" item=\"type\"> <div class=\"type-option {{expHandlers(expHandlers(selectedType,'==',type.id),'?:','selected','')}}\" onclick=\"{{action('selectType',type.id,type.defaultStatus)}}\"> <div class=\"type-icon {{type.id}}\"> <template is=\"if\" value=\"{{expHandlers(type.id,'==','TASK')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 11l3 3L22 4\"></path><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"></path></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','CALL')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','MEETING')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','EMAIL')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','LETTER')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"></line><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"></line><polyline points=\"10 9 9 9 8 9\"></polyline></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','SOCIAL_MEDIA')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"></line><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"></path></svg></template></template> </div> <span class=\"type-name\">{{type.label}}</span> </div> </template> </div> <div class=\"status-hint\"> <strong>Initial Status:</strong> {{currentStatusHint}} </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Details</h3> <div class=\"form-group\"> <label>Related Deal <span class=\"required\">*</span></label> <select id=\"sel_deal\" class=\"form-select\" lyte-model=\"selectedDealId\"> <option value=\"\">Select a Deal...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{deals}}\" item=\"deal\"></option> </select> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" class=\"form-textarea\" rows=\"3\" placeholder=\"What needs to be done?\"></textarea> </div> <div class=\"form-group\"> <label>Due Date <span class=\"required\">*</span></label> <input type=\"date\" id=\"inp_date\" class=\"form-input\" min=\"{{todayDate}}\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createActivity')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Activity</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n/* TYPE SELECTOR GRID */\n.type-grid {\n    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;\n}\n.type-option {\n    display: flex; flex-direction: column; align-items: center; gap: 8px;\n    padding: 16px; border: 2px solid #e2e8f0; border-radius: 8px;\n    cursor: pointer; transition: all 0.2s;\n}\n.type-option:hover { border-color: #cbd5e1; background: #f8fafc; }\n.type-option.selected { border-color: #2563eb; background: #eff6ff; }\n\n.type-icon {\n    width: 40px; height: 40px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white;\n}\n/* Colors */\n.type-icon.TASK { background: #3b82f6; }\n.type-icon.CALL { background: #10b981; }\n.type-icon.MEETING { background: #8b5cf6; }\n.type-icon.EMAIL { background: #f59e0b; }\n.type-icon.LETTER { background: #64748b; }\n.type-icon.SOCIAL_MEDIA { background: #ec4899; }\n\n.type-name { font-size: 13px; font-weight: 600; color: #334155; }\n\n/* STATUS HINT */\n.status-hint {\n    background: #f8fafc; padding: 10px; border-radius: 6px;\n    font-size: 13px; color: #64748b; text-align: center; border: 1px solid #f1f5f9;\n}\n\n/* FORM FIELDS */\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus, .form-textarea:focus {\n    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1);\n}\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n/* Mobile Response */\n@media (max-width: 600px) {\n    .type-grid { grid-template-columns: repeat(2, 1fr); }\n}</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,3,1]},{"type":"for","position":[1,1,1,1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]},{"type":"attr","position":[1,1,1]},{"type":"if","position":[1,1,1],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,5]},{"type":"if","position":[1,1,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,7]},{"type":"if","position":[1,1,7],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,9]},{"type":"if","position":[1,1,9],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,11]},{"type":"if","position":[1,1,11],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,0]}]},{"type":"text","position":[1,1,1,1,5,3]},{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{deals}}\" item=\"deal\"> <option value=\"{{deal.id}}\">{{deal.title}}</option> </template>"},{"type":"attr","position":[1,1,1,3,7,3]},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["deals","selectedType","selectedDealId","currentStatusHint","activityTypes","isLoading","isSaving","todayDate"],

	data: function() {
		return {
			// Dropdown Data
			deals: Lyte.attr("array", { default: [] }),

			// UI State
			selectedType: Lyte.attr("string", { default: "TASK" }),
			selectedDealId: Lyte.attr("string", { default: "" }),
			currentStatusHint: Lyte.attr("string", { default: "PENDING" }),

			// Visual Config (Types)
			activityTypes: Lyte.attr("array", { default: [
					{ id: 'TASK', label: 'Task', defaultStatus: 'PENDING', icon: 'task' },
					{ id: 'CALL', label: 'Call', defaultStatus: 'SCHEDULED', icon: 'call' },
					{ id: 'MEETING', label: 'Meeting', defaultStatus: 'SCHEDULED', icon: 'meeting' },
					{ id: 'EMAIL', label: 'Email', defaultStatus: 'DRAFT', icon: 'email' },
					{ id: 'LETTER', label: 'Letter', defaultStatus: 'DRAFT', icon: 'letter' },
					{ id: 'SOCIAL_MEDIA', label: 'Social Media', defaultStatus: 'DRAFT', icon: 'social' }
				]}),

			// Loading
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false }),
			todayDate: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('ACTIVITY_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/activities";
			return;
		}

		// Set Min Date to Today
		this.setData('todayDate', new Date().toISOString().split('T')[0]);

		// Check for URL param (pre-select deal)
		const params = this.getData('params') || {};
		// If your router passes query params differently, adjust here.
		// Assuming standard Lyte routing or URL parsing:
		const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
		const dealId = urlParams.get('dealId');
		if (dealId) {
			this.setData('selectedDealId', dealId);
		}

		this.loadDeals();
	},

	loadDeals: function() {
		this.setData('isLoading', true);
		this.crmGetDeals()
			.then((res) => {
				const list = res.data || [];
				// API returns flat deal objects
				this.setData('deals', list);
			})
			.catch(err => {
				console.error("Deals Load Error", err);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	actions: {
		selectType: function(typeId, defaultStatus) {
			this.setData('selectedType', typeId);
			this.setData('currentStatusHint', defaultStatus.replace('_', ' '));
		},

		createActivity: function() {
			// 1. Direct DOM Reading
			const type = this.getData('selectedType'); // This is safe from state
			const dealId = document.getElementById('sel_deal').value;
			const description = document.getElementById('inp_desc').value.trim();
			const dueDate = document.getElementById('inp_date').value;

			// 2. Validation
			if (!dealId) {
				alert("Please select a Related Deal");
				return;
			}
			if (!dueDate) {
				alert("Please select a Due Date");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				dealId: parseInt(dealId),
				type: type,
				description: description,
				dueDate: dueDate
			};

			this.crmSaveActivity(payload)
				.then((res) => {
					if (res.success) {
						alert("Activity created successfully!");
						window.location.hash = "#/activities";
					} else {
						alert("Error: " + (res.message || "Creation failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/activities";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });