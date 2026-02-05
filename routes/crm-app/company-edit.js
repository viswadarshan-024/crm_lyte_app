Lyte.Router.registerRoute("crm-app.company-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "company-edit"};
    }
});