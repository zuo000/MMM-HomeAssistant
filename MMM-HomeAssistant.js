Module.register("MMM-HomeAssistant", {
  defaults: {
    host: "",
    port: 8123,
    accessToken: "",
    updateInterval: 5*1000,
    entities: [],
  },

  getStyles: function() {
    return ["MMM-HomeAssistant.css"];
  },

	getTranslations: function() {
    return {
      'zh': 'translations/zh.json'
    };
	},

  start: function() {
    console.log("Starting module: " + this.name);

    this.url = "http://" + this.config.host + ":" + this.config.port.toString();
    this.equipData = null;
    this.loaded = false;
    this.whitelist = this.config.entities;
    this.stateTimer = setInterval(() => {
      this.getStates();
    }, this.config.updateInterval);
    this.getStates();
  },

  getStates: function() {
    this.sendSocketNotification('HA_GET_STATES', {
      baseUrl: this.url,
      accessToken: this.config.accessToken,
      });
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "HA_GET_STATES_RET":
        this.processStates(payload);
        this.updateDom();
        break;
      case "HA_POST_STATE_RET":
        break;
      default:
        break;
    }
  },

  processStates: function(data) {
    this.loaded = true;
    this.equipData = data;
  },

  getDom: function() {
    if (this.suspended == true) {
      return document.createElement("div");
    }
    if (!this.loaded) {
      var loading = document.createElement("div");
      loading.innerHTML = "Hello, HomeAssistant is loading...";
      loading.className = "normal regular medium";
      return loading;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper"
    if (this.whitelist.length !== 0){
    	for (let item of this.whitelist){
	  var res = this.equipData.find(element => element.entity_id == item);
	  if (res){
    	  	console.log(this.name + " get equipment:" + res.attributes.friendly_name + ", id: ", res.entity_id);
		switch(item.split('.')[0]){
		  case "light":
    	  	    var group = this.makeLightGroup(res.entity_id, res.attributes.friendly_name, res.state);
		    break;
		  case "switch":
    	  	    var group = this.makeSwitchGroup(res.entity_id, res.attributes.friendly_name, res.state);
		    break;
		  case "sensor":
    	  	    var group = this.makeSensorGroup(res);
		    break;
		  case "binary":
     	  	    var group = this.makeBinarySensorGroup(res);
		    break;
		  default:
		    console.log("no category found: " + item);
		  break;
		}
	       if (group){	
    	         wrapper.appendChild(group);
	       }
	  }
	}
    } else {
    	for (let res of this.equipData) {
	switch(res.entity_id.split('.')[0]){
	  case "light":
    	    var group = this.makeLightGroup(res.entity_id, res.attributes.friendly_name, res.state);
	    break;
	  case "switch":
    	    var group = this.makeSwitchGroup(res.entity_id, res.attributes.friendly_name, res.state);
	    break;
	  case "sensor":
    	    var group = this.makeSensorGroup(res);
	    break;
	  case "binary":
     	    var group = this.makeBinarySensorGroup(res);
	    break;
	  default:
	    console.log("no category found: " + res.entity_id);
	  break;
	}
	if (group){wrapper.appendChild(group);}
	}
    }

    // for (let equip of this.equipData) {
    // 	if (this.whitelist.indexOf(equip.entity_id) !== -1 || this.whitelist.length == 0){
    // 	  	if (equip.entity_id.startsWith("light.")) {
    // 	  	  console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
    // 	  	  var group = this.makeLightGroup(equip.entity_id, equip.attributes.friendly_name, equip.state);
    // 	  	  wrapper.appendChild(group);
    // 	  	}
    // 	  	if (equip.entity_id.startsWith("switch.")) {
    // 	  	  console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
    // 	  	  var group = this.makeSwitchGroup(equip.entity_id, equip.attributes.friendly_name, equip.state);
    // 	  	  wrapper.appendChild(group);
    // 	  	}
    // 	   	if (equip.entity_id.startsWith("sensor.")) {
    // 	   	  console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
    // 	   	  var group = this.makeSensorGroup(equip);
    // 	   	  wrapper.appendChild(group);
    // 	   	}
    //     	if (equip.entity_id.startsWith("binary_sensor.")) {
    //     	  console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
    //  	          var group = this.makeBinarySensorGroup(equip);
    //  	          wrapper.appendChild(group);
    //  	        }
    // 	}
    // }

   //  for (let equip of this.equipData) {
   //  }

   //  for (let equip of this.equipData) {
   //  }

    return wrapper;
  },

  postState: function(entityId, equipType, state) {
    this.sendSocketNotification('HA_POST_STATE', {
      baseUrl: this.url,
      accessToken: this.config.accessToken,
      entityId: entityId,
      equipType: equipType,
      state: state
      });
	console.log(entityId, equipType, state);
  },

  //gate, motion sensor
  makeBinarySensorGroup: function(equip) {
    var self = this;
    var group = document.createElement("div");
    group.className = "group"

    var text = document.createElement("div");
    text.className = "text";
    text.innerText= equip.attributes.friendly_name;
    group.appendChild(text);


    var stateText = document.createElement("div");
    stateText.className = "binary_sensor_state_text";

    var dattt = new Date(equip.last_changed);
    var hourStr = dattt.getHours() > 9 ? dattt.getHours() : "0" + dattt.getHours();
    var minuteStr = dattt.getMinutes() > 9 ? dattt.getMinutes() : "0" + dattt.getMinutes();

    var state = "";
    switch (equip.attributes.device_class) {
      case "opening":
        state = this.translate(equip.state);
        break;
      case "motion":
        state = this.translate("someone moving");
        break;
      default:
        break;
    }

    stateText.innerText= (dattt.getMonth() + 1).toString() + "/" + dattt.getDate() + " " + hourStr + ":" + minuteStr + "\n" + state;
    group.appendChild(stateText);
    return group;
  },

  //light sensor
  makeSensorGroup: function(equip) {
    var self = this;
    var group = document.createElement("div");
    group.className = "group"

    var text = document.createElement("div");
    text.className = "text";
    text.innerText= equip.attributes.friendly_name;
    group.appendChild(text);


    var stateText = document.createElement("div");
    stateText.className = "sensor_state_text";
    var stateInt = equip.state;
    if (equip.state.indexOf(".") > 0) {
     stateInt = equip.state.substring(0, equip.state.indexOf("."));
    }
    stateText.innerText= stateInt + " " + equip.attributes.unit_of_measurement;
    group.appendChild(stateText);
    return group;
  },

  makeSwitchGroup: function(entityId, name, state) {
    return this.makeLightSwitchGroup(entityId, name, state, "switch");
  },
  makeLightGroup: function(entityId, name, state) {
    return this.makeLightSwitchGroup(entityId, name, state, "light");
  },

  makeLightSwitchGroup: function(entityId, name, state, type) {
    var self = this;
    var group = document.createElement("div");
    group.className = "group"

    var button = document.createElement("label");
    button.className = "switch";
    button.setAttribute("for", entityId.replace(".","-").replace("_","-"));

    var text = document.createElement("div");
    text.className = "switchtext";
    text.innerText = name;
    button.appendChild(text);

    var input = document.createElement("input");
    input.id = entityId.replace(".","-").replace("_","-");
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", entityId.replace(".","-").replace("_","-"));
    if (state == "on") {
      input.checked = true;
    }
    else {
      input.checked = false;
    }

    input.addEventListener('click', function() {
          console.log(self.name + "onclick");
          if (input.checked == true) {
            self.postState(entityId, type, "on");
          }
          else {
            self.postState(entityId, type, "off");
          }
      });
    group.appendChild(input);
    group.appendChild(button);
    /*
    /*<div>
        <div class="group">
          <div class="text">
          name
          </div >
          <label class="switch" >
            <input type="checkbox" id="cb"/>
            <div class="slider round"></div>
          </label>
        </div>
      </div>*/
    return group;
  },
});
