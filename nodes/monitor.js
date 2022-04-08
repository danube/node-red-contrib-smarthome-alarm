// TODO Assign warning and error numbers

module.exports = function(RED) {

	function monitor(node) {
		RED.nodes.createNode(this, node)
		const that = this

		let err = false

		// Importing node context
		const nodeContext = that.context()

		/**
		 * The node context object
		 * @items {object} Contains sensor states
		 */
		let context = nodeContext.get("context")
		if (!context) {
			that.warn("No previous sensor states to restore. See https://nodered.org/docs/user-guide/context#saving-context-data-to-the-file-system how to persistently save states.")
			context = {
				items: {}
			}
		}

		
		// FUNCTIONS ====>
		
		function setNodeState(state) {
			// TODO working with state
			// TODO different appearance if num = 0
			const numItems = Object.keys(context.items).length
			let sinpluStr = "items"
			if (numItems === 1) {
				sinpluStr = "items"
			}
			that.status({fill: "grey", shape: "ring", text: numItems + " " + sinpluStr + " in storage"});
		}

		// <==== FUNCTIONS


		// FIRST RUN ACTIONS ====>

		setNodeState()

		// TODO verify node.monitorTopic

		// <==== FIRST RUN ACTIONS

		
		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			// TODO validate message (topic and payload)
			// TODO give possibility to reset items
			
			context.items[msg.topic] = msg.payload
		
			setNodeState()




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

	RED.nodes.registerType("monitor",monitor)
}