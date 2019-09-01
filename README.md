# MMM-HomeAssistant
HomeAssistant module for MagicMirror2

## Installation

1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/zuo000/MMM-HomeAssistant.git`.
2. Enter the new `MMM-HomeAssistant` directory and execute `npm install`.

## Configuration

```
{
  module: "MMM-HomeAssistant",
  position: "middle_center",
  config: {
    host: "YOUR_HA_IP or DOMAIN",
    port: 8123, // your HA port, 8123 by default.
    apiPassword: "SUPER SECRET!!!",
    updateInterval: 5*1000
  }
},
```
## The MIT License (MIT)
