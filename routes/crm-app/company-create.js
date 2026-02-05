Lyte.Router.registerRoute("crm-app.company-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "company-create"};
    }
});