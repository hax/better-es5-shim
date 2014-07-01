if (_isPrototypeOf === undefined) {
	_objProto.isPrototypeOf = function isPrototypeOf(object) {
		if (!isObject(object)) throw new TypeError()
		function C() {}
		C.prototype = this
		return object instanceof C
	}
}
