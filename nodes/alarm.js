module.exports = function(RED) {

	function alarm(node) {
		RED.nodes.createNode(this, node)
		const that = this

		let err = false

		// Importing node context
		const nodeContext = that.context()

		/**
		 * The node context object
		 * @property {object} context The context object
		 * @property {bool} context.somebool Some Bool variable
		 * @property {string} context.somestring Some String variable
		 */
		let context = nodeContext.get("context")
		if (!context) {				// Create an array, if no context persists.
			if (node.debug) {
				that.warn("No context to restore, so sensor states are unknown. See https://nodered.org/docs/user-guide/context#saving-context-data-to-the-file-system how to save states.")
			}
			context = {}
		}

		
		// FUNCTIONS ====>
		
		// ...

		// <==== FUNCTIONS


		// FIRST RUN ACTIONS ====>

		// ...

		// <==== FIRST RUN ACTIONS

		
		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			// ...

			if (err) {
				if (done) {
					// Node-RED 1.0 compatible
					done(err)
				} else {
					// Node-RED 0.x compatible
					this.error(err,msg)
				}
			}

			
		})
			
		// <==== MESSAGE EVENT ACTIONS
			
			



		// CLOSE EVENTS ====>

		// ...

		// <==== CLOSE EVENTS


		/** Stroring back context */
		nodeContext.set("context", context)


	}

	RED.nodes.registerType("alarm",alarm)
}