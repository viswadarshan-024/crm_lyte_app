Lyte.Component.register("contact-view", {
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