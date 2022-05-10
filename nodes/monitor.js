// TODO Assign warning and error numbers

module.exports = function(RED) {

	let armed = false
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
			// that.warn("No previous sensor states to restore. See https://nodered.org/docs/user-guide/context#saving-context-data-to-the-file-system how to persistently save states.")
			context = {
				items: {}
			}
		}

		
		// FUNCTIONS ====>

		function setNodeStateFunc() {
			let fill, shape, text

			if (!armed) {
				fill = "grey"
				shape = "ring"
				text = "Disarmed"
			} else {
				fill = "green"
				shape = "dot"
				text = "Armed"
			}
			
			if (alert) {
				fill = "red"
				shape = "dot"
				text = "Alert"
			} else if (warning) {
				fill = "yellow"
				shape = "dot"
				text = "Warning"
			}
			
			that.status({fill: fill, shape: shape, text: text})
			that.send({topic: "status", payload: {"armed": armed, "warning": warning, "alert": alert}})		// TODO scheint bei jedem Deploy gesendet zu werden

		}


		function alertFunc() {
			warning = false
			alert = true
			setNodeStateFunc()
		}


		function sendContext() {
			that.send({topic: "context", payload: context})
		}

		// <==== FUNCTIONS


		// FIRST RUN ACTIONS ====>

		setNodeStateFunc()

		let warningTimeFactor
		if (node.warningTimeUnit === "s") {warningTimeFactor = 1000}
		else if (node.warningTimeUnit === "m") {warningTimeFactor = 60000}
		else if (node.warningTimeUnit === "h") {warningTimeFactor = 3600000}
		else {that.error("E010: Warning time unit invalid")}
		
		context.warningTime = Number(node.warningTime) * warningTimeFactor
		
		// TODO verify node.monitorTopic

		// <==== FIRST RUN ACTIONS

		
		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			// ACTIVATION MESSAGE
			
			if (msg.topic === "activate") {		// TODO make configurable
				clearTimeout(warningTimeoutHandle)
				if (msg.payload === true) {
					armed = true		// TODO ist active im context am besten untergebracht??
					warning = false
					alert = false
					setNodeStateFunc()
				} else if (msg.payload === false) {
					armed = false
					warning = false
					alert = false
					setNodeStateFunc()
				} else {
					// TODO send message: invalid payload (not bool)
				}
			} else if (armed) {
				if (node.warningTime > 0) {
					warningTimeoutHandle = setTimeout(alertFunc, context.warningTime)
					warning = true
					setNodeStateFunc()
				} else {
					alertFunc()
				}
			}

			if (node.debug) {sendContext()}

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