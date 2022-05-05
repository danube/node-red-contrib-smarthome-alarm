Secure your smart home with this monitoring node. It monitors signals and triggers the output on unexpected events.

# Input
## Arming and disarming
You must send a message with a defined topic and payload. The **topic** can be freely configured in the node settings. If unconfigured, "activate" is expected. The **payload** must be boolean `true` to arm or `false` to disarm.
## Signals to monitor
Basically, you can connect everything on the input. As soon as the node receives any message (no matter if and what topic or message it contains, really every message counts), the timer starts and warning will be sent in the output object. If timeout is set to zero, error will be immediately set.

# Configuration
## Name
If unset, the node shows "Monitor". If you give any value here, the node will be shown with this string.
## Arming topic
A defined message arms or disarms the node. The message must contain a boolean `true` or `false` to arm or disarm and must contain a defined topic. If this field is left blank, the topic must be "activate".
## Warning time
When armed, the node watches out for any message on the input. If a message appears, a warning will be sent inside the output message but the alarm is still false, until the warning time has been reached. That's the time when you open a window but have not disarmed the node until the siren shouts.
## Allow msg.timeout to verwrite
Together with the TBC
## Debug

# Node status

# Warning and error codes
Warnings and errors will be sent both to the integrated Node-RED debugger and the terminal, so it may be a good idea to have focus to at least one of them. If a warning or an error happens, it will be sent to there with a leading identifier. This starts either with "W" for warnings or "E" for errors. Example: "E007: Invalid James Bond detected, replace!" for an error. Here's the list of codes supported by this individual node:
| Identifier | Description |
| - | - |
| E010 | Warning time unit invalid. In your node configuration, you have to set a timeout value (or use "0" to disable) together with a unit (Seconds, Minutes, Hours). As this unit has to be set from a dropdown, there should not be a way the node receives anything else than one of these. Anyways, the unit will be checked and if, for some weird reason, it is not one of those selectable, you will see this error. Get in touch with the developer to get that fixed.