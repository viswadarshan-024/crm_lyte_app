Lyte.Router.registerRoute("crm-app.crm-dashboard", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "crm-dashboard"
        };
    }
});