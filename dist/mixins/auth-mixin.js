Lyte.Mixin.register("auth-mixin", {

    // 1. Move PERMISSIONS to a helper method to guarantee access
    // This avoids "data merging" conflicts with components.
    getPermissionConstants: function() {
        return {
            COMPANY_CREATE: 'COMPANY_CREATE',
            COMPANY_UPDATE: 'COMPANY_UPDATE',
            COMPANY_DELETE: 'COMPANY_DELETE',
            CONTACT_CREATE: 'CONTACT_CREATE',
            CONTACT_UPDATE: 'CONTACT_UPDATE',
            CONTACT_DELETE: 'CONTACT_DELETE',
            CONTACT_VIEW_SELF: 'CONTACT_VIEW_SELF',
            DEAL_CREATE: 'DEAL_CREATE',
            DEAL_UPDATE: 'DEAL_UPDATE',
            DEAL_DELETE: 'DEAL_DELETE',
            DEAL_VIEW_ALL: 'DEAL_VIEW_ALL',
            DEAL_VIEW_TEAM: 'DEAL_VIEW_TEAM',
            DEAL_VIEW_SELF: 'DEAL_VIEW_SELF',
            DEAL_CHANGE_STATUS: 'DEAL_CHANGE_STATUS',
            ACTIVITY_CREATE: 'ACTIVITY_CREATE',
            ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
            ACTIVITY_DELETE: 'ACTIVITY_DELETE',
            ACTIVITY_VIEW_ALL: 'ACTIVITY_VIEW_ALL',
            ACTIVITY_VIEW_TEAM: 'ACTIVITY_VIEW_TEAM',
            ACTIVITY_VIEW_SELF: 'ACTIVITY_VIEW_SELF',
            USER_MANAGE: 'USER_MANAGE'
        };
    },

    // --- LOGIC FUNCTIONS ---

    getAuthUser: function () {
        let stored = localStorage.getItem('user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Invalid user data");
                this.logoutUser();
            }
        }
        return null;
    },

    setAuthUser: function (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },

    getAuthPermissions: function () {
        let user = this.getAuthUser();
        return (user && user.permissions) ? user.permissions : [];
    },

    isAuthenticated: function () {
        return !!this.getAuthUser();
    },

    getRoleName: function () {
        let user = this.getAuthUser();
        return (user && user.roleName) ? user.roleName : '';
    },

    loginUser: function (username, password) {
        let self = this;
        return this.crmLogin(username, password).then(function (response) {
            let userData = response.data;

            console.log(userData);
            console.log("response", response.data);
            console.log("response - ", response);

            if (userData && userData.userContext) {
                userData = userData.userContext;
            }

            if (userData) {
                self.setAuthUser(userData);
                return response;
            } else {
                throw new Error("Invalid response from server");
            }
        });
    },

    logoutUser: function () {
        localStorage.removeItem('user');
        if (Lyte.Router) {
            Lyte.Router.transitionTo('login');
        } else {
            window.location.href = "/";
        }
    },

    hasPermission: function (permissionCode) {
        if (!permissionCode) return false;
        let perms = this.getAuthPermissions();
        return perms.indexOf(permissionCode) !== -1;
    },

    hasAnyPermission: function () {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let perms = this.getAuthPermissions();

        return codeList.some(function (code) {
            return perms.indexOf(code) !== -1;
        });
    },

    hasAllPermissions: function () {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let perms = this.getAuthPermissions();

        return codeList.every(function (code) {
            return perms.indexOf(code) !== -1;
        });
    },

    canAccess: function (module) {
        if (!this.isAuthenticated()) return false;

        // FIX: Access permissions via the helper method on 'this'
        let P = this.getPermissionConstants();

        switch (module) {
            case 'dashboard':
                return true;
            case 'companies':
                return this.hasAnyPermission(P.COMPANY_CREATE, P.COMPANY_UPDATE, P.COMPANY_DELETE);
            case 'contacts':
                return this.hasAnyPermission(P.CONTACT_CREATE, P.CONTACT_UPDATE, P.CONTACT_DELETE, P.CONTACT_VIEW_SELF);
            case 'deals':
                return this.hasAnyPermission(P.DEAL_VIEW_ALL, P.DEAL_VIEW_TEAM, P.DEAL_VIEW_SELF, P.DEAL_CREATE, P.DEAL_CHANGE_STATUS);
            case 'activities':
                return this.hasAnyPermission(P.ACTIVITY_VIEW_ALL, P.ACTIVITY_VIEW_TEAM, P.ACTIVITY_VIEW_SELF, P.ACTIVITY_CREATE);
            case 'users':
            case 'roles':
            case 'profiles':
                return this.hasPermission(P.USER_MANAGE);
            case 'settings':
                return true;
            default:
                return false;
        }
    }
});