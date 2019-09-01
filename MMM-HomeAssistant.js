Module.register("MMM-HomeAssistant", {
  defaults: {
    host: "",
    port: 8123,
    apiPassword: "",
    updateInterval: 5*1000,
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
    this.stateTimer = setInterval(() => {
      this.getStates();
    }, this.config.updateInterval);
    this.getStates();
  },

  getStates: function() {
    this.sendSocketNotification('HA_GET_STATES', {
      baseUrl: this.url,
      apiPassword: this.config.apiPassword,
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

    for (let equip of this.equipData) {
      if (equip.entity_id.startsWith("light.")) {
        console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
        var group = this.makeLightGroup(equip.entity_id, equip.attributes.friendly_name, equip.state);
        wrapper.appendChild(group);
      }
    }

    for (let equip of this.equipData) {
      if (equip.entity_id.startsWith("switch.")) {
        console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
        var group = this.makeSwitchGroup(equip.entity_id, equip.attributes.friendly_name, equip.state);
        wrapper.appendChild(group);
      }
    }

    for (let equip of this.equipData) {
      if (equip.entity_id.startsWith("binary_sensor.")) {
        console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
        var group = this.makeBinarySensorGroup(equip);
        wrapper.appendChild(group);
      }
    }

    for (let equip of this.equipData) {
      if (equip.entity_id.startsWith("sensor.")) {
        console.log(this.name + " get equipment:" + equip.attributes.friendly_name + ", id: ", equip.entity_id);
        var group = this.makeSensorGroup(equip);
        wrapper.appendChild(group);
      }
    }

    return wrapper;
  },

  postState: function(entityId, equipType, state) {
    this.sendSocketNotification('HA_POST_STATE', {
      baseUrl: this.url,
      apiPassword: this.config.apiPassword,
      entityId: entityId,
      equipType: equipType,
      state: state
      });
  },

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

    stateText.innerText= hourStr + ":" + minuteStr + "\n" + state;
    group.appendChild(stateText);
    /*
    /*<div>
        <div class="group">
          <div class="text">
          name
          </div >
          <div class="sensor_state_text" >
          state
          </label>
        </div>
      </div>*/
    return group;
  },

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
    var stateInt = equip.state.substring(0, equip.state.indexOf("."));
    stateText.innerText= stateInt + " " + equip.attributes.unit_of_measurement;
    group.appendChild(stateText);
    /*
    /*<div>
        <div class="group">
          <div class="text">
          name
          </div >
          <div class="sensor_state_text" >
          state
          </label>
        </div>
      </div>*/
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

    var text = document.createElement("div");
    text.className = "text";
    text.innerText= name;
    group.appendChild(text);

    var button = document.createElement("label");
    button.className = "switch";

    var input = document.createElement("input");
    input.id = "cb";
    input.setAttribute("type", "checkbox");
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
    button.appendChild(input);

    var round = document.createElement("div");
    round.className = "slider round";
    button.appendChild(round);

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
