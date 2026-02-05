Lyte.Mixin.register("crm-api-mixin", {
        // 1. Dependency: Include api-mixin to use 'this.apiRequest'
        // mixins: ["api-mixin"],

        // methods: {
        // ================= DASHBOARD =================
        crmGetDashboard: function (limit) {
            limit = limit || 5;
            return this.apiRequest('dashboard.action', {
                method: 'GET',
                body: {recentLimit: limit}
            });
        },

        // ================= AUTHENTICATION =================
        // FIX: Added login/logout here as requested
        crmLogin: function (username, password) {
            return this.apiRequest('login.action', {
                method: 'POST',
                body: {username: username, password: password}
            });
        },

        // crmLogin: function (credentials) {
        //     // FIX: Just pass the plain object.
        //     // Our updated apiRequest will automatically convert this to
        //     // application/x-www-form-urlencoded because it's a POST request.
        //     return this.apiRequest('login.action', {
        //         method: 'POST',
        //         body: credentials
        //     });
        // },

        crmLogout: function () {
            // Usually logout is just a client-side cleanup,
            // but if there is a server endpoint:
            return this.apiRequest('logout.action', {method: 'POST'});
        },

        // ================= COMPANIES =================
        crmGetCompanies: function (params) {
            return this.apiRequest('company.action', {
                method: 'GET',
                body: params
            });
        },

        crmGetCompany: function (id) {
            return this.apiRequest('company-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddCompany: function () {
            return this.apiRequest('company-add.action', {method: 'GET'});
        },

        crmEditCompany: function (id) {
            return this.apiRequest('company-edit.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveCompany: function (data) {
            // Handles both Save and Update based on your legacy code
            return this.apiRequest('company-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteCompany: function (id) {
            return this.apiRequest('company-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmPreviewCompanyEnrichment: function (data) {
            return this.apiRequest('company-preview-enrichment.action', {
                method: 'POST',
                body: data
            });
        },

        // ================= CONTACTS =================
        crmGetContacts: function (params) {
            // FIX: Convert params object to query string (e.g. ?companyId=1)
            let queryString = "";

            // Check if params exist and are not empty
            if (params && Object.keys(params).length > 0) {
                // URLSearchParams automatically handles keys, values, and encoding
                queryString = "?" + new URLSearchParams(params).toString();
            }

            console.log("contact.action" + queryString);
            // Append queryString to the URL
            return this.apiRequest('contact.action' + queryString, {
                method: 'GET'
                // REMOVE 'body': params (GET requests cannot have a body)
            });
        },

// You can apply the same logic here if needed, or just rely on crmGetContacts logic
        crmGetContactsByCompany: function (companyId) {
            return this.crmGetContacts({ companyId: companyId });
        },

        crmGetContact: function (id) {
            return this.apiRequest('contact-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddContact: function () {
            return this.apiRequest('contact-add.action', {method: 'GET'});
        },

        crmEditContact: function (id) {
            return this.apiRequest('contact-edit.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveContact: function (data) {
            return this.apiRequest('contact-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteContact: function (id) {
            return this.apiRequest('contact-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        // ================= DEALS =================

        crmGetDeals: function (params) {
            let queryString = "";
            if (params && Object.keys(params).length > 0) {
                queryString = "?" + new URLSearchParams(params).toString();
            }
            return this.apiRequest('deal.action' + queryString, {
                method: 'GET'
                // NO BODY for GET
            });
        },

        // GET: View Single Deal
        crmGetDeal: function (id) {
            return this.apiRequest('deal-view.action?id=' + id, {
                method: 'GET'
            });
        },

        // GET: Add Screen (Usually returns schema/metadata)
        crmAddDeal: function () {
            return this.apiRequest('deal-add.action', {
                method: 'GET'
            });
        },

        // GET: Edit Screen
        crmEditDeal: function (id) {
            return this.apiRequest('deal-edit.action?id=' + id, {
                method: 'GET'
            });
        },

        // POST: Save (Body is OK here)
        crmSaveDeal: function (data) {
            return this.apiRequest('deal-save.action', {
                method: 'POST',
                body: data
            });
        },

        // POST: Delete (Body is OK here)
        crmDeleteDeal: function (id) {
            return this.apiRequest('deal-delete.action', {
                method: 'POST',
                body: { id: id }
            });
        },

        // POST: Update Status (Body is OK here)
        crmUpdateDealStatus: function (data) {
            return this.apiRequest('deal-changeStatus.action', {
                method: 'POST',
                body: data
            });
        },

        // ================= ACTIVITIES =================
        crmGetActivities: function (params) {
            return this.apiRequest('activity.action', {
                method: 'GET',
                body: params
            });
        },

        crmGetActivity: function (id) {
            return this.apiRequest('activity-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveActivity: function (data) {
            return this.apiRequest('activity-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmUpdateActivity: function (data) {
            return this.apiRequest('activity-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteActivity: function (id) {
            return this.apiRequest('activity-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmUpdateActivityStatus: function (data) {
            return this.apiRequest('activity-status.action', {
                method: 'POST',
                body: data
            });
        },

        crmGetActivityStatusOptions: function (type, statusCode) {
            return this.apiRequest('activity-status-options.action', {
                method: 'GET',
                body: {type: type, statusCode: statusCode}
            });
        },

        // ================= USERS =================
        crmGetUsers: function () {
            return this.apiRequest('user.action', {method: 'GET'});
        },

        crmGetUser: function (id) {
            return this.apiRequest('user-view-detail.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddUser: function () {
            return this.apiRequest('user-add.action', {method: 'GET'});
        },

        crmUpdateUser: function (data) {
            return this.apiRequest('user-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmSaveUser: function (data) {
            return this.apiRequest('user-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteUser: function (id) {
            return this.apiRequest('user-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        // ================= ROLES =================
        crmGetRoles: function () {
            return this.apiRequest('role.action', {method: 'GET'});
        },

        crmGetRole: function (roleId) {
            return this.apiRequest('role-view.action', {
                method: 'GET',
                body: {roleId: roleId}
            });
        },

        crmCreateRole: function (data) {
            return this.apiRequest('role-create.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteRole: function (roleId) {
            return this.apiRequest('role-delete.action', {
                method: 'POST',
                body: {roleId: roleId}
            });
        },

        crmAssignRoleToUser: function (userId, roleId) {
            return this.apiRequest('user-assign-role.action', {
                method: 'POST',
                body: {userId: userId, roleId: roleId}
            });
        },

        // ================= PROFILES & PERMISSIONS =================
        crmGetProfiles: function () {
            return this.apiRequest('profile-list.action', {method: 'GET'});
        },

        crmGetProfile: function (id) {
            return this.apiRequest('profile-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmCreateProfile: function (data) {
            return this.apiRequest('profile-create.action', {
                method: 'POST',
                body: data
            });
        },

        crmUpdateProfile: function (id, data) {
            // Merging ID into data as per your API
            data = data || {};
            data.id = id;
            return this.apiRequest('profile-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteProfile: function (id) {
            return this.apiRequest('profile-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmGetPermissions: function () {
            return this.apiRequest('role-permissions.action', {method: 'GET'});
        }
        // }
    },
// { "mixins" : [ "api-mixin" ]}
);