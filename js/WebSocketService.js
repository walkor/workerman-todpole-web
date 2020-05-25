var WebSocketService = function (model, webSocket) {
    var webSocketService = this;

    var webSocket = webSocket;
    var model = model;
    var gouserList = [];

    this.hasConnection = false;

    this.welcomeHandler = function (data) {
        webSocketService.hasConnection = true;

        model.userTadpole.id = data.id;
        model.tadpoles[data.id] = model.tadpoles[-1];
        delete model.tadpoles[-1];

        $('#chat').initChat();
        if ($.cookie('todpole_name')) {
            webSocketService.sendMessage('name:' + $.cookie('todpole_name'));
        }
        if ($.cookie('todpole_sex')) {
            webSocketService.sendMessage('我是' + $.cookie('todpole_sex'));
        }
    };

    this.updateHandler = function (data) {
        var newtp = false;

        if (!model.tadpoles[data.id]) {
            newtp = true;
            model.tadpoles[data.id] = new Tadpole();
            model.arrows[data.id] = new Arrow(model.tadpoles[data.id], model.camera);
        }

        var tadpole = model.tadpoles[data.id];

        if (tadpole.id == model.userTadpole.id) {
            tadpole.name = data.name;
            return;
        } else {
            tadpole.name = data.name;
        }

        if (newtp) {
            tadpole.x = data.x;
            tadpole.y = data.y;
            vmLog.updateUsers(model.tadpoles);
        } else {
            tadpole.targetX = data.x;
            tadpole.targetY = data.y;
        }

        tadpole.angle = data.angle;
        tadpole.sex = data.sex;
        tadpole.momentum = data.momentum;

        tadpole.timeSinceLastServerUpdate = 0;
    }

    this.messageHandler = function (data) {
        var tadpole = model.tadpoles[data.id];
        if (!tadpole) {
            return;
        }
        tadpole.timeSinceLastServerUpdate = 0;
        tadpole.messages.push(new Message(data.message));
        vmLog.addLog(tadpole, {
            content: data.message,
            time: new Date(),
            x: parseInt(tadpole.x),
            y: parseInt(tadpole.y)
        });
    }

    this.closedHandler = function (data) {
        if (model.tadpoles[data.id]) {
            delete model.tadpoles[data.id];
            delete model.arrows[data.id];
            vmLog.updateUsers(model.tadpoles);
        }
    }

    this.redirectHandler = function (data) {
        if (data.url) {
            if (authWindow) {
                authWindow.document.location = data.url;
            } else {
                document.location = data.url;
            }
        }
    }

    this.processMessage = function (data) {
        var fn = webSocketService[data.type + 'Handler'];
        if (fn) {
            fn(data);
        }
    }

    this.connectionClosed = function () {
        webSocketService.hasConnection = false;
        $('#cant-connect').fadeIn(300);
    };

    this.sendUpdate = function (tadpole) {
        var sendObj = {
            type: 'update',
            x: tadpole.x.toFixed(1),
            y: tadpole.y.toFixed(1),
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            sex: tadpole.sex
        };

        if (tadpole.name) {
            sendObj['name'] = tadpole.name;
        }

        webSocket.send(JSON.stringify(sendObj));
    }

    this.sendMessage = function (msg) {
        let regexp = /^(name[:：;；]|我叫)(.+)/i;
        if (regexp.test(msg)) {
            model.userTadpole.name = msg.match(regexp)[2];
            $.cookie('todpole_name', model.userTadpole.name, {
                expires: 14
            });
            return;
        }

        regexp = /^(我是|sex)(男生|女生|0|1|男|女)/;
        if (regexp.test(msg)) {
            let sex = msg.match(regexp)[2];
            if (sex === "女生" || sex === '0') {
                model.userTadpole.sex = 0;
            } else if (sex === "男生" || sex === '1') {
                model.userTadpole.sex = 1;
            } else {
                model.userTadpole.sex = -1;
            }
            $.cookie('todpole_sex', model.userTadpole.sex, {
                expires: 14
            });
            return;
        }

        regexp = /^跟随?(.+)/i;
        if (regexp.test(msg)) {

            let _this = this;
            let gouserByname = msg.match(regexp)[1];
            console.log(gouserByname);

            var gousergo = setInterval(function () {

                var gouser = queryByName(gouserByname);
                let xx = /x: ?(.+)y/i;
                let yy = /y: ?(.+)/i;
                // console.log(gouser+"-"+xx+"-"+yy);
                if (gouser != null) {
                    model.userTadpole.x = parseFloat(gouser.match(xx)[1] - 12);
                    model.userTadpole.y = parseFloat(gouser.match(yy)[1] - 12);
                    _this.sendUpdate(model.userTadpole);
                } else {
                    clearInterval(gousergo);
                    app.sendMessage("他跑了！！");
                }

                gouserList.push(gousergo);
                // console.log(gouserList);

            }, 10);

            return;
        }

        regexp = /^(停止|stop)(挂机|跟随)/;
        if (regexp.test(msg)) {

            let gouserByname = msg.match(regexp)[2];
            // console.log(gouserByname);
            if (gouserByname == "挂机" || gouserByname == "跟随") {
                // console.log(gouserList);
                gouserList.forEach((item, index) => {
                    clearInterval(item);
                })
                gouserList = [];
                gousergo = 0;
                return;

            }
        }

        regexp = /^-?(\d+)[,，]-?(\d+)$/i;
        if (regexp.test(msg)) {
            let pos = msg.match(regexp);
            // console.log(pos)
            app.deliveryTo(pos[1], pos[2]);
            return;
        }

        regexp = /^速度(\d+)$/i;
        if (regexp.test(msg)) {
            let num = msg.match(regexp);
            let speed = parseInt(num[1]) > 0 ? parseInt(num[1]) : 1;
            app.speed(speed);
        }

        regexp = /^flicker$/;
        if (regexp.test(msg)) {
            let _this = this;
            let interval = setInterval(function () {
                model.userTadpole.sex = model.userTadpole.sex ^ 1;
                $.cookie('todpole_sex', model.userTadpole.sex, {
                    expires: 14
                });
                _this.sendUpdate(model.userTadpole);
            }, 500);
            setTimeout(function () {
                clearInterval(interval);
            }, 60000);
            return;
        }

        var sendObj = {
            type: 'message',
            message: msg
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    this.authorize = function (token, verifier) {
        var sendObj = {
            type: 'authorize',
            token: token,
            verifier: verifier
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    var queryByName = function (name) {
        var x;
        var y;
        var userid = JSON.stringify(model.tadpoles);
        userid = JSON.parse(userid);

        for (var j in userid) {

            if (userid[j].name == name || j == name) {
                x = userid[j].x;
                y = userid[j].y;

                return "x:" + x + "y:" + y;
            }
        }

        return null;
    }
}
