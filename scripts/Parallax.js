main.Parallax = main.utility.defineClass({
	name : "Parallax",
	init : function(url_, dati_, dstW_, dstH_, dist_, pos_, mainPal_) {
		if(main.bDebug) console.log("## PARALLAX COSTRUTTORE ##");
		// le dimensioni dell'immagine di destinazione
		this.dstW, this.dstH;
		this.cost;
			
		// dati che recupero una volta creata l'istana Costume
		this.T; // durata dell'animazione
		this.wSp;
			
		// per le operazionicon i tempi
		this.actualTime, this.elapsedTime, this.lastTime;
		this.integrale1;
			
		// operazioni con lo spazio
		//PVector pos;
		this.pos = new Array(2);
			
		// Per un parallax non ha senso parlare di oldIndex.
		// Per parallax ho solamente un'unica sprite
		// mentre index è sempre 0 e non cambia mai.
		this.index = 0;	// (int)
			
		this.amount = 0.0; // (flaot)
		this.vel = 0.0; // (flaot) velocità pixel/secondo
			  
		// la direzione è indifferente per parallax
		// infatti non c'è bisogno di fare alcun flip
		this.direction = 1;

		this.shift = 0; // (int)
		this.dist; // (flaot) distanza del livello dal fondo	

		// PARALLAX INIT /////////////////////////////////////////////////////
		// la funzione init per la classe parallax prende come parametri
		// - il nome del file JSON su cui sono memorizzati i dati
		// - le dimensioni dell'immagine di destinazione DST
		// - posizione x e y 
		// Actor.prototype.init = function(url_, dati_, dstW_, dstH_, pos_, mainPal_) {
		//Parallax(url_, dati_, dstW_, dstH_, dist_, pos_, mainPal_) {
		if(main.bDebug) console.log("## PARALLAX INIT ## ");
		    
		this.dstW = dstW_;
	    this.dstH = dstH_;
		this.pos.splice(0, 1, pos_[0] );
		this.pos.splice(1, 1, pos_[1] );
	    // la distanza del parallax dal piano di fondo
		this.dist = dist_;
		      
	    this.cost = new (main.Costume)(url_, dati_, mainPal_);
	    //cost = new Costume(name_, mainPal_);
	    //this.cost.init(url_, dati_, mainPal_);
		    
	    // ottienei informazioni dal COST
	    this.T = this.cost.getT(); // ottieni da costume il valore di tempo per l'animazione
	    this.wSp = this.cost.getWSprite(); // ottengo la larghezza della singola sprite
		    
		//this.oldPos = this.pos;
		//this.index = 0;
		//this.oldIndex = this.index;
		    
		// costruisco un integrale
	    this.integrale1 = new (main.Integrale)();
	    //this.integrale1.init();
	    
	    this.lastTime = Date.now();
		    
	    if(main.bDebug) console.log("## PARALLAX INIT FINE ##");

	},
	methods : {
		// PARALLAX UPDATE ///////////////////////////////////////////////////
		update : function() {
		    // faccio l'update solo per quei livelli di parallasse che si trovano
		    // distanti dal piano di fondo, il quale, non muovendosi affatto
		    // non ha bisogno che venga fatto alcun calcolo per lui
			if(main.bDebug) console.log("PARALLAX - UPDATE");
			if(main.bDebug) console.log("\t la distanza del parallasse attuale è: "+this.dist+";");
		    if(this.dist > 0) {
		    	// tempo trascorso dall'ultimo GAMELOOP
		    	this.actualTime = Date.now();
		    	this.elapsedTime = this.actualTime - this.lastTime;
		    	//if(main.bDebug) console.log("PARALLAX - UPDATE 2: "+this.actualTime+", "+this.elapsedTime+", "+this.lastTime+";");
		    	this.lastTime = this.actualTime;
		      
		    	var amount = (this.elapsedTime / this.T ); // (float)
		    	var velIntera = 0; // (int)
		    	// il risultato dell'operazione integrale è concorde
		    	// con il valore da integrare. 
		    	velIntera = this.integrale1.integra( amount*this.dist*this.dist*this.vel );
		    	// per velocità negative (la camera si muove verso sinistra)
		    	// il valore di shift viene progressimante decrementato
		    	this.shift += velIntera; // quelo che in origine era chiamato SHIFT
		    	this.shift %= this.wSp;
		    	if( this.shift < 0 )
		    		this.shift = this.wSp + this.shift;
		    	//if(main.bDebug) console.log("PARALLAX - UPDATE 3: wSp:"+this.wSp+", "+amount+", "+velIntera+", "+this.shift+";");
		    }  
		},
		
		interfaceDebug : function() {
			this.cost.interfaceDebug();
		},
		
		// PARALLAX DISPLAY //////////////////////////////////////////////////
		//void display(int[] mainIdx_) {
		display : function ( mainIdx_ ) {
			if(main.bDebug) console.log("PARALLAX - DISPLAY");
			//console.log("shift: "+this.shift+";");
		    this.cost.display(mainIdx_, this.index, this.shift, main.utility.int( this.pos[1] ), this.direction, this.dstW, this.dstH);
		},
		
		// PARALLAX SET VEL //////////////////////////////////////////////////
		setVel : function( vel_ /*float*/) {
		    // in ingresso abbiamo un valore espresso in pixel/secondo
		    this.vel = vel_;
		},

		// PARALLAX GETTERS //////////////////////////////////////////////////
		getDist : function() {
			return this.dist;
		},
		
		// PARALLAX SHIFT PALETTE ////////////////////////////////////////////
		//void shiftPalette(float amt0to1_, Palette dstPal_) {
		shiftPalette : function( amt0to1_ /*float*/, dstPal_) {
			//console.log("PARALLAX - SHIFT PALETTE: amt0to1: "+amt0to1_+"; dstPal: "+dstPal_)
			this.cost.shiftPalette(amt0to1_, dstPal_);
		}
		
	}
});