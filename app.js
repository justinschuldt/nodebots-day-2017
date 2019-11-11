'use-strict';

require('dotenv').config()

var moment = require('moment');
var five = require("johnny-five");
var Particle = require("particle-io")
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var deviceId = 'nodebot';


var board = new five.Board({
  io: new Particle({
    token: process.env.PARTICLE_TOKEN,
    deviceId: deviceId
  })
});


var connectionString = process.env.DRIVER_AZURE_CONNECTION_STRING
var client = Client.fromConnectionString(connectionString, Protocol);
var currentaction = "offline";


board.on('ready', function () {
    letsPlay();
    var connectCallback = function (err) {
        if (err) {
            console.error('Could not connect: ' + err.message);
        } else {
            console.log('Client connected');

            client.on('error', function (err) {
                console.error(err.message);
            });

            client.on('disconnect', function () {
                // clearInterval(sendInterval);
                console.log('disconnected');
                client.removeAllListeners();
                client.open(connectCallback);
            });
        }
    };

    client.open(connectCallback);
});




function letsPlay() {
    
     ////////////////////////////////////////////////////////////////

    // Johnny-Five code here!

    ///////////////////////////////////////////////////////////////

  var rightWheel = new five.Motor({
    pins: { pwm: "D0", dir: "D4" },
    invertPWM: true
  });

  var leftWheel = new five.Motor({
    pins: { pwm: "D1", dir: "D5" },
    invertPWM: true
  });

    var button = new five.Button('D6');

    var servo = new five.Servo('D2');
    var servo1 = new five.Servo('D3');

    board.repl.inject({
        button: button,
        servo: servo,
        servo1: servo
    });

    // "down" the button is pressed
    button.on("down", function () {
        console.log("down");
        board.digitalWrite('D2', 1)
        buzzer = 1;
    });


    // "up" the button is released
    button.on("up", function () {
        console.log("up");
        board.digitalWrite('D2', 0)       
    });

    function forward() {
        leftWheel.fwd(linearSpeed);
        rightWheel.fwd(linearSpeed);
        currentaction = "fd";
        console.log("Forward!");
    }
    function stop() {
        leftWheel.rev(0); // This makes the car stop.
        rightWheel.rev(0);
        currentaction = "stopped";
        console.log("Stop!");
    }
    function left() {
        leftWheel.rev(turnSpeed);
        rightWheel.fwd(turnSpeed);
        currentaction = "lt";
        console.log("Left!");
    }
    function right() {
        leftWheel.fwd(turnSpeed);
        rightWheel.rev(turnSpeed);
        currentaction = "rt";
        console.log("Right!");
    }
    function reverse() {
        leftWheel.rev(linearSpeed);
        rightWheel.rev(linearSpeed);
        currentaction = "bk";
        console.log("Back!");
    }
    function exit() {
        currentaction = "offline";
        setTimeout(process.exit, 1000);
    }

    function up() {
        servo.to(35);
        servo1.to(35);
    }
    function down() {
        servo.to(15);
        servo1.to(15);
    }
    function zero() {
        servo.to(0);
        servo1.to(0);
    }

    // This is the code for controlling car actions from the command line
    var keyMap = {
        'w': forward,
        'a': left,
        'd': right,
        's': reverse,
        'space': stop,
        'up': up,
        'down': down,
        'o': zero,
        'q': exit
    };

    var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", function (chunk, key) {
        if (!key || !keyMap[key.name]) return;
        actionSender();
        keyMap[key.name]();
    });


    var scalar = 256; // Friction coefficient
    var actioncounter = 0;
    var newcommand = "home()";
    var linearSpeed = 255;
    var turnSpeed = 160;
    var buzzer ;



    function actionSender() {
        var distance = 0;
        Math.round(actioncounter);
        if (currentaction == "fd" || currentaction == "bk") {
            var a = (moment.now() - actioncounter) * 0.18 * linearSpeed / scalar;
            newcommand = "" + currentaction + "(" + a + ")";
            distance = a;
        }
        else if (currentaction == "rt" || currentaction == "lt") {
            var a = (moment.now() - actioncounter) * 0.18 * turnSpeed / scalar;
            newcommand = "" + currentaction + "(" + a + ")";
            distance = 0;
        }
        else if (currentaction == "home") {
            newcommand = "home()";
            distance = 0;
        }
        else {
            newcommand = "fd(0)";
            distance = 0;
        };
        
        distance = distance.toString();
        var data = JSON.stringify({ deviceId: deviceId, buzzer: buzzer , distance: distance });
        var message = new Message(data);
        console.log('Sending message: ' + message.getData());
        client.sendEvent(message, printResultFor('send'));
        actioncounter = moment.now();
        buzzer = 0;
    }
}
    
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}
