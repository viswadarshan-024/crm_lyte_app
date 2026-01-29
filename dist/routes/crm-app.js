Lyte.Router.registerRoute("crm-app", {

    beforeModel: function(transition) {
        let user = localStorage.getItem('user');
        if (!user) {
            this.replaceWith('login');
            return;
        }
        if (transition.targetName === 'crm-app' || transition.targetName === 'crm-app.index') {
            this.replaceWith('crm-app.crm-dashboard');
        }
    },

    renderTemplate: function() {
        return { outlet: "#outlet", component: "crm-app" };
    }
});