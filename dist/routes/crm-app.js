Lyte.Router.registerRoute("crm-app", {

    // The 'transition' argument tells us where the user is trying to go
    beforeModel: function(transition) {

        // 1. Authentication Check
        let user = localStorage.getItem('user');
        if (!user) {
            this.replaceWith('login');
            return; // Stop execution
        }

        // 2. Smart Redirect
        // Check if the user is aiming for the root 'crm-app' or 'crm-app.index'.
        // We use 'transition.targetName' to see their destination.
        // If they are trying to go to 'crm-app.contact-list', this condition will be false,
        // allowing them to proceed to contacts correctly.
        if (transition.targetName === 'crm-app' || transition.targetName === 'crm-app.index') {
            this.replaceWith('crm-app.crm-dashboard');
        }
    },

    renderTemplate: function() {
        return { outlet: "#outlet", component: "crm-app" };
    }
});