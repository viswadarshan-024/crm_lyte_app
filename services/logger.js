Lyte.Service.register("logger", function logger(){
    this.console = function(){
        console.log.apply(console, arguments);
    }
});