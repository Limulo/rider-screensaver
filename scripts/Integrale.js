main.Integrale = main.utility.defineClass({
	name : "Integrale",
	init : function() {
		if(main.bDebug) console.log("## INTEGRALE COSTRUTTORE ##");
		this.cumulativo = 0.0; // (float)
		//INTEGRALE INIT ////////////////////////////////////////////////////
		if(main.bDebug) console.log("## INTEGRALE INIT ##");
		// do nothing
	},
	methods : {
		// INTEGRALE INTEGRA /////////////////////////////////////////////////
		integra : function(value) {
			// se il valore in ingresso è molto piccolo (minore di 1) allora, 
		    // tengo in memoria l'integrale di tutte le sue somme successive
		    // lo butto fuori come risultato solo quando le sue somme successive
		    // hanno superato il valore di 1
			var result = 0.0;
		    // print(value);
		    if( Math.abs( value ) < 1) {
		    	// print(" ---> integro:");
		    	this.cumulativo += value;
		    	// println(" parziale: "+cumulativo);
		    	if( Math.abs(this.cumulativo) > 1.0) {
		    		// println("    valore assoluto di parziale > 1");
		    		result = this.cumulativo;
		    		if( this.cumulativo > 0)
		    			this.cumulativo -= 1;
		    		else
		    			this.cumulativo += 1;
		    		// println("    result: "+result+"; in cumulativo conservo il valore: "+cumulativo);
		    		return main.utility.int( result );
		    	}
		    }
		    // ritorno direttamente il valore se questo è 
		    // maggiore di 1
		    return main.utility.int( value );
		}		
	}
	
});