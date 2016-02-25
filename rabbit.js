import amqp from 'amqplib';

export default ({ host, user, pass }) => {
  const open = amqp.connect(`amqp://${user}:${pass}@${host}`);

  return {
    onMessage: (queue, callback) => new Promise((resolve, reject) => {
      open
        .then(conn => {
          conn.createChannel()
            .then(ch => {
              ch.assertQueue(queue);
              ch.consume(queue, msg => {
                ch.ack(msg);
                callback(JSON.parse(msg.content.toString()));
              });
            })
            .catch(err => reject(Error(`Rabbit:Error ${err}`)));
        })
        .catch(err => reject(Error(`Rabbit:Error ${err}`)));
    }),

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
