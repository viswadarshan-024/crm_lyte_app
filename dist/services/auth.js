Lyte.Service.register("auth", {
    // 1. Dependency Injection (Standard Lyte Syntax)
    services: ["api"],

    // 2. Data Properties
    user: null,
    permissions: [],

    PERMISSIONS: {
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
        ACTIVITY_CREATE: 'ACTIVITY_CREATE',
        ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
        ACTIVITY_DELETE: 'ACTIVITY_DELETE',
        ACTIVITY_VIEW_ALL: 'ACTIVITY_VIEW_ALL',
        ACTIVITY_VIEW_TEAM: 'ACTIVITY_VIEW_TEAM',
        ACTIVITY_VIEW_SELF: 'ACTIVITY_VIEW_SELF',
        USER_MANAGE: 'USER_MANAGE'
    },

    // 3. Initialization
    init: function() {
        let stored = localStorage.getItem('user');
        if (stored) {
            try {
                this.setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Invalid user data in storage");
                this.logout();
            }
        }
    },

    // 4. Methods
    setUser: function(userData) {
        this.user = userData;
        this.permissions = userData.permissions || [];
        localStorage.setItem('user', JSON.stringify(userData));
    },

    login: function(username, password) {
        // Access the injected 'api' service using 'this.api'
        let apiService = this.api;

        if (!apiService) {
            return Promise.reject({ message: "System Error: API Service Unreachable. Check services/api.js" });
        }

        return apiService.request('login.action', {
            method: 'POST',
            body: {
                username: username,
                password: password
            }
        }).then((response) => {
            let userData = response.data;
            if(userData && userData.userContext) {
                userData = userData.userContext;
            }

            if (userData) {
                this.setUser(userData);
                return response;
            } else {
                throw new Error("Invalid response from server");
            }
        });
    },

    getUser: function() {
        return this.user;
    },

    getRoleName: function() {
        return (this.user && this.user.roleName) ? this.user.roleName : '';
    },

    getProfileName: function() {
        return (this.user && this.user.profileName) ? this.user.profileName : '';
    },

    getPermissions: function() {
        return this.permissions;
    },

    isAuthenticated: function() {
        return !!this.user;
    },

    logout: function() {
        this.user = null;
        this.permissions = [];
        localStorage.removeItem('user');

        if(Lyte.Router) {
            Lyte.Router.transitionTo('login');
        } else {
            window.location.href = "/";
        }
    },

    hasPermission: function(permissionCode) {
        if (!permissionCode) return false;
        return this.permissions.indexOf(permissionCode) !== -1;
    },

    hasAnyPermission: function() {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let self = this;
        return codeList.some(function(code) {
            return self.permissions.indexOf(code) !== -1;
        });
    },

    hasAllPermissions: function() {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let self = this;
        return codeList.every(function(code) {
            return self.permissions.indexOf(code) !== -1;
        });
    },

    canAccess: function(module) {
        if (!this.user) return false;

        switch (module) {
            case 'dashboard': return true;
            case 'companies': return this.hasAnyPermission(this.PERMISSIONS.COMPANY_CREATE, this.PERMISSIONS.COMPANY_UPDATE, this.PERMISSIONS.COMPANY_DELETE);
            case 'contacts': return this.hasAnyPermission(this.PERMISSIONS.CONTACT_CREATE, this.PERMISSIONS.CONTACT_UPDATE, this.PERMISSIONS.CONTACT_DELETE, this.PERMISSIONS.CONTACT_VIEW_SELF);
            case 'deals': return this.hasAnyPermission(this.PERMISSIONS.DEAL_VIEW_ALL, this.PERMISSIONS.DEAL_VIEW_TEAM, this.PERMISSIONS.DEAL_VIEW_SELF, this.PERMISSIONS.DEAL_CREATE);
            case 'activities': return this.hasAnyPermission(this.PERMISSIONS.ACTIVITY_VIEW_ALL, this.PERMISSIONS.ACTIVITY_VIEW_TEAM, this.PERMISSIONS.ACTIVITY_VIEW_SELF, this.PERMISSIONS.ACTIVITY_CREATE);
            case 'users':
            case 'roles':
            case 'profiles': return this.hasPermission(this.PERMISSIONS.USER_MANAGE);
            case 'settings': return true;
            default: return false;
        }
    }
});