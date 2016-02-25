'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var amqp = require('amqplib');

exports.default = function (options) {
  if (options === undefined || options.host === undefined || options.user === undefined || options.pass === undefined) {
    throw new Error('Rabbit:Error You must define <host>, <user> and <pass> in your options');
  }

  var open = amqp.connect('amqp://' + options.user + ':' + options.pass + '@' + options.host);

  return {
    onMessage: function onMessage(queue, callback) {
      return new Promise(function (resolve, reject) {
        open.then(function (conn) {
          conn.createChannel().then(function (ch) {
            ch.assertQueue(queue);
            ch.consume(queue, function (msg) {
              ch.ack(msg);
              callback(JSON.parse(msg.content.toString()));
            });
          }).catch(function (err) {
            return reject(Error('Rabbit:Error ' + err));
          });
        }).catch(function (err) {
          return reject(Error('Rabbit:Error ' + err));
        });
      });
    },

    writeMessage: function writeMessage(queue, msg) {
      return new Promise(function (resolve, reject) {
        open.then(function (conn) {
          conn.createChannel().then(function (ch) {
            ch.assertQueue(queue);
            ch.sendToQueue(queue, new Buffer(JSON.stringify(msg)));
            resolve(true);
          }).catch(function (err) {
            return reject(Error('Rabbit:Error ' + err));
          });
        }).catch(function (err) {
          return reject(Error('Rabbit:Error ' + err));
        });
      });
    }
  };
};