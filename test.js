const test = require('tape');
const toRx = require('./readme');

test('it converts a listenable source to an RxJS Observable', async function (t) {
  t.plan(6);
  const upwardsExpected = [
    [0, 'function']
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.deepEquals([type, typeof data], e, 'upwards is expected: ' + e);
      if (type === 0) {
        const sink = data;
        const id = setInterval(() => {
          if (sent === 0) {
            sent++;
            sink(1, 10);
            return;
          }
          if (sent === 1) {
            sent++;
            sink(1, 20);
            return;
          }
          if (sent === 2) {
            sent++;
            sink(1, 30);
            return;
          }
          if (sent === 3) {
            sink(2);
            clearInterval(id);
            return;
          }
        }, 100);
        sink(0, source);
      }
    };
    return source;
  }

  const source = makeSource();
  const observable = toRx(source);

  observable.subscribe({
    next: x => {
      const e = downwardsExpected.shift();
      t.equals(x, e, 'downwards is expected: ' + e);
    },
    error: e => {
      t.fail('error should not be called');
    },
    complete: () => {
      t.pass('complete is called');
    }
  });

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});

