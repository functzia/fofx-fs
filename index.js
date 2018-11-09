const fs = require('fs');
const path = require('path');
const format = require('string-template');
const { createMonitor } = require('watch');

module.exports = function fsPlugin(_options, log) {
  return {
    type: 'fs',
    input({ root, encoding = null }, execute) {
      createMonitor(root, monitor => {
        monitor.on('created', name =>
          fs.readFile(name, { encoding }, (err, content) => {
            if (err) {
              return log.error(err);
            }
            return execute(
              typeof content === 'string' ? content : content.toJSON()
            );
          })
        );
      });
    },
    output({ root, template }) {
      return value => {
        switch (typeof value) {
          case 'string': {
            break;
          }
          case 'object': {
            if (value && value.type === 'Buffer') {
              value = Buffer.from(value);
              break;
            }
          }
          default: {
            value = JSON.stringify(value);
          }
        }
        const filename = format(template, { ts: Date.now() });
        fs.writeFile(path.join(root, filename), value, err => {
          if (err) {
            log.error(err);
          }
        });
      };
    },
  };
};
