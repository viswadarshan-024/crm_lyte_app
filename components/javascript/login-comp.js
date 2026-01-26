Lyte.Component.register("login-comp", {
    data : function(){
        return {
            username : Lyte.attr("string", { default: "" }),
            password : Lyte.attr("string", { default: "" }),
            error : Lyte.attr("string", { default: "" }),
            isLoading : Lyte.attr("boolean", { default: false })
        }
    },
    actions : {
        login : function() {
            let self = this;
            let username = this.getData('username');
            let password = this.getData('password');

            if (!username) {
                let uInput = this.$node.querySelector("input[lyte-model='username']");
                if (uInput && uInput.value) {
                    username = uInput.value;
                    this.setData('username', username);
                }
            }
            if (!password) {
                 let pInput = this.$node.querySelector("input[lyte-model='password']");
                 if (pInput && pInput.value) {
                     password = pInput.value;
                     this.setData('password', password);
                 }
            }

            console.log("Login attempt:", username, "Password length:", password ? password.length : 0);

            if(!username || !password) {
                this.setData('error', 'Please enter username and password');
                return;
            }

            this.setData('isLoading', true);
            this.setData('error', '');

            let auth = this.auth;
            // let auth = this.services('auth');

            if(!auth) {
                console.log("Component Services:", this.services);
                console.log("Component Context:", this);
            }

            if (!auth) {
                console.warn("Auth service not injected via 'this.auth'. Intentional fallback search.");
                if (typeof $L !== 'undefined' && $L.getService) {
                    auth = $L.getService("auth");
                }
                else if (Lyte.Service && Lyte.Service.getService) {
                    // auth = Lyte.Service.getService("auth");
                }
            }

            if (!auth) {
                 console.error("CRITICAL: Auth service could not be found.");
                 this.setData('error', "System Error: Authentication Service Unavailable");
                 this.setData('isLoading', false);
                 return;
            }

            try {
                auth.login(username, password)
                .then(function(res) {
                    console.log("Login successful", res);
                    self.setData('isLoading', false);
                    Lyte.Router.transitionTo('dashboard');
                })
                .catch(function(err) {
                    console.error("Login rejected", err);
                    self.setData('isLoading', false);
                    let msg = "Invalid Credentials";
                    if(err && err.data && err.data.message) {
                        msg = err.data.message;
                    } else if (err && err.message) {
                         msg = err.message;
                    }
                    self.setData('error', msg);
                });
            } catch (e) {
                console.error("Login action crashed synchronously:", e);
                self.setData('isLoading', false);
                self.setData('error', "System Error: " + e.message);
            }
        }
    }
    },
    {
        services : ["auth"]
    });
