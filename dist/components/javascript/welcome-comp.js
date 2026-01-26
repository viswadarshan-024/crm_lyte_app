Lyte.Component.register("welcome-comp",{
_template:"<template tag-name=\"welcome-comp\"> <h1>Available features of LYTE</h1> <ul> <template items=\"{{features}}\" item=\"item\" index=\"index\" is=\"for\"><li> <a href=\"{{item.url}}\" target=\"_blank\">{{item.module}}</a> </li></template> </ul> </template>",
_dynamicNodes : [{"type":"attr","position":[3,1]},{"type":"for","position":[3,1],"dynamicNodes":[{"type":"attr","position":[0,1]},{"type":"text","position":[0,1,0]}]}],
_observedAttributes :["features"],

	data : function(){
		return {
			features : Lyte.attr("array")
		}
	},
	actions : {
		// Functions for event handling
	},
	methods : {
		// Functions which can be used as callback in the component.
	}
});
