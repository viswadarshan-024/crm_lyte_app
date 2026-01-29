Lyte.Router.registerRoute("crm-app.contact-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "contact-create"};
    }
});