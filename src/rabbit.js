const amqp = require('amqplib');

export default (options) => {
  if (
    options === undefined
    || options.host === undefined
    || options.user === undefined
    || options.pass === undefined
  ) {
    throw new Error('Rabbit:Error You must define <host>, <user> and <pass> in your options');
  }

  const open = amqp.connect(`amqp://${options.user}:${options.pass}@${options.host}`);

  return {
    onMessage: (queue, callback) => {
      open
        .then(conn => {
          conn.createChannel()
            .then(ch => {
              ch.assertQueue(queue);
              ch.consume(queue, msg => {
                ch.ack(msg);
                callback(false, JSON.parse(msg.content.toString()));
              });
            })
            .catch(err => callback(Error(`Rabbit:Error ${err}`), null));
        })
        .catch(err => callback(Error(`Rabbit:Error ${err}`), null));
    },

    writeMessage: (queue, msg) => new Promise((resolve, reject) => {
      open
        .then(conn => {
          conn.createChannel()
            .then(ch => {
              ch.assertQueue(queue);
              ch.sendToQueue(queue, new Buffer(JSON.stringify(msg)));
              resolve(true);
            })
            .catch(err => reject(Error(`Rabbit:Error ${err}`)));
        })
        .catch(err => reject(Error(`Rabbit:Error ${err}`)));
    })
  };
};
