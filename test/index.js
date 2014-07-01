var test = require('tape')

test('Date.now', function (t) {

	t.plan(1)

	t.equal(typeof Date.now, 'function')

})