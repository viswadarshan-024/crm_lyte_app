Lyte.Component.register("login-comp", {
        data : function(){
            return {
                username : Lyte.attr("string", { default: "ceo" }),
                password : Lyte.attr("string", { default: "password" }),
                error : Lyte.attr("string", { default: "" }),
                isLoading : Lyte.attr("boolean", { default: false })
            }
        },

        actions : {
            login : function() {
                let self = this;
                let username = this.getData('username');
                let password = this.getData('password');

                console.log("Login attempt:", username);

                if(!username || !password) {
                    this.setData('error', 'Please enter username and password');
                    return;
                }

                this.setData('isLoading', true);
                this.setData('error', '');

                this.loginUser(username, password)
                    .then(function(res) {
                        console.log("Login successful", res);
                        self.setData('isLoading', false);
                        Lyte.Router.transitionTo('crm-app.crm-dashboard');
                    })
                    .catch(function(err) {
                        console.error("Login rejected", err);
                        self.setData('isLoading', false);

                        let msg = "Invalid Credentials";
                        if(err && err.data && err.data.message) {
                            msg = err.data.message;
                        } else if (err.message) {
                            msg = err.message;
                        }
                        self.setData('error', msg);
                    });
            }
        }
    },
    { mixins: ["api-mixin", "crm-api-mixin", "auth-mixin"]}
);