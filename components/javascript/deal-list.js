Lyte.Component.register("deal-list", {
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