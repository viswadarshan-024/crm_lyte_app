Lyte.Service.register("crm-api", {
    // 1. Inject the 'api' service automatically
    services: ["api"],

    // 2. Initialize the nested structures (companies, contacts)
    init: function() {
        // Capture 'this' to access the injected service inside nested functions
        let self = this;

        // Define 'companies' namespace
        this.companies = {
            list: function(params) {
                // Use 'self.api' which is injected by Lyte
                return self.api.request('company.action', {
                    method: 'GET',
                    body: params
                });
            }
        };

        // Define 'contacts' namespace
        this.contacts = {
            save: function(data) {
                return self.api.request('contact-add.action', {
                    method: 'POST',
                    body: data
                });
            },
            list: function(params) {
                return self.api.request('contact.action', {
                    method: 'GET',
                    body: params
                });
            }
        };
    }
});