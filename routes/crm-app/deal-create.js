Lyte.Router.registerRoute("crm-app.deal-create", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "deal-create"
        };
    }
});