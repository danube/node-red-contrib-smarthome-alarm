module.exports = function(RED) {
    function ConfigNode(config) {
        RED.nodes.createNode(this,config);
        this.config = config;
    }
    RED.nodes.registerType("mytemplate-config",ConfigNode);

	// Definition of persistant variables
	let handle = null;

	function MyTemplate(originalConfig) {
		RED.nodes.createNode(this,originalConfig);


		// Copying environment to locale
		const that = this;


		// Backing up config to be able to manipulate it
		let config = originalConfig;
		

		// Reading configuration node
		config.sub = RED.nodes.getNode(config.server);


		// Importing node context
		const nodeContext = that.context();
		/**
		 * The node context object
		 * @property {object} context The context object
		 * @property {bool} context.somebool Some Bool variable
		 * @property {string} context.somestring Some String variable
		 */
		let context = nodeContext.get("context");
		if (!context) {				// Create an array, if no context persists.
			if (config.debug) {
				that.warn("No context to restore, so sensor states are unknown. See https://nodered.org/docs/user-guide/context#saving-context-data-to-the-file-system how to save states.");
			}
			context = {};
		}
		
		
		// Place for variable and constant definitions
		var err = false;
		const someConstant = 1;
		let someVariable = 2;
		
		// Importing external modules
		const some = require("./some");			// Must be a valid local file
		const suncalc = require("suncalc");		// Must be defined in package.json


		// FUNCTIONS ====>
		
		/**
		 * This is a function
		 * @param {String} input This is the input parameter description
		 * @returns {String} This is the return value description
		 */
		function someFunc() {
			// Function business code
		}

		/**
		 * This is another function
		 * @param {String} input This is the input parameter description
		 * @returns {String} This is the return value description
		 */
		function loopFunc() {
			that.log("loop!")
		}

		// <==== FUNCTIONS






		// FIRST RUN ACTIONS ====>

		// Do the following, if the user does not configure a string and is not required to do so.
		config.toggleTopic = config.toggleTopic || "toggle";

		// Some typed ("num", "bool") payloads come as string. Do the following, to convert them to the relevant format.
		// convert config string: toggle payload
		if (config.togglePayloadType === 'num') {config.togglePayload = Number(originalConfig.togglePayload)}
		else if (config.togglePayloadType === 'bool') {config.togglePayload = originalConfig.togglePayload === 'true'}
		else {config.togglePayload = originalConfig.togglePayload};

		// Show config and context on console
		if (true) {
			// console.log("Debugging is enabled in the node properties. Here comes config:");
			// console.log(config);
			// console.log("Debugging is enabled in the node properties. Here comes context:");
			// console.log(context);
		}

		// Start loop
		clearInterval(handle);
		handle = setInterval(loopFunc, 5000);

		// <==== FIRST RUN ACTIONS

		



		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			console.log(some("this is such a string"));
			context.timestamp = Date.now();

			if (err) {
				if (done) {
					// Node-RED 1.0 compatible
					done(err);
				} else {
					// Node-RED 0.x compatible
					this.error(err,msg);
				}
			}

			
		});
			
		// <==== MESSAGE EVENT ACTIONS
			
			



		// CLOSE EVENTS ====>

		this.on('close', function() {
			that.log("DEBUG: HERES A CLOSE!!!")
		})

		// <==== CLOSE EVENTS


		/** Stroring back context */
		nodeContext.set("context", context);


	}

	RED.nodes.registerType("mytemplate",MyTemplate);
}