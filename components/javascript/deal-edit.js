Lyte.Component.register("deal-edit", {
	data: function() {
		return {
			dealId: Lyte.attr("string", { default: "" }),

			// Data Models
			deal: Lyte.attr("object", { default: {} }),
			companies: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }),
			orderTypes: Lyte.attr("array", { default: [] }),
			allContacts: Lyte.attr("array", { default: [] }),

			// Filtered Contacts Logic
			filteredContacts: Lyte.attr("array", { default: [] }),
			selectedContactIds: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('DEAL_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/deals";
			return;
		}

		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/deals";
			return;
		}

		this.setData('dealId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('dealId');

		// Parallel Fetch: Deal Details + Metadata + All Contacts (for client-side filtering)
		Promise.all([
			this.crmEditDeal(id),
			this.crmGetContacts({}) // Fetch all contacts to filter manually
		]).then((responses) => {
			const [dealRes, contactRes] = responses;

			if (!dealRes.success) throw new Error(dealRes.message);

			const data = dealRes.data || {};
			const deal = data.deal || {};

			// 1. Set Base Data
			this.setData('deal', deal);
			this.setData('companies', data.companies || []);
			this.setData('users', data.users || []);
			this.setData('orderTypes', data.orderTypes || []);

			// 2. Set Contacts Data
			let contacts = [];
			if (contactRes.success) {
				contacts = Array.isArray(contactRes.data) ? contactRes.data : (contactRes.data.data || []);
			}
			this.setData('allContacts', contacts);

			// 3. Set Selected Contacts from Deal
			// deal.contactIds comes from API
			this.setData('selectedContactIds', deal.contactIds || []);

			// 4. Force Populate Form
			setTimeout(() => {
				this.populateForm(deal);
				// Trigger contact filtering based on the initial company
				this.filterContacts(deal.companyId);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load deal.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(deal) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_title', deal.title);
		setVal('inp_amount', deal.amount);
		setVal('sel_type', deal.orderType);

		const compEl = document.getElementById('sel_company');
		if (compEl) compEl.value = deal.companyId;

		const userEl = document.getElementById('sel_user');
		if (userEl) userEl.value = deal.assignedUserId;
	},

	filterContacts: function(companyId) {
		if (!companyId) {
			this.setData('filteredContacts', []);
			return;
		}

		const all = this.getData('allContacts');
		const selected = this.getData('selectedContactIds') || [];

		const relevant = all
			.filter(c => String(c.companyId) === String(companyId))
			.map(c => ({
				...c,
				// Add explicit property for template binding
				isSelected: selected.includes(c.id)
			}));

		this.setData('filteredContacts', relevant);
	},

	actions: {
		onCompanyChange: function(event) {
			const compId = event.target.value;
			// Clear contacts when company changes
			this.setData('selectedContactIds', []);
			this.filterContacts(compId);
		},

		toggleContact: function(contactId, event) {
			let selected = this.getData('selectedContactIds') || [];
			// Ensure ID type consistency
			const id = typeof contactId === 'string' ? parseInt(contactId) : contactId;

			if (event.target.checked) {
				if(!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedContactIds', selected);
		},

		updateDeal: function() {
			// Direct DOM Reading
			const title = document.getElementById('inp_title').value.trim();
			const amount = document.getElementById('inp_amount').value;
			const compId = document.getElementById('sel_company').value;
			const userId = document.getElementById('sel_user').value;
			const type = document.getElementById('sel_type').value;

			if (!title) { alert("Deal Title is required"); return; }
			if (!compId) { alert("Company is required"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('dealId')),
				title: title,
				amount: parseFloat(amount),
				orderType: type,
				companyId: parseInt(compId),
				assignedUserId: parseInt(userId),
				contactIds: this.getData('selectedContactIds')
			};

			this.crmSaveDeal(payload)
				.then((res) => {
					if (res.success) {
						alert("Deal updated successfully!");
						window.location.hash = "#/deals/view/" + this.getData('dealId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/deals/" + this.getData('dealId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });