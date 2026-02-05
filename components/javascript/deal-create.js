Lyte.Component.register("deal-create", {
	// ... (keep data and didConnect the same) ...
	data: function() {
		return {
			companies: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }),
			orderTypes: Lyte.attr("array", { default: [] }),
			allContacts: Lyte.attr("array", { default: [] }),
			filteredContacts: Lyte.attr("array", { default: [] }),
			selectedContactIds: Lyte.attr("array", { default: [] }),

			title: Lyte.attr("string", { default: "" }),
			amount: Lyte.attr("string", { default: "" }),
			orderType: Lyte.attr("string", { default: "STANDARD" }),
			selectedCompany: Lyte.attr("string", { default: "" }),
			assignedUserId: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('DEAL_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/deals";
			return;
		}
		this.loadInitialData();
	},

	loadInitialData: function() {
		this.setData('isLoading', true);
		Promise.all([
			this.crmAddDeal(),
			this.crmGetContacts({})
		]).then((responses) => {
			const [metaRes, contactRes] = responses;
			if (metaRes.success && metaRes.data) {
				this.setData('companies', metaRes.data.companies || []);
				this.setData('users', metaRes.data.users || []);
				this.setData('orderTypes', metaRes.data.orderTypes || []);
				const currentUser = this.getAuthUser();
				if (currentUser && currentUser.userId) {
					this.setData('assignedUserId', currentUser.userId);
				}
			}
			let contacts = [];
			if (contactRes && contactRes.data && Array.isArray(contactRes.data.data)) {
				contacts = contactRes.data.data;
			} else if (contactRes && Array.isArray(contactRes.data)) {
				contacts = contactRes.data;
			}
			this.setData('allContacts', contacts);
		}).catch(err => {
			console.error(err);
			alert("Error loading form data");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	actions: {
		onCompanySelect: function(event) {
			const element = event.target;
			const compId = element.value;

			this.setData('selectedCompany', compId);
			this.setData('selectedContactIds', []); // Reset contacts

			if (!compId) {
				this.setData('filteredContacts', []);
				return;
			}

			const all = this.getData('allContacts');
			const relevant = all.filter(c => String(c.companyId) === String(compId));
			this.setData('filteredContacts', relevant);
		},

		toggleContact: function(contactId, event) {
			let selected = this.getData('selectedContactIds') || [];
			if (event.target.checked) {
				selected.push(contactId);
			} else {
				selected = selected.filter(id => id !== contactId);
			}
			this.setData('selectedContactIds', selected);
		},

		createDeal: function() {
			// 1. Get Elements
			const titleInput = document.getElementById('inp_title');
			const amountInput = document.getElementById('inp_amount');
			const companySelect = document.getElementById('sel_company'); // FIX: Get Select Element

			// 2. Read Values Directly
			const rawTitle = titleInput ? titleInput.value : "";
			const rawAmount = amountInput ? amountInput.value : "";
			const rawCompId = companySelect ? companySelect.value : ""; // FIX: Read Value

			console.log("DOM Read - Title:", rawTitle, "Amount:", rawAmount, "Company:", rawCompId);

			// 3. Validation
			if (!rawTitle || rawTitle.trim() === "") {
				alert("Please enter a Deal Title");
				return;
			}

			const amountVal = parseFloat(rawAmount);
			if (isNaN(amountVal) || amountVal <= 0) {
				alert("Please enter a valid Amount");
				return;
			}

			// Check if Company ID exists
			if (!rawCompId || rawCompId === "") {
				alert("Please select a Company");
				return;
			}

			this.setData('isSaving', true);

			// 4. Payload
			const payload = {
				title: rawTitle.trim(),
				amount: Number(amountVal),
				orderType: this.getData('orderType'),
				companyId: Number(rawCompId),
				assignedUserId: Number(this.getData('assignedUserId')),
				contactIds: this.getData('selectedContactIds')
			};


			this.crmSaveDeal(payload)
				.then((res) => {
					if (res.success) {
						alert("Deal created successfully!");
						window.location.hash = "#/deals";
					} else {
						throw new Error(res.message || "Creation failed");
					}
				})
				.catch((err) => {
					alert("Error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/deals";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });