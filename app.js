var ws = require("websocket.io");
var server = ws.listen(3000);

var users = [];
var rooms = [];
var moneys = [];

try{
    server.on("connection",function(socket){
        if(socket){
            socket.on("message",function(data){
                if(data){
                    handleData(data,socket);
                }else{
                    console.log("message error");
                }
            });
            socket.on("close",function(data){

            });
        }else{
            console.log("connection error");
        }
    });
}catch (e){
    console.log("connection error");
};

function handleData(data,socket){
    var datas = excuteData(data);
    switch (datas[0]){
        case 'connect':
            if(datas[1] != -1){
                var roomNum = datas[1];
                //add in the exist room
                if(rooms[roomNum] && rooms[roomNum].length < 5){
                    var user = {'id':(users.length),'pay':0,'get':0,'socket':socket};
                    rooms[roomNum].push(user.id);
                    socket.send(messageParse('connect',roomNum,user.id,'success'));

                }else if(rooms[roomNum].length >= 5) {
                    console.log("room full");
                    socket.send(messageParse('connect', roomNum, -1, 'room full'));
                }else{
                    console.log("room error");
                    socket.send(messageParse('connect',-1,-1,'room error'));
                }
            }else if(datas[1] == -1){
                //make a new room
                var roomNum = rooms.length;
                var user = {'id':(users.length),'pay':0,'get':0,'socket':socket};
                rooms[roomNum].push(user.id);
                socket.send(messageParse('connect',roomNum,user.id,'success'));
            }else{
                console.log("room error");
                socket.send(messageParse('connect',-1,-1,'room error'));
            }
            break;
        case 'pay':
            if(datas[1] && datas[2]){
                var roomNum = datas[1];
                var userId = datas[2];
                if(users[userId].pay == 0){
                    users[userId].pay = 5;
                    socket.send(messageParse('pay',roomNum,userId,'success'));
                    if(rooms[roomNum].length == 5){
                        var tempTotal = 0;
                        for(var j=0;rooms[roomNum][j];j++){
                            var user = users[rooms[roomNum][j]];
                            tempTotal += user.pay;
                        }
                        if(tempTotal == 25){
                            for(var j=0;rooms[roomNum][j];j++){
                                var user = users[rooms[roomNum][j]];
                                user.get = 1;
                                user.socket.send(messageParse('start',roomNum,user.id,'start game'));
                            }
                            moneys[roomNum] = calMoney(15);
                        }
                    }
                }else{
                    console.log("payed");
                    socket.send(messageParse('pay',roomNum,userId,'payed'));
                }
            }else{
                console.log("pay error");
                socket.send(messageParse('pay',-1,-1,'pay error'));
            }
            break;
        case 'money':
            if(datas[1] && datas[2]){
                var roomNum = datas[1];
                var userId = datas[2];
                if(users[userId].get > 0 && rooms[roomNum].indexOf(userId) > -1){
                    var getMoney = moneys[roomNum].pop();
                    socket.send(messageParse('pay',roomNum,userId,getMoney));
                }
            };
            break;
        case 'exit':
            break;
        default :
            break;
    }
}

function calMoney(num){
    var temp = [];
    var fax = 0;
    var basic = 400;
    var total = 2500 - (num * basic) - fax;
    var allNum = 0;
    for(var i = 0;i < num;i++){
        var randomMoney = Math.floor(total * Math.random());
        total -= randomMoney;
        allNum += randomMoney;
        if(i == num){
            randomMoney += (total - allNum);
        }
        temp[i] = (basic + randomMoney) / 100;
    }
    return temp;
}

function messageParse(){
    var str = '';
    var args = e.arguments;
    for(i in args){
        str += args[i] + '-|';
    }
    return str;
}

function excuteData(data){
    var strs = data.split("-|");
    return strs;
}