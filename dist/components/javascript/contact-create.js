Lyte.Component.register("contact-create", {
_template:"<template tag-name=\"contact-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add Contact</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading form...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Contact Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\" placeholder=\"e.g. Jane Doe\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"jane@example.com\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\" placeholder=\"+1 555-0123\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Professional Details</h3> <div class=\"form-group\"> <label>Company <span class=\"required\">*</span></label> <select id=\"sel_company\" class=\"form-select\" lyte-model=\"selectedCompanyId\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group\"> <label>Job Title</label> <input type=\"text\" id=\"inp_job\" class=\"form-input\" placeholder=\"e.g. Purchasing Manager\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createContact')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Contact</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companies","selectedCompanyId","isLoading","isSaving"],

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