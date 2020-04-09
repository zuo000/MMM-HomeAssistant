const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "HA_GET_STATES":
        this.getStates(payload);
        break;
      case "HA_POST_STATE":
        this.postState(payload);
        break;
      default:
        break;
    }
  },

  getStates: function(payload) {
    request({
      url: payload.baseUrl + "/api/states",
      headers: {
        "Authorization": "Bearer " + payload.accessToken,
        "Content-Type": "application/json"
      },
      method: 'GET'
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.length > 0) {
          this.sendSocketNotification('HA_GET_STATES_RET', result);
        }
      }
    });
  },

  postState: function(payload) {
    var url = payload.baseUrl + "/api/services/" + payload.equipType + "/turn_" + payload.state;
    var requestData = {"entity_id": payload.entityId};

    request({
      url: url,
      method: 'POST',
      json: true,
      headers: {
        "Authorization": "Bearer " + payload.accessToken,
        "content-type": "application/json"
      },
      body: requestData
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
          this.sendSocketNotification('HA_POST_STATE_RET');
      }
    });
  },

});
