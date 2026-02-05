Lyte.Router.registerRoute("crm-app.user-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "user-edit"};
    }
});