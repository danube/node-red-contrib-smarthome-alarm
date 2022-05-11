module.exports = function(RED) {

	let armed = false
	let warning = false
	let alert = false
	/** This is the warning time configured by the node [ms] */
	let warningTimeNode
	/** This is the actual warning time [ms] */
	let warningTime
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
			if (node.warningTimeOverride) {that.warn("W001: Not able to store warning time permanently")}
			context = {
				items: {}
			}
		}

		
		// FUNCTIONS ====>

		function sendNodeStateFunc() {
			let fill, shape, textStatus
			let textTimeout = ""

			let timeoutDate = new Date(warningTime)
			let timeoutM = timeoutDate.getMinutes()
			let timeoutS = timeoutDate.getSeconds()
			let timeoutMs = timeoutDate.getMilliseconds()
			
			if (timeoutM > 0) {
				textTimeout = timeoutM + "m"
			}
			if (timeoutS > 0) {
				textTimeout = textTimeout + timeoutS + "s"
			}
			if (timeoutMs > 0 || warningTime == 0) {
				textTimeout = textTimeout + timeoutMs + "ms"
			}



			if (!armed) {
				fill = "grey"
				shape = "ring"
				textStatus = "Disarmed"
			} else {
				fill = "green"
				shape = "dot"
				textStatus = "Armed"
			}
			
			if (alert) {
				fill = "red"
				shape = "dot"
				textStatus = "Alert"
			} else if (warning) {
				fill = "yellow"
				shape = "dot"
				textStatus = "Warning"
			}
			
			let text = textTimeout + " | " + textStatus

			that.status({fill: fill, shape: shape, text: text})
			
		}
		
		
		function sendStatusMessageFunc() {
			that.send({topic: "status", payload: {"armed": armed, "warning": warning, "alert": alert}})
			sendNodeStateFunc()
		}
		
		
		
		function alertFunc() {
			warning = false
			alert = true
			sendStatusMessageFunc()
		}


		function warningTimeCalcFunc() {
			if (node.warningTimeOverride && context.warningTimeOverrideActive) {
				warningTime = context.warningTimeOverrideValue
			} else {
				warningTime = warningTimeNode
			}
		}

		// <==== FUNCTIONS


		// FIRST RUN ACTIONS ====>
		
		let warningTimeFactor
		if (node.warningTimeUnit === "s") {warningTimeFactor = 1000}
		else if (node.warningTimeUnit === "m") {warningTimeFactor = 60000}
		else if (node.warningTimeUnit === "h") {warningTimeFactor = 3600000}
		else {that.error("E010: Warning time unit invalid")}
		warningTimeNode = Number(node.warningTime) * warningTimeFactor
		warningTimeCalcFunc()
		sendNodeStateFunc()

		let armingTopic = node.armingTopic || "activate"

		// if (node.debug) {console.log({topic: "debug", node: node, context: context})}

		// <==== FIRST RUN ACTIONS

		
		// MESSAGE EVENT ACTIONS ====>
		
		this.on('input', function(msg,send,done) {

			// Valid msg.timeout
			if (node.warningTimeOverride && typeof msg.timeout == "number" && msg.timeout >= 0) {
				context.warningTimeOverrideActive = true
				context.warningTimeOverrideValue = msg.timeout
				warningTimeCalcFunc()
				sendNodeStateFunc()
			// Invalid or disabling msg.timeout
			} else if (node.warningTimeOverride && msg.timeout < 0) { // DOCME wenn kleiner null, ist timeout deaktiviert und es wird node setting wert verwendet
				context.warningTimeOverrideActive = false
				warningTimeCalcFunc()
				sendNodeStateFunc()
			// Arming message
			} else if (msg.topic === armingTopic) {
				// Arm
				clearTimeout(warningTimeoutHandle)
				if (msg.payload === true) {
					armed = true
					warning = false
					alert = false
					sendStatusMessageFunc()
				// Disarm
				} else if (msg.payload === false) {
					armed = false
					warning = false
					alert = false
					sendStatusMessageFunc()
				// Invalid payload
				} else {
					that.warn("W010: Arming payload invalid")
				}
			// Any other message will be monitored
			} else if (armed) {
				if (node.warningTime > 0) {
					clearTimeout(warningTimeoutHandle)
					warningTimeoutHandle = setTimeout(alertFunc, warningTime)
					warning = true
					sendStatusMessageFunc()
				} else {
					alertFunc()
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