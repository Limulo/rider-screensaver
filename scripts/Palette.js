// PALETTE CLASS /////////////////////////////////////////////////////
main.Palette = main.utility.defineClass({
	name : "Palette",
	init : function(nColors_, chiave_) {
		if(main.bDebug) console.log("## PALETTE CONSTRUCTOR ##");
		if(main.bDebug) console.log("PAL: mi vengono passati i valori nColors: "+nColors_+"; chiave: "+chiave_+";");
		// numero di colori nella palette
		this.nColors = nColors_; //int nColors;
		// i colori della palette
		this.colors = new Array(this.nColors); //int colors[][];
		// indice del colore di chiave nelal palette
		this.chiave = chiave_; //int chiave; //=3
		// indice del primo colore libero su cui 
		// poter copiare dati da altr palette
		this.nextFreeEntry = 0; //int nextFreeEntry; 
		
		// PALETTE INIT //////////////////////////////////////////////////////
		if(main.bDebug) console.log("## PALETTE INIT ##");
		//if(main.bDebug) console.log("nColors: "+this.nColors+"; chiave: "+this.chiave+";");
		// inizializzo la palette
		this.reset();
		//this.debug();
		
	},
	methods : {
		// PALETTE RESET /////////////////////////////////////////////////////
		// chiamando questo metodo si cancellano tutte le informazioni 
		// al momento contenute all'interno della palette. Tutti le entry 
		// vengono inizializzate ad un colore uniforme mentre il puntatore
		// "nextFreeEntry" viene riportato all'inizio della palette
		reset : function(){
			if(main.bDebug) console.log("PAL RESET: reset di tutte le entries della palette");
			//var color = [0, 0, 0];
			for(var e=0; e<this.nColors; e++) {
				this.colors[e] = new Array(3);
				this.colors[e][0] = 0;
				this.colors[e][1] = 0;
				this.colors[e][2] = 0;
				//this.colors.push( color );
			}
			this.nextFreeEntry = 0;
			if(main.bDebug) console.log("\tnextFreeEntry ora e' "+this.nextFreeEntry+";");
		},
		
		// PALETTE SET NEXT FREE COLOR ///////////////////////////////////////
		setNextFreeColor : function(r_, g_, b_) {
			if(main.bDebug) console.log("PAL SET NEXT FREE COLOR");
			// nextFreeEntry è settato a negativo se l'intera palette 
			// da colors.length colori è stata riempita completamente. 
			if(this.nextFreeEntry >= 0) {
				//var newColor = [r_, g_, b_];
				if(main.bDebug) console.log("PAL: il nuovo colore da aggiungere è ("+r_+", "+g_+","+b_+")");
				
				//this.colors.splice(this.nextFreeEntry, 1, newColor);
				this.colors[ this.nextFreeEntry ][0] = r_;
				this.colors[ this.nextFreeEntry ][1] = g_;
				this.colors[ this.nextFreeEntry ][2] = b_;
					
				this.nextFreeEntry ++;
				// il colore appena settato era l'ultimo allora imposto 
				// nextFreeEntry a un valore negativo per evitare ulteriori
				// settaggi di colore tramite questo metodo
				if (this.nextFreeEntry > this.nColors-1) 
					this.nextFreeEntry = -1;
				if(main.bDebug) console.log("\tnextFreeEntry ora e' "+this.nextFreeEntry+";");
			} else {
				if(main.bDebug) console.log("PAL: impossibile settare il nuovo colore, non sono disponibili spazi liberi!");
				if(main.bDebug) console.log("\tnel caso resettare la palette.");
			}
		},
		
		// PALETTE SET COLOR /////////////////////////////////////////////////
		// metodo da usare per settare i colori della palette in modo
		// forzato col rischio di sovreascrivere alcune entry già settate
		// i parametri sono l'indice palette del colore da settare
		// e i valori di RED, GREEN e BLUE del suddetto colore
		// Questo metodo è usato durante il PALETTE SHIFTING
		//void setColor(int e_, int r_, int g_, int b_) {
		setColor : function(e_, r_, g_, b_) {
			if(main.bDebug) console.log("PAL SET COLOR");
		    // solo se l'indice è interno alla palette
		    // posso settarne il colore usando 
		    // i valori passati come parametri
		    if( (e_>=0) && (e_<this.nColors) ) {
		    	this.colors[e_][0] = r_;
		    	this.colors[e_][1] = g_;
		    	this.colors[e_][2] = b_;
		    	if(main.bDebug) console.log("PAL: entry "+e_+") setto a "+r_+", "+g_+", "+b_+";");
		    } else {
		    	if(main.bDebug) console.log("PAL: il colore che si cerca di settare ha un indice non interno alla palette");
		    }
		},
		
		// PALETTE TRANSFER COLORS ///////////////////////////////////////////
		// copia i colori della palette locale (palette sorgente) 
		// alla palette di destinazione.
		// Il valore ritornato serve affinchè COST, che chiama questo metodo
		// passando MAINPAL come paramentro, tenga a mente l'OFFSET dei
		// colori nella MAINPAL. Questo valore di OFFSET sarà usato al momento
		// della chiamata a display per le varie SPRITE in modo tale che
		// nella copia dall'array di indici locale al MAINIDX, tutti gli indici
		// siano opportunamente incrementati di OFFSET per referenziare
		// il colore corretto nella MAINPAL.
		transferTo : function(dst) { //function(Palette dst) {
			if(main.bDebug) console.log("PAL TRANSFER TO: transfer dei colori dalla LOCPAL alla DSTPAL");
		    // salvo in nf l'indice della primissima
		    // entry della destination palette ad essere vuota 
		    // e quindi disponibile per essere sovrascritta
		    var nf = dst.nextFreeEntry;
		    // numero di entry ancora disponibili nella destination palette
		    //int nFreeEntry = dst.nColors - nf + 1; (?????)
		    var freeEntries = dst.nColors - nf ;
		    if(main.bDebug) console.log("PAL: la prima Entry libera disponibile in DSTPAL e' quella di indice "+nf+";");
		    if(main.bDebug) console.log("PAL: Nella DSTPAL sono ancora disponibili "+freeEntries+" entry");
		    
		    if(freeEntries < this.nColors) {
		    	if(main.bDebug) console.log("PAL: lo spazio disponibile nella DSTPAL non e' sufficiente per contenere i colori della LOCPAL");
		    } else {
		    	if(main.bDebug) console.log("PAL: procedo con la copia");
		    	// copio i colori della palette sorgente
		    	// nella palette di destinazione
		    	for(var e=0; e<this.nColors; e++) {
		    		if(main.bDebug) console.log("PAL: ciclo nella LOCPAL (entry "+e+") ");
		    		// non ha senso conservare il colore di chiave
		    		if(e != this.chiave ) {
		    			if(main.bDebug) console.log("NON e' il colore di chiave - procedo con la copia");
		    			// ATTENZIONE: occorre che i valori della LOCPAL vengano trasferiti
		    			// alla DSTPAL per VALORE e non per riferimento per cui
		    			// l'operazione va svolta così
		    			dst.colors[ dst.nextFreeEntry ][0] = this.colors[e][0];
		    			dst.colors[ dst.nextFreeEntry ][1] = this.colors[e][1];
		    			dst.colors[ dst.nextFreeEntry ][2] = this.colors[e][2];
		    			// e non in quest'altro modo. Perchè così facendo avrei 
		    			// semplicemente creato que riferimenti allo stesso valore
		    			//dst.colors[ dst.nextFreeEntry ] = this.colors[e]; 
		    			
		    			//console.log("PAL: l'entry "+e+" ("+this.colors[e][0]+", "+this.colors[e][1]+", "+this.colors[e][2]+") viene copiata nella DSTPAL in posizione "+dst.nextFreeEntry+";");
		    			if(main.bDebug) console.log("PAL: l'entry "+e+" ("+this.colors[e]+") viene copiata nella DSTPAL in posizione "+dst.nextFreeEntry+";");
		    			dst.nextFreeEntry ++;
		    			if(main.bDebug) console.log("PAL: ora la NextFreeEntry per la DSTPAL e' "+dst.nextFreeEntry+";");
		    		} else {
		    			if(main.bDebug) console.log("E' il colore di chiave per il COST attuale: passo oltre;");
		    		} 
		    	}
		    	if(main.bDebug) console.log("PAL: trasferimento avvenuto, nextFreeEntry per la DSTPAL e' ora: "+dst.nextFreeEntry);
		    }
		    return nf;
		},
		
		// GET COLORS ////////////////////////////////////////////////////////
		// questo metodo è stato aggiunto per poter fornire all'estreno i colori
		// della palette sottoforma di array monodimensionale con tutti i canali
		// di tutti i colori disposti consecutivamente. 
		// Ad oggi, il metodo è usato soltanto per passare i dati al fragment shader
		// allo scopo di creare la texture che sarà usata per la rasterizzazione.
		getColors : function() {
			var array = new Array (this.nColors * 3);
			for(var e=0; e<this.nColors; e++){
				array[e*3 + 0] = this.colors[e][0] ;
				array[e*3 + 1] = this.colors[e][1] ;
				array[e*3 + 2] = this.colors[e][2] ;
			}
			return array;
		},
		
		// PALETTE DEBUG /////////////////////////////////////////////////////
		debug : function() {
			if(main.bDebug) console.log("\tPAL: print palette for DEBUG");
			// per un debug elenco tutti i colori della palette
			if(main.bDebug) console.log(this.colors);
			/*
			for(var e=0; e<this.nColors; e++) {
				console.log("\tentry "+e+") ["+this.colors[e][0]+", "+this.colors[e][1]+", "+this.colors[e][2]+"];")
				if(e === this.chiave) {
					console.log("\t ---> colore CHIAVE");
				}
			}
			*/
		}
	} 	
});