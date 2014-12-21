
main.utility = (function() {
	var bShowFramecounter = false;

	// DEFINE CLASS	///////////////////////////////////////
	function defineClass(data) {
		// estraiamo alcune informazioni 
		// dall'oggetto passato come argomento
		var extend = data.extend;
		var superclass = extend || Object;
		var init = data.init;
		var classname = data.name || "Unnamed class";
		var methods = data.methods || {};
		var statics = data.statics || {};
		
		// creo un costruttore che si concatena al costruttore 
		// della eventuale superclasse e poi chiama il metodo
		// di inizializzazione per questa classe. Questo costruttore
		// sarà il valore di ritorno di questa funzione "defineClass()"
		var constructor = function() {
			if(extend) extend.apply(this, arguments);
			if(init)   init.apply(this, arguments);
		};
		
		// copio le proprieta' STATICHE nella funzione constructor
		if(data.statics) {
			// per ogni proprietà dell'oggetto statics 
			for(var p in statics) {
				constructor[p] = data.statics[p];
			}
		}
		
		// settiamo le proprietà "superclass" e "classname" per il costruttore
		constructor.superclass = superclass;
		constructor.classname = classname;
		
		// creiamo l'oggetto che poi sarà il prototipo per la classe;
		// Questo nuovo oggetto deve ereditare dal prototipo della superclasse
		var proto = (superclass == Object) ? {} : main.heir(superclass.prototype);
		
		// copiamo i metodi di istanza e altre proprietà nell'oggetto prototype
		for(var p in methods) {
			//if(p == "toString") continue; // si dovrebbe gestire a parte per via di un bug di IE
			var m = methods[p];
			if(typeof m == "function") {
				m.overrides = proto[p];
				m.name = p;
				m.owner = constructor;
			}
			proto[p] = m;
		}
		
		// tutti gli oggetti devono conoscere quale sia il loro construttore
		proto.constructor = constructor;
		
		// il costruttore, d'altra parte, deve invece conoscere quale sia il proprio "prototype"
		constructor.prototype = proto;
				
		// alla fine si ritorna la funzione constructor
		return constructor;		
	}

	// HEIR ///////////////////////////////////////////////
	function heir(p) {
		function h() {}
		h.prototype = p;
		return new h();
	}
	
	// CHAIN //////////////////////////////////////////////
	// invocazione tipica: chain(this, arguments)
	// invocazione con argomenti aggiuntivi chain(this, arguments, [w, h])
	function chain(o, args, pass) {
		var f = args.callee; // la funziona chiamante
		var g = f.overrides; // la funziona alla quale si concatena
		var a = pass || args; // gli argomenti da passare a 'g'
		if(g) return g.apply(o, a); // chiamiamo o.g(a) e ritorniamo i uoi valori come fossero i nostri
		else throw "ChainError";
	}
	
	
	// CHAIN //////////////////////////////////////////////
	function int(value) {
		// come il casting a int che avviene in Processing
		if(value >= 0)
			return Math.floor( value );
		return Math.ceil( value );
	}
	
	// INTERPOLAZIONE /////////////////////////////////////////////////
	// calcolo il valore interpolato che si trova tra 'value1' e 'value2'
	// e è un proporzione come 'amt_' rispetto a 1
	function linearInterpolation(amt_, value1, value2) {
		// dato il paramentro amt_ (che varia tra 0 e 1)
	    // ritorno il corrispondente valore interpolato tra 
	    // i parametri value1 e value2
	    return value1 + amt_*(value2 - value1); // (float)
	}
	
	
	/*
	// al posto di trunc si può usare la funzione toFixed() della classe Number()
	function trunc(value, precision) {
		var prec = Math.pow(10, precision);
		return ( Math.round(value * prec) ) / prec;
	}
	*/

	return {
		defineClass : defineClass,
		chain : chain,
		int : int,
		linearInterpolation : linearInterpolation
	};
	
})();
	
	