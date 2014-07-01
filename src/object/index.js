void function () {

	var Object = {}.constructor
	var ObjectProto = Object.prototype

	var ObjectProtoPropertyNames = [
		'constructor', 'toString', 'toLocaleString', 'valueOf',
		'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	]

	var _hasOwnProperty = ObjectProto.hasOwnProperty
	var _isPrototypeOf = ObjectProto.isPrototypeOf
	var _propertyIsEnumerable = ObjectProto.propertyIsEnumerable

	shim('Object.prototype.propertyIsEnumerable', {
		desc: 'object proto properties always non-enumerable',
		env: 'IE8-, JScript5.8-',
		test: function () {
			return _propertyIsEnumerable.call({constructor: Object}, 'constructor')
		},
		fix: function () {
			var buggy = {}
			for (var i = 0, n = ObjectProtoPropertyNames.length; i < n; i++) {
				buggy[ObjectProtoPropertyNames[i]] = true
			}
			ObjectProto.propertyIsEnumerable = function propertyIsEnumerable(property) {
				return buggy[property] ?
					_hasOwnProperty.call(this, property) :
					_propertyIsEnumerable.call(this, property)
			}
		}
	})		

	bug({
		id: 'Object.prototype.isPrototypeOf',
		env: 'IE8-, JScript5.8-',
		test: function () {
			var obj = {}
			return !_isPrototypeOf.call(obj, obj)
		},
		shim: function () {
			ObjectProto.isPrototypeOf = function isPrototypeOf(object) {
				return _isPrototypeOf.call(this, object) && object !== this
			}			
		}
	})

	bug
	if (!Object.create) {
		var naked
		try {
			var iframe = document.createElement('iframe')
			iframe.src = 'javascript:'
			iframe.style.display = 'none'
			;(document.body || document.documentElement).appendChild(iframe)
			//iframe.contentWindow.document.close()
			naked = iframe.contentWindow.Object.prototype
			iframe.parentNode.removeChild(iframe);
			iframe = null
			ObjectProtoPropertyNames.forEach(function (p) { delete naked[p] })
		} catch (e) {
			naked = {}
			ObjectProtoPropertyNames.forEach(function (p) { naked[p] = undefined })
		}
		naked.__proto__ = null

		Object.create = function create(proto, pds) {
			function Ctor() {}
			Ctor.prototype = proto === null ? naked : proto
			var result = new Ctor()
			result.__proto__ = proto
			Object.defineProperties(result, pds)
			return result
		}
	}
	
	bug({
		id: 'Object.getPrototypeOf',
		test: function () {
			return !!Object.getPrototypeOf
		},
		shim: function () {
			Object.getPrototypeOf = function getPrototypeOf(obj) {
				
				if (Object(obj) !== obj) throw new TypeError('Object.getPrototypeOf called on non-object')
				
				var p = obj.__proto__
				if (p === null) return null
				if (Object(p) === p && ObjectProto.isPrototypeOf.call(p, obj)) return p
				
				p = checkConstructor(obj)
				if (p) return p

				var pd = Object.getOwnPropertyDescriptor(obj, 'constructor')
				if (pd && pd.configurable) {
					delete obj.constructor
					p = checkConstructor(obj)
					Object.defineProperty(obj, 'constructor', pd)
					if (p) return p
				}

				if (obj instanceof Object) return ObjectProto

				return null
			}

			function checkConstructor(obj) {
				var ctor = obj.constructor
				if (Object(ctor) === ctor) { // IE 8+ weird: typeof Element === 'object'
					try {
						if (obj instanceof ctor) return ctor.prototype
					} catch (e) {}
				}
			}
		}
	})

	bug({
		id: 'Object.getOwnPropertyNames',
		test: function () {
			return !!Object.getOwnPropertyNames
		},
		shim: function () {
			Object.getOwnPropertyNames = function getOwnPropertyNames(obj) {
				if (Object(obj) !== obj) throw new TypeError('Object.getOwnPropertyNames called on non-object')
				var names = []
				for (var name in obj) {
					if (_hasOwnProperty.call(obj, name)) names.push(name)
				}
				if (bug['Object.prototype.propertyIsEnumerable']) {
					for (var i = 0, n = ObjectProtoPropertyNames.length; i < n; i++) {
						var name = ObjectProtoPropertyNames[i]
						if (_hasOwnProperty.call(obj, name)) names.push(name)
					}
				}
				return names
			}
		}
	})

	bug({
		id: 'Object.getOwnPropertyDescriptor',
		test: function () {
			if (!Object.getOwnPropertyDescriptor) return 1
			else try {
				Object.getOwnPropertyDescriptor({}, '')
			} catch (e) {
				return 2
			}
			return true
		},
		shim: function () {

		}
	})
	if (!Object.getOwnPropertyDescriptor) {
		Object.getOwnPropertyDescriptor = getOwnPropertyDescriptor
	} else {
		try {
			Object.getOwnPropertyDescriptor({}, '')
		} catch (e) {
			var _getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
			Object.getOwnPropertyDescriptor = getOwnPropertyDescriptor
		}
	}

	function getOwnPropertyDescriptor(obj, name) {
		if (Object(obj) !== obj) throw new TypeError('Object.getOwnPropertyDescriptor called on non-object')
		if (!_hasOwnProperty.call(obj, name)) return undefined
		if (obj.nodeType) {
			return _getOwnPropertyDescriptor(obj, name)
		}
		return {value: obj[name], writable: true, enumerable: true, configurable: true}
	}

	if (!Object.defineProperties) {
		Object.defineProperties = defineProperties
	} else {
		try {
			Object.defineProperties({}, {})
		} catch (e) {
			var _defineProperties = Object.defineProperties
			Object.defineProperties = function (obj, pds) {
				if (obj.nodeType)
					return _defineProperties(obj, pds)
				else
					return defineProperties(obj, pds)
			}
		}
	}

	function defineProperties(obj, pds) {
		for (var key in pds) {
			if (pds.propertyIsEnumerable(key)) {
				var pd = pds[key]
				if (pd.value !== undefined) {
					obj[key] = pd.value
				}
				
				if (typeof pd.get === 'function') {
					obj.__defineGetter__(key, pd.get)
				}
				if (typeof pd.set === 'function') {
					obj.__defineSetter__(key, pd.get)
				}
			}
		}
	}


	if (!Object.defineProperty) {
		Object.defineProperty = defineProperty
	} else {
		try {
			Object.defineProperty({}, 'test', {})
		} catch (e) {
			var _defineProperty = Object.defineProperty
			Object.defineProperty = function (obj, name, pd) {
				if (obj.nodeType)
					return _defineProperty(obj, name, pd)
				else
					return defineProperty(obj, name, pd)
			}
		}
	}

	function defineProperty(obj, name, pd) {
		if (pd.value !== undefined) {
			obj[name] = pd.value
		}
		
		if (typeof pd.get === 'function') {
			obj.__defineGetter__(name, pd.get)
		}
		if (typeof pd.set === 'function') {
			obj.__defineSetter__(name, pd.get)
		}
	}

}()