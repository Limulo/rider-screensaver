// ACTOR CLASS ///////////////////////////////////////////////////////
main.Actor = main.utility.defineClass({
	name : "Actor",
	init : function(url_, dati_, dstW_, dstH_, pos_, mainPal_) {
		// ACTOR COSTRUTTORE /////////////////////////////////////////////////
		
		if(main.bDebug) console.log("## ACTOR COSTRUTTORE ##");
		// le dimensioni dell'immagine di destinazione
		this.dstW, this.dstH;
		this.cost;
			  
		// dati che recupero una volta creata l'istana Costume
		this.N; // numero di SPRITEs allineate nello sprite sheet
		this.T; // durata dell'animazione
		this.wSp;
		  
		// per le operazionicon i tempi
		this.actualTime, this.elapsedTime, this.lastTime;
		this.integrale1, this.integrale2;
			  
		// operazioni con lo spazio
		this.pos = [0, 0];
		this.oldPos = [];
		this.index, this.oldIndex;
		this.amount = 0.0;  
		this.vel = 0.0; // velocità pixel/secondo
		this.velS; // velocità pixel/sprite
		this.velC; // velocità pixel/ciclo
		this.direction; // la direzione del movimento laterale
		  
		// è necessario aggiornare il MAINIDX
		this.bRefresh = true;
		
		// ACTOR INIT ////////////////////////////////////////////////////////
		// il costruttore per la classe attore prende come parametri
		// - il nome del file JSON su cui sono memorizzati i dati
		// - le dimensioni dell'immagine di destinazione DST
		// - posizione x e y 
		
		//console.log(this.pos+" - "+pos_);
			
		if(main.bDebug) console.log("\n## ACTOR ## ");
		if(main.bDebug) console.log("## Inizializzazione dell Actor ##");
		    
		this.cost = new (main.Costume)(url_, dati_, mainPal_);
		//this.cost = new Costume(name_, mainPal_);
		//this.cost.init(url_, dati_, mainPal_);
		    
		this.dstW = dstW_;
		this.dstH = dstH_;
		this.pos.splice(0, 1, pos_[0] );
		this.pos.splice(1, 1, pos_[1] );
		//console.log(this.pos);

		this.N = this.cost.getN(); // ottieni da costume il numero di SPRITEs dell'animazione
		this.T = this.cost.getT(); // ottieni da costume il valore di tempo per l'animazione
	    this.wSp = this.cost.getWSprite(); // ottengo la larghezza della singola sprite
	    
	    this.oldPos = this.pos;
		this.index = 0;
	    this.oldIndex = this.index;
		    
	    this.lastTime = Date.now();
		    
	    // costruisco i due integrali che mi serviranno per :
	    this.integrale1 = new (main.Integrale)(); // il calcolo dell'indice di sprite da mostrare;
	    //this.integrale1.init();
	    this.integrale2 = new (main.Integrale)(); // il calcolo dello spostamento latarale dell'attore
	    //this.integrale2.init();
		    
	    this.calcolaVelocita( this.vel );
	    if(main.bDebug) console.log("## ACTOR INIT - FINE ##");	
	},
	methods : {
		// ACTOR UPDATE //////////////////////////////////////////////////////
		update : function() {
			if(main.bDebug) console.log("ACTOR UPDATE");
			// tempo trascorso dall'ultimo GAMELOOP
		    this.actualTime = Date.now();
		    this.elapsedTime = this.actualTime - this.lastTime;
		    this.lastTime = this.actualTime;
		    
		    var amount = ( this.elapsedTime / this.T ); // (flaot)
		    var velIntera = 0;		// (int)
		    var indexIntero = 0; 	// (int)
		    indexIntero = this.integrale1.integra( amount * this.N );
		    velIntera   = this.integrale2.integra( amount * this.velC );
		    this.pos[0] += velIntera;
		    this.index = main.utility.int( ( this.index + indexIntero) % this.N );
		    
		    if( this.pos[0] < -this.wSp) {
		    	//println("sforato a SINISTRA");
		    	this.pos[0] = this.dstW;
		    } else if( this.pos[0] > this.dstW) {
		    	//println("sforato a DESTRA");
		    	this.pos[0] = -this.wSp;
		    } else  {
		    	// do nothing
		    }
		    
		    // E' necessario fare un refresh dell'immagine?
		    //bRefresh = ( (pos != oldPos) || (index != oldIndex) );
		    //println(bRefresh);
		},
		
		// ACTOR DISPLAY /////////////////////////////////////////////////////
		//void display(int[] mainIdx_) {
		display : function ( mainIdx_ ) {
			if(main.bDebug) console.log("ACTOR DISPLAY");
			// facci un nuovo disegno soltanto se è necessario
			//if( this.bRefresh ) {
		    	this.cost.display(mainIdx_, this.index, main.utility.int( this.pos[0] ), main.utility.int( this.pos[1] ), this.direction, this.dstW, this.dstH);
		    	//this.bRefresh = false;
			//}
		},
		
		interfaceDebug : function() {
			this.cost.interfaceDebug();
		}, 
		
		// ACTOR SHIFT PALETTE ///////////////////////////////////////////////
		shiftPalette : function(amt0to1_ /* float*/, dstPal_) {
			this.cost.shiftPalette(amt0to1_, dstPal_);
		},
		
		// ACTOR CALCOLA VEL /////////////////////////////////////////////////
		calcolaVelocita : function(vel_) {
			// data la velocità pixel/secondo
		    // ottengo la velocità pixel/sprite
			this.velS = main.utility.int( ( vel_/1000.0 )*( this.T / this.N) );
		    // ottengo la velocità pixel/ciclo
			this.velC = main.utility.int( ( vel_/1000.0 )*this.T );
		    //console.log("pixel/secondo: "+this.vel+"; pixel/ciclo: "+this.velC+"; pixel/sprite: "+this.velS+";");
		}, 
		
		// ACTOR SET VEL /////////////////////////////////////////////////////
		setVel : function(vel_ /*float*/) {
			// in ingresso abbiamo un valore espresso in pixel/secondo
		    this.vel = vel_;
		    if( this.vel >= 0)
		    	this.direction = -1;
		    else
		    	this.direction = 1;
		    this.calcolaVelocita( this.vel );
		}	
	}	
});