void function () {

	var sampleObj = {}
	var _objProto = Object.prototype

	var _hasOwnProperty = _objProto.hasOwnProperty
	var _isPrototypeOf = _objProto.isPrototypeOf

	if (_isPrototypeOf === undefined) {
		_objProto.isPrototypeOf = function isPrototypeOf(object) {
			if (!isObject(object)) throw new TypeError()
			function C() {}
			C.prototype = this
			return object instanceof C
		}
	}
	if (_isPrototypeOf.call(sampleObj, sampleObj)) { // IE 8- bug
		_objProto.isPrototypeOf = function isPrototypeOf(object) {
			return _isPrototypeOf.call(this, object) && object !== this
		}
	}

	if (!Object.getPrototypeOf) {
		Object.getPrototypeOf = function getPrototypeOf(obj) {
			
			if (Object(obj) !== obj) throw new TypeError('Object.getPrototypeOf called on non-object')
			
			var p = obj.__proto__
			if (p === null) return null
			if (Object(p) === p && _objProto.isPrototypeOf.call(p, obj)) return p
			
			p = checkConstructor(obj)
			if (p) return p

			var pd = Object.getOwnPropertyDescriptor(obj, 'constructor')
			if (pd && pd.configurable) {
				delete obj.constructor
				p = checkConstructor(obj)
				Object.defineProperty(obj, 'constructor', pd)
				if (p) return p
			}

			if (obj instanceof Object) return _objProto

			return null
		}

		var checkConstructor = function (obj) {
			var ctor = obj.constructor
			if (Object(ctor) === ctor) { // IE 8+ weird: typeof Element === 'object'
				try {
					if (obj instanceof ctor) return ctor.prototype
				} catch (e) {}
			}
		}
	}

	if (!Object.getOwnPropertyNames) {
		Object.getOwnPropertyNames = function getOwnPropertyNames(obj) {
			if (Object(obj) !== obj) throw new TypeError('Object.getOwnPropertyNames called on non-object')
			var names = []
			for (var key in obj) {
				if (_hasOwnProperty.call(obj, key)) names.push(key)
			}
			return names
		}
	}

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

	if (!Object.create) {
		var props = [
			'constructor', 'valueOf', 'toString', 'toLocaleString',
			'hasOwnProperty', 'propertyIsEnumerable', 'isPrototypeOf',
		]
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
			props.forEach(function (p) { delete naked[p] })
		} catch (e) {
			naked = {}
			props.forEach(function (p) { naked[p] = undefined })
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

}()