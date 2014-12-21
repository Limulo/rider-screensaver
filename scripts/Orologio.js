main.Orologio = main.utility.defineClass({
	name : "Orologio",
	init : function() {
		if(main.bDebug) console.log("## OROLOGIO COSTRUTTORE ##");
		// classe per gestire l'orario - misurato in secondi, minuti e ore.
		// Il tempo può scorrere in avanti o indietro nell'arco delle 24 ore.
		// La parte grafica realizza una animazione di un quadrante con lancette
		// per visualizzare velocemente il passare del tempo.
		// E' possibile ottenere in uscita un valore normalizzato che rappresenta
		// l'orario corrente. Se il tempo si muove in avanti, il valore in uscita
		// cresce da 0 a 1 mano a mano che il tempo scorre dalle 00:00 alle 24:00.
		// Se il tempo che scorre all'indietro, il valore in uscita si muoverà
		// da 1 a 0 mentre le lancette segneranno orari dalle 24:00 alle 00:00 .
		  
		// LOGICA ***********************************************************
		this.integrale1;
		this.actualTime, this.elapsedTime, this.lastTime; // (int)
		this.secs = 0; 		// (int)
		this.mins = 0; 		// (int)
		this.hours = 0;		// (int)
		this.secsTot = 0; 	// (int)
		this.timeWarp; 		// (float)
		
		// GRAFICA **********************************************************
		/*PVector pos, minsPos, secsPos, hoursPos;
		int r;
		int weight = 7;
		int secsW, minsW, hoursW; 
		int secsL, minsL, hoursL;
		float secsAngle, minsAngle, hoursAngle;
		boolean bSeconds = false;
		*/
		
		// OROLOGIO INIT /////////////////////////////////////////////////////
		if(main.bDebug) console.log("## OROLOGIO INIT ##")
		this.integrale1 = new (main.Integrale)();
		//this.integrale1.init();
		
		// LOGICA **********************************************************
		this.lastTime = Date.now();
		//this.secsTot = 0;
		//this.secs = 0;
		//this.mins = 0;
		//this.hours= 0;
		
	    // GRAFICA *********************************************************
	    //secsPos = new PVector( 0, 0 );
	    //minsPos = new PVector( 0, 0 );
	    //hoursPos= new PVector( 0, 0 );
		
	},
	methods : {
		// OROLOGIO UPDATE WITH INTERFACE ////////////////////////////////////
		updateWithInterface : function (pos_, r_) {
			// LOGICA *********************************************************
		    this.update();
		    
		    // GRAFICA ********************************************************
		    /*pos = pos_;
		    r = r_;
		    secsAngle = 0.0;
		    minsAngle = 0.0;
		    hoursAngle = 0.0;
		    // i 3 angoli per le 3 lancette 
		    secsAngle = ( secsTot / 60.0    )*2*PI - PI/2;
		    minsAngle = ( secsTot / 3600.0  )*2*PI - PI/2;
		    hoursAngle= ( secsTot / 43200.0 )*2*PI - PI/2;
		    // la lunghezza delle 3 lancette
		    secsL = main.utility.int(r*0.8);
		    minsL = main.utility.int(r*0.8);
		    hoursL= main.utility.int(r*0.6);
		    // lo spessore delle 3 lancette
		    secsW = 1;
		    minsW = weight/2;
		    hoursW= weight;
		    // la posizione delle 3 lancette 
		    secsPos.set(  secsL*cos(  secsAngle  ), secsL*sin(  secsAngle  ) );
		    minsPos.set(  minsL*cos(  minsAngle  ), minsL*sin(  minsAngle  ) );
		    hoursPos.set( hoursL*cos( hoursAngle ), hoursL*sin( hoursAngle ) );
		    */
		},

		// OROLOGIO UPDATE ///////////////////////////////////////////////////
		// solo la parte logica, senza intefaccia
		update : function() {
			if(main.bDebug) console.log("OROLOGIO UPDATE");
			// LOGICA *********************************************************
			this.actualTime = Date.now();
			this.elapsedTime = this.actualTime - this.lastTime;
			this.lastTime = this.actualTime;
			//console.log("OROLOGIO - UPDATE: last: "+this.lastTime+"; actual: "+this.actualTime+"; elasped: "+this.elapsedTime+";");
			this.secsTot += this.integrale1.integra( (this.elapsedTime*this.timeWarp)/1000.0 );
			//console.log(this.secsTot);
			if( this.secsTot < 0 )
				this.secsTot = 86400 + this.secsTot;
				      
			this.secs = main.utility.int( this.secsTot % 60 );
			this.mins = main.utility.int((this.secsTot / 60) % 60 );
			this.hours= main.utility.int( this.secsTot / 3600 );
				    
			// il numero di secondi in una intera giornata
			this.secsTot %= 86400;
			//printTime();
		},

		// OROLOGIO GET NORMALIZED AMOUNT ///////////////////////////////////
		getNormalizedAmount : function () {
			if(main.bDebug) console.log("OROLOGIO GET NORMALIZED AMOUNT");
			// mentre il tempo fluisce,
		    // il valore ritornato è sempre un valore positivo
		    // 0 <= NORMALIZED OUTPUT < 1 (da notare che il valore estremo
		    // superiore 1 non viene mai raggiunto).
		    // questo proprio perchè secsTot è modulato con il valore 86400.
			return (this.secsTot / 86400.0);
		},

		// OROLOGIO SET TIME WARP ///////////////////////////////////////////
		// void setTimeWarp(float timeWarp_) {
		setTimeWarp : function ( timeWarp_ ) {
		    this.timeWarp = timeWarp_;
		    //println(timeWarp);
		    //console.log("il valore di warp attuale: "+this.timeWarp);
		},

		// OROLOGIO PRINT TIME //////////////////////////////////////////////
		//void printTime() {
		printTime : function() {
		    // mostro a console la stringa formattata con l'orario
		    //console.log("secondi totali: "+main.utility.int(this.secsTot)+" - "+main.utility.int(this.hours)+":"+main.utility.int(this.mins)+":"+main.utility.int(this.secs) );
		    console.log("secondi totali: "+this.secsTot+" - "+this.hours+":"+this.mins+":"+this.secs );
		}
		
	}
	
});


