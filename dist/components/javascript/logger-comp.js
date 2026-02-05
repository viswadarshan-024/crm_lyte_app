Lyte.Component.register("logger-comp",{
_template:"<template tag-name=\"logger-comp\"> <h1>Logging</h1> </template>",
_dynamicNodes : [],

	init:function(){
		this.logger.log("test");
		this.log1.log("test-1");
	}
},{
	services: ["logger", {service:"logger", as:"log1"}, {service:"logger", as:"log2", scope:"static"}, {service:"logger", as:"log3", scope: "instance"}]
});