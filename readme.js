/**
 * callbag-to-rxjs
 * ---------------
 *
 * Convert a listenable callbag source to an RxJS Observable.
 *
 * `npm install callbag-to-rxjs`
 *
 * Example:
 *
 *     const {pipe, interval, take, filter, map} = require('callbag-basics');
 *     const toRx = require('callbag-to-rxjs');
 *     require('rxjs/add/operator/startWith');
 *
 *     const observable = pipe(
 *       interval(1000), // 0,1,2,3,4,5,6,7,...
 *       take(5), // 0,1,2,3,4
 *       filter(x => x !== 0), // 1,2,3,4
 *       map(x => x * 10), // 10,20,30,40
 *       toRx
 *     );
 *
 *     observable.startWith(0).subscribe({
 *       next: x => console.log(x)
 *     });
 */

const {Observable} = require('rxjs/Observable');

function toRx(source) {
  return Observable.create(function subscribe(observer) {
    let talkback;
    try {
      source(0, (t, d) => {
        if (t === 0) talkback = d;
        if (t === 1) observer.next(d);
        if (t === 2 && d) observer.error(d);
        else if (t === 2) talkback = void 0, observer.complete(d);
      });
    } catch (err) {
      observer.error(err);
    }
    return function unsubscribe() {
      if (talkback) talkback(2);
    };
  });
}

module.exports = toRx;
