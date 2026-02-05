Lyte.Router.registerRoute("crm-app.deal-list", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "deal-list"
        };
    }
});