Lyte.Router.registerRoute("crm-app.contact-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "contact-edit"};
    }
});