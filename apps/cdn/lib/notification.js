var ajax = require('ajax');
var bind = require('bind');
var template = require('./notification-template');


/**
 * Initialize a new `Notification` instance.
 */

function Notification() {
    this.notification_url = 'TODO';
    this.notification_template_id = 'uj_notification';
    this.userId = null;
}


Notification.prototype.load = function (userId) {

    var self = this;


    self.userId = userId;

    self.fetch(function (err, notf) {
        function create(htmlStr) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        }

        var locals = {
            msg: 'This is the message to be shown to the user',
            notification_template_id: self.notification_template_id
        };

        var fragment = create(template(locals));



        // You can use native DOM methods to insert the fragment:
        document.body.insertBefore(fragment, document.body.childNodes[0]);
    });

};

Notification.prototype.fetch = function (cb) {
    // FIXME
    var dummy = {
        userId: this.userId,
        body: 'gjghjgjhg'
    };


    return cb(null, dummy);
}


Notification.prototype.show = function () {
    ajax({
        type: 'GET',
        url: 'api.do.localhost/track/notifications',
        success: function (data) {
            console.log("success: ", data);
        },
        error: function () {
            console.log("error");
        }
    })
};


Notification.prototype.hide = function () {
    document.getElementById(this.notification_template_id)
        .style.display = 'none';
};


Notification.prototype.reply = function () {
    // var xhReq = new XMLHttpRequest();
    // xhReq.onreadystatechange = function () {

    // }
    var data = {
        reply: document.getElementById('reply')
            .value
    }
    console.log("data: ", data);
    ajax({
        type: "POST",
        url: '/apps/aid/notification/uid',
        data: data,
        success: function () {
            document.getElementById('msgsent')
            .style.display = 'block';
        document.getElementById('reply')
            .value = '';
        },
        error: function () {
            console.log("error");
        },
        dataType: 'json'
    });
    // var request = new XMLHttpRequest();
    // url = '';
    // request.open("POST", 'url', true);
    // request.send(document.getElementById('reply').value);
    // console.log("request: ", request);
    // console.log("readyState: ", request.readyState, request.status);
    // request.onreadystatechange = function () {
    //     console.log("inside onreadystatechange");
    //     // request.setRequestHeader("Content-Type", "application/json");
    //     if (request.readyState != 4 || request.status != 200) {
    //         console.log("error");
    //         return;
    //     };
    //     console.log("Success: " + request.responseText);
    //     document.getElementById('msgsent')
    //         .style.display = 'block';
    //     document.getElementById('reply')
    //         .value = '';
    // }
    // r.open("POST", "/userjoy/:aid/notification/:uid", true);
    // r.onreadystatechange = function () {
    // };
    // xhReq.open("GET", "sumGet.phtml?figure1=5&figure2=10", true);
    // xhReq.send(null);
    // var serverResponse = xhReq.responseText;
    // console.log(serverResponse);

};


/**
 * Expose `Notification` instance.
 */

module.exports = bind.all(new Notification());