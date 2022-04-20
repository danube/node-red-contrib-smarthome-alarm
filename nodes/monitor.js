// TODO Assign warning and error numbers

module.exports = function(RED) {

	let active = false
	let warning = false
	let alert = false
	let warningTimeoutHandle

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
		
		function setNodeStateFunc() {
			// TODO working with state
			// TODO different appearance if num = 0
			const numItems = Object.keys(context.items).length
			let fill, shape, sinpluStr, text

			console.log("active: " & active & ", warning: " & warning & ", alert: " & alert)

			if (numItems === 1) {
				sinpluStr = "item"
			} else {
				sinpluStr = "items"
			}

			if (!active) {
				fill = "grey"
				shape = "ring"
				// text = numItems + " " + sinpluStr + " in storage"		// TODO preperation for rbe
				text = "Inactive"
			} else if (active) {
				fill = "green"
				shape = "dot"
				// text = "Monitoring " + numItems + " " + sinpluStr		// TODO preperation for rbe
				text = "Active"
			} else if (warning) {
				fill = "yellow"
				shape = "dot"
				text = "Warning"
			} else if (alert) {
				fill = "red"
				shape = "dot"
				text = "Alert"
			} else {
				fill = "blue"
				shape = "ring"
				text = "Unknown state"
			}
			
			that.status({fill: fill, shape: shape, text: text})
		}


		function alertFunc() {
			warning = false
			alert = true
			that.error("ALERT")
		}

		// <==== FUNCTIONS


		// FIRST RUN ACTIONS ====>

		setNodeStateFunc()

		// TODO verify node.monitorTopic

		// <==== FIRST RUN ACTIONS

		
		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			// ACTIVATION MESSAGE
			
			if (msg.topic === "activate") {		// TODO make configurable
				clearTimeout(warningTimeoutHandle)
				if (msg.payload === true) {
					active = true		// TODO ist active im context am besten untergebracht??
					warning = false
					alert = false
					setNodeStateFunc()
				} else if (msg.payload === false) {
					active = false
					warning = false
					alert = false
					setNodeStateFunc()
				} else {
					// TODO send message: invalid payload (not bool) on activate
				}
			}
			

			// TODO The following is a preperation for rbe filtering
			// // ITEM MESSAGE

			// else {
			// 	// TODO validate message (topic and payload)
			// 	// TODO give possibility to reset items
				
			// 	let task = null

			// 	if (active) {
			// 		if (context.items[msg.topic] != msg.payload) {
			// 			task = "alarm"
			// 		}
			// 	}

			// 	context.items[msg.topic] = msg.payload		// Add new item to store

			// 	msg = {
			// 		items: context.items, // TODO maybe send this only if debug is active
			// 		task: task
			// 	}
	
			// 	that.send(msg)
			// 	setNodeState()

			// }


			else {
				if (node.warningTime > 0) {
					warningTimeoutHandle = setTimeout(alertFunc, node.warningTime * 1000)
					warning = true
					setNodeStateFunc()
					that.error("WARNING")
				} else {
					alertFunc()
					setNodeStateFunc()
				}
			}




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