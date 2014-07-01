test('Object.prototype.hasOwnProperty', function () {
	
	var o = {x: 1}
	assert(o.hasOwnProperty('x'))

	function A() { this.ownProp = 1 }
	A.prototype.protoProp = 2
	var a = new A()

	assert(a.hasOwnProperty('ownProp'))
	assert(!a.hasOwnProperty('protoProp'))

})

test('Object.prototype.isPrototypeOf', function () {

	function A() {}
	function B() {}
	B.prototype = new A()

	var a = new A()
	var b = new B()

	assert(!B.prototype.isPrototypeOf(a))
	assert(A.prototype.isPrototypeOf(a))
	assert(Object.prototype.isPrototypeOf(a))

	assert(B.prototype.isPrototypeOf(b))
	assert(A.prototype.isPrototypeOf(b))
	assert(Object.prototype.isPrototypeOf(b))

})