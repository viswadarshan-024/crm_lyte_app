Lyte.Component.register("company-view", {
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