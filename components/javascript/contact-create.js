Lyte.Component.register("contact-create", {
    data: function() {
        return {
            companies: Lyte.attr("array", { default: [] }),
            selectedCompanyId: Lyte.attr("string", { default: "" }),
            
            isLoading: Lyte.attr("boolean", { default: true }),
            isSaving: Lyte.attr("boolean", { default: false })
        }
    },

    didConnect: function() {
        if (!this.hasPermission('CONTACT_CREATE')) {
            alert("Permission denied");
            window.location.hash = "#/contacts";
            return;
        }

        // Check for pre-selected company in URL
        // Example: #/contacts/create?companyId=5
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const preId = urlParams.get('companyId');
        if (preId) {
            this.setData('selectedCompanyId', preId);
        }

        this.loadCompanies();
    },

    loadCompanies: function() {
        this.setData('isLoading', true);
        
        // Reuse existing method from Company List logic
        this.crmGetCompanies()
            .then((res) => {
                const list = res.data || [];
                this.setData('companies', list);
            })
            .catch(err => {
                console.error("Companies Load Error", err);
                alert("Failed to load companies list");
            })
            .finally(() => {
                this.setData('isLoading', false);
            });
    },

    actions: {
        createContact: function() {
            // 1. Direct DOM Reading
            const name = document.getElementById('inp_name').value.trim();
            const email = document.getElementById('inp_email').value.trim();
            const phone = document.getElementById('inp_phone').value.trim();
            const jobTitle = document.getElementById('inp_job').value.trim();
            const companyId = document.getElementById('sel_company').value;

            // 2. Validation
            if (!name) {
                alert("Contact Name is required");
                return;
            }
            if (!companyId) {
                alert("Please select a Company");
                return;
            }

            this.setData('isSaving', true);

            // 3. Payload
            const payload = {
                name: name,
                email: email,
                phone: phone,
                jobTitle: jobTitle, // Maps to 'designation' in UI concept, but 'jobTitle' in API
                companyId: parseInt(companyId)
            };

            this.crmSaveContact(payload)
                .then((res) => {
                    if (res.success) {
                        alert("Contact created successfully!");
                        window.location.hash = "#/contacts";
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
            window.location.hash = "#/contacts";
        }
    }
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });