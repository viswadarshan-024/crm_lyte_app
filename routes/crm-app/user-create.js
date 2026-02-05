Lyte.Router.registerRoute("crm-app.user-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "user-create"};
    }
});