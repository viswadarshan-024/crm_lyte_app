Lyte.Service.register("crm-api", class CrmApi {
    static services = ["api"];

    constructor() {
        this.companies = {
            list: (params) => this.api.request('company.action', { method: 'GET', body: params })
        };

        this.contacts = {
            save: (data) => this.api.request('contact-add.action', { method: 'POST', body: data }),
            list: (params) => this.api.request('contact.action', { method: 'GET', body: params }),
        };
    }

    get api() {
        return this.getService('api');
    }
});