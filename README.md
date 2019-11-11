# Nodebot

A drivable [Nodebot](https://nodebots.io/) built with a [Particle Photon](https://docs.particle.io/photon/) and [Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/).

The Bot is battery powered, just a Photon with two motor/wheel combos to make the rear axel, and a caster in front. The result is a cloud-connected skid-steer robot, written in javascript, that you can control with your keyboard.

The Photon recieves MQTT messages from Azure IoT Hub. A node script running locally captures keyboard input (WSAD), and forwards to Iot Hub.

Built as part of [Nodebots Day](https://nodebots.io/#nodebots-day) put on by the [Chicago Node.js Meetup](https://www.meetup.com/Chicago-Nodejs/) in 2017.
