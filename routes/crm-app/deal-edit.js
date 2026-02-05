Lyte.Router.registerRoute("crm-app.deal-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "deal-edit"};
    }
});