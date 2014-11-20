var main = (function() {
	// la variabili sono elencate in basso!
	var bShowPalettes = true;
	// COSTUME CLASS /////////////////////////////////////////////////////
	//function Costume(name_, mainPal_) {
	function Costume(/*dstPal_*/) {
		if(bDebug) console.log("## COSTUME COSTRUTTORE ##");
		this.fileName;
		//this.dstPal = dstPal_;
		// dimensioni dell'immagine caricata via JSON
		this.w, this.h;
		// Numero di palette per il costume. Di default il numero di palette è 1
		// ma puo' essere un numero maggiore se si tratta di un JSON pensato per
		// implementare un PALETTE SHIFTING
		this.pals; // = []; // array che contiene le varie palettes
		// numero di palette dell'immagine
		this.nPals;
		// il colore chiave di default ha indice 0 nelle PALETTEs
		this.idxChiave = 0;
		// numero di colori nelle palette per le varie sprite che 
		// compongono il costume 
		this.nC = -1;
		// fondamentali per il Palette shifting
		this.idxL, this.idxH;
		
		// per future implementazioni prevediamo qui
		// anche la possibilità che la palette
		// faccia uso di uno o più COLOR CYCLE
		//ColorCycle cycles[]; 
		//this.cysles;
		// normalmente il costume è formato da
		// più sprite, tutte allineate all'interno
		// del file spritesheet
		this.sprites = new Array();
		this.nSprites;
		this.wSprite;
		// animationTime è un valore di tempo espresso in millisecondi
		// ottenuto direttamente da uno specifico campo del files
		// JSON. Se il JSON descrive uno spritesheet, che conta piu'
		// SPRITE che compongono una animazione, è necessario conoscere
		// anche il tempo entro il quale questa animazione si esaurisce.		
		this.animationTime;
		// questo valore numerico viene impostato nel momento
		// in cui si effetua il trasferimento dei colori dalla
		// palette locale a quella principale. Infatti gli indici
		// delle sprite, che fanno riferimento alla palette locale
		// potrebbero non corrispondere con gli indici degli stessi
		// colori per come essi si trovino disposti all'interno 
		// della palette principale. Così memorizzo un valore di offest
		// da impiegare al momento di copiare gli indici della sprite
		// nel main indexes
		this.paletteOffset = 0;
	};
		
	// COSTUME INIT //////////////////////////////////////////////////////
	Costume.prototype.init = function(name_, jsonFile, dstPal_) {
		this.fileName = name_;
		if(bDebug) console.log("## COSTUME INIT ("+this.fileName+") ##");
		// supporti per l'estrazione dei dati dal file JSON
			
		if(bDebug) console.log("COST: il colore chiave è: "+this.idxChiave);
			
		if(bDebug) console.log("COST: l'array descritto dal file JSON caricato contiene "+jsonFile.length+" elemento." );
		// W e H per lo SPRITESHEET ***********************************
		this.w = jsonFile[0]["width"];
		this.h = jsonFile[0]["height"];
		if(bDebug) console.log("COST: l'immagine ha dimensioni: "+this.w+"x"+this.h+";");
			
		// Quante SPRITE nello SPRITESHEET ****************************
		// trovo quante sono le sprite descritte dal file JSON
		this.nSprites = jsonFile[0]["nSprites"];
		if( this.nSprites > 1) {
			if(bDebug) console.log("COST: il file JSON e' uno spritesheet che contiene "+this.nSprites+" sprites;");
		} else {
			if(bDebug) console.log("COST: il file JSON descrive solo "+this.nSprites+" immagine;");
		}
		this.sprites = new Array( this.nSprites );
		    
		// Animation TIME *********************************************
		// la durata del ciclo di animazione espressa in millisecondi
		this.animationTime = jsonFile[0]["Time"];
		var bAnimation = true;
		if(this.animationTime < 0) {
			// la sprite contiene un disegno per lo sfondo
			// contiene un parallax
			this.animationTime = 1000;
			bAnimation = false;
			if(bDebug) console.log("COST: impostazione di default per T ("+this.animationTime+" ms);");
		} else {
			if(bDebug) console.log("COST: la durata del ciclo di animazione rappresentato nello spritesheet e' di "+this.animationTime+" ms;");
		}
		
		// PALETTES ***************************************************
		// definisco quante PALETTEs LOCALI ci debbono essere nel COST
		var jsonPals = jsonFile[0]["palettes"];
		this.nPals = jsonPals.length;
		// ecco l'array delle palette locali LOCPAL per il COSTUME
		// esse veranno popolate poco piu' in basso.
		this.pals = new Array( this.nPals ); //pals = new Palette[nPals];
			
		// PALETTE ENTRIES ********************************************
		// devo popolare le PALETTEs LOCALI con le COLOR ENTRIES
		// esamino la prima palettes per capire quanti colori contiene
		// confronterò il numero di colori per ogni palette con questo,
		// per controllare che ogni palette abbia lo stesso numero di colori
		this.nC = jsonPals[0].length;
		// check 2 ****************************************************
		if(bDebug) console.log("COST: l'immagine contiene "+this.nPals+" palettes da "+this.nC+" colori ciascuna (compresa la chiave)");
		var nColors = -1;
		//this.pals;
		for(var ip=0; ip<this.nPals; ip++) {
			var jsonPalette = jsonPals[ip];
			nColors = jsonPalette.length;
			if(bDebug) console.log("COST: esamino la palette "+ip+", che ha "+nColors+" colori;");
			if(nColors != this.nC) {
				if(bDebug) console.log("COST: Attenzione! I numeri di colori tra le palettes differisce - controlla il file JSON");
			}
			// creo le palettes locali LOCPALs
			// NOTA: le LOCPALs contengono il colore chiave.
		    // Quando invece le si copia nelle SHADOW PALETTE, 
		    // il colore di chiave viene tralasciato
		    //var paletta = new Palette(this.nC, this.idxChiave);
		    //this.pals.push( paletta );
		    var newLocalPalette =  new Palette(this.nC, this.idxChiave);
		    newLocalPalette.init();
		    // copio i colori indicati dal file JSON 
		    // all'interno della LOCPAL attualmente in esame
		    for(var e=0; e<this.nC; e++) {
		    	//var jsonColor = jsonPalette[e];
				var red   = jsonPalette[e][0];
				var green = jsonPalette[e][1];
				var blue  = jsonPalette[e][2];
				newLocalPalette.setNextFreeColor(red, green, blue);
			}
		    newLocalPalette.debug(); // per debug
		    
		    //this.pals.push( newLocalPalette );
		    
		    this.pals[ip] = newLocalPalette;
		    
		    var paletteIdentifier = "";
		    paletteIdentifier += this.fileName+"_"+ip;
		    interfaceCreatePaletteContainer(paletteIdentifier, this.pals[ip]);
		 }
		 		
		 // TRASFERIMENTO della LOCPAL alla MAINPAL ********************
		 // al momento viene trasferita nella MAINPAL solo la palette di 
		 // indice 0, la prima di quelle che il COST possiede
		 this.paletteOffset = this.pals[0].transferTo( dstPal_ );
		 if(bDebug) console.log("COST: al termine del trasferimento posso referenziare i colori in palette grazie a 'paletteOffset' = "+this.paletteOffset+";");
		
		 // SPRITES ****************************************************
		 if(bDebug) console.log("COST: mi occupo ora delle SPRITE");
		 this.wSprite = int(this.w / this.nSprites);
		 this.hSprite = this.h;
		 // creo tante SPRITE quante indicate dal file JSON
		 for(var is=0; is<this.nSprites; is++) {
			 var newSprite = new Sprite( this.wSprite, this.hSprite, bAnimation);
			 newSprite.init();
			 newSprite.debug();
			 
			 //this.sprites.push( newSprite );
			 this.sprites[is] = newSprite; 
		 }
		 
		 // SPRITE IDX *************************************************
		 if(bDebug) console.log("COST: mi occupo ora dell'array di indici");
		 // mi copio i dati degli indici per i pixel
		 var jsonIndexes = jsonFile[0]["indexes"];
		 // - (xss, yss) - coordinate nello spritesheet
		 // - (xsp, ysp) - coordinate nella singola sprite
		 var xsp = 0;
		 var ysp = 0;
		 for(var yss=0; yss<this.h; yss++) {
			ysp = yss;
		    for(var xss=0; xss<this.w; xss++) {
		    	xsp = xss % this.wSprite;
		        var is = int(xss / this.wSprite); // indice della sprite su cui andare a copiare i dati 
		        var offsetSS = xss + yss*this.w;
		        var offsetSP = xsp + ysp*this.wSprite;
		        this.sprites[is].indexes[offsetSP] = jsonIndexes[offsetSS] ;
		        //sprites[is].indexes[offsetSP] = jsonIndexes.getInt(offsetSS);
		    }
		 }
		 if(bDebug) console.log("QUI SOTTO tutte le sprite del COST corrente");
		 if(bDebug) console.log(this.sprites);
		 
		 
		 // OTTIMIZZAZIONE per le SPRITEs ******************************
		 for(var is=0; is<this.nSprites; is++) {
			 // alla sprite è necessario passare un riferimento al costume
			 // che la ha creata per poter 
		 	 this.sprites[is].optimize(this);
		 }
		 
		 
		 // DEBUG FINALE ***********************************************
		 // le palette del costume sono mostrate almeno una volta alla
		 // inizializzazione
		 //this.interfaceDebug();
		 //console.log(mainPal);
    } // fine della funzione INIT
	
	// COSTUME DISPLAY //////////////////////////////////////////////
	// - mainIdx
	// - indice della sprite da mostrare
	// - posizioni X e Y
	// - direzione (per calcolare un eventuale FLIP
	// - dimensioni dell'immagine di destinazione
	//void display(int[] indexes_, int is_, int x_, int y_, int direction_, int dstW_, int dstH_) {
	Costume.prototype.display = function (indexes_, is_, x_, y_, direction_, dstW_, dstH_) {
		if(bDebug) console.log("COST - DISPLAY");
		//if(bDebug) console.log("is: "+is_+", x/y ("+x_+", "+y_+"), dir: "+direction_+", dstW/H ("+dstW_+", "+dstH_+");");
		// alla sprite passo un riferimento al costume corrente, suo PARENT
	    this.sprites[ is_ ].display(indexes_, this.paletteOffset, this, x_, y_, direction_, dstW_, dstH_);
	}
	
	
	// COSTUME SHIFT PALETTE ////////////////////////////////////////
	Costume.prototype.shiftPalette = function( amt0to1_ /*float*/, dstPal_ ) {
	    // 0 <= 'amt0to1_' < 1 (NOTA: per come è pensata la logica seguente
	    // deve essere che il valore passato come parametro a questa 
	    // funzione vari da 0 a 1 con 1 non compreso).
	    
	    // da questo ricavo un valore 'amt' che varia da 0 a range
	    // ricordiamo quindi che 0 <= amt < ragne (range non compreso)
	    // su base del quale individuo gli indici delle 
	    // SHADOW PALETTEs tra cui deve avvenire l'interpolazione
	    
	    var range = this.nPals; // (int)
	    // ha senso fare calcoli sullo shift della palette solo se ne esiste
	    // piu' di una per la sprite corrente, tra le quali si possa shiftare i colori
	    if(range > 1) {
	    	var amt = amt0to1_ * range; // (float)
	    	this.idxL  = Math.floor( amt );  
	    	this.idxH = (this.idxL + 1) % int(range);
	    	var amongAmount = amt - this.idxL; // (float)
	      
	    	//print("iamt: "+nf(amt0to1_, 2, 3)+"; ");
	    	//print("amt: "+nf(amt, 2, 3)+"; ");
	    	//print("among: "+nf(amongAmount, 2, 3)+"; ");
	    	//println("LOW: "+idxL+"; HIGH: "+idxH+";");
	      
	    	//debugger.print("iamt: "+nf(amt0to1_, 2, 3)+"; ");
	    	//debugger.print("amt: "+nf(amt, 2, 3)+"; ");
	    	//debugger.print("among: "+nf(amongAmount, 2, 3)+"; ");
	    	//debugger.println("LOW: "+idxL+"; HIGH: "+idxH+";");
	      
    		//console.log("amt0to1: "+amt0to1_.toFixed(3)+"; amtInRange: "+amt.toFixed(3)+"; among: "+amongAmount.toFixed(3)+"; LOW: "+this.idxL+" ---> HIGH: "+this.idxH+";");
	    	// il colore chiave deve trovarsi in posizione 0 (enty 0
	    	// in tutte le palette locali perchè valga questo ragionamento)
	    	var rL, gL, bL;
	    	var rH, gH, bH;
	    	var rI, gI, bI;
	      
	    	for(var e=1; e< this.nC; e++) {
	        
	    		// i dati sul colore con indice LOW
	    		rL = this.pals[ this.idxL ].colors[e][0] ;
	    		gL = this.pals[ this.idxL ].colors[e][1] ;
	    		bL = this.pals[ this.idxL ].colors[e][2] ;
	        
	    		// i dati sul colore con indice HIGH
	    		rH = this.pals[ this.idxH ].colors[e][0] ;
	    		gH = this.pals[ this.idxH ].colors[e][1] ;
	    		bH = this.pals[ this.idxH ].colors[e][2] ;
	        
	        	// i dati sul colore ottenuto per interpolazione
	    		// LINEAR INTERPOLATION è una funzione del gruppo UTILITY FUNCs
	    		// la conversione a INT è necessaria per poter assegnare il colore
	    		// come valore CSS per le varie entry della palette nell'interfaccia
	    		rI = int( linearInterpolation( amongAmount, rL, rH) );
	    		gI = int( linearInterpolation( amongAmount, gL, gH) );
	    		bI = int( linearInterpolation( amongAmount, bL, bH) );
	        
	    		dstPal_.setColor( (e + this.paletteOffset - 1), rI, gI, bI);   
	    	}
	    } else {
	    	// il range è 1 o inferiore: significa che la sprite ha una sola palette colori
	    	// disponibile. Questo non rende possibile alcun palette shifting
	    	// do nothing
	    	//console.log("COST: per la sprite corrente non esistono Palette multiple tra le quali shiftare!");
		}
	} 
	  
    // COSTUME GETTERS //////////////////////////////////////////////
    Costume.prototype.getN = function() {
      // restituisco il numero di sprite nello spritesheet
      return this.nSprites;
    }
    
    Costume.prototype.getNPals = function() {
      // restituisco il numero di Palettes
      return this.nPals;
    }
    
    Costume.prototype.getWSprite = function() {
      // restituisco la larghezza della singola sprite
      return this.wSprite;
    }
    
    Costume.prototype.getT = function() {
      // restituisco la larghezza della singola sprite
      return this.animationTime;
    }
    
    // COSTUME DEBUG /////////////////////////////////////////////////////
    Costume.prototype.interfaceDebug = function() {
    	//console.log("COST: debug per COSTUME");
    	for(var ip=0; ip<this.nPals; ip++) {
    		//l'identificativo della palette è creato a partire dal nome del
    		// file json dell'attore in cui le palettes sono descritte
    		var idPalette = this.fileName+"_"+ip;
    		
    		// marchiamo il contorno delle palette che shiftano
    		if(ip == this.idxL)
    			document.getElementById( idPalette ).style.border = "2px solid rgb(0, 255, 0)";
    		else if(ip == this.idxH)
    			document.getElementById( idPalette ).style.border = "2px solid rgb(255, 0, 0)";
    		else
    			document.getElementById( idPalette).style.border = "2px solid rgb(0, 0, 0)";
    		
    		//console.log("identificativo della palete da mostrare: "+idPalette)
    		
    		//mostriamo i colori della palette a schermo
    		interfaceDisplayPalette(idPalette, this.pals[ip] );
    	}
    };

	// PALETTE CLASS /////////////////////////////////////////////////////
	function Palette(nColors_, chiave_) {
		if(bDebug) console.log("## PALETTE CONSTRUCTOR ##");
		if(bDebug) console.log("PAL: mi vengono passati i valori nColors: "+nColors_+"; chiave: "+chiave_+";");
		// numero di colori nella palette
		this.nColors = nColors_; //int nColors;
		// i colori della palette
		this.colors = new Array(this.nColors); //int colors[][];
		// indice del colore di chiave nelal palette
		this.chiave = chiave_; //int chiave; //=3
		// indice del primo colore libero su cui 
		// poter copiare dati da altr palette
		this.nextFreeEntry = 0; //int nextFreeEntry; 
	};

	// PALETTE INIT //////////////////////////////////////////////////////
	Palette.prototype.init = function(){
		if(bDebug) console.log("## PALETTE INIT ##");
		//if(bDebug) console.log("nColors: "+this.nColors+"; chiave: "+this.chiave+";");
		// inizializzo la palette
		this.reset();
		//this.debug();
	};
		
	// PALETTE RESET /////////////////////////////////////////////////////
	// chiamando questo metodo si cancellano tutte le informazioni 
	// al momento contenute all'interno della palette. Tutti le entry 
	// vengono inizializzate ad un colore uniforme mentre il puntatore
	// "nextFreeEntry" viene riportato all'inizio della palette
	Palette.prototype.reset = function(){
		if(bDebug) console.log("PAL RESET: reset di tutte le entries della palette");
		//var color = [0, 0, 0];
		for(var e=0; e<this.nColors; e++) {
			this.colors[e] = new Array(3);
			this.colors[e][0] = 0;
			this.colors[e][1] = 0;
			this.colors[e][2] = 0;
			//this.colors.push( color );
		}
		this.nextFreeEntry = 0;
		if(bDebug) console.log("\tnextFreeEntry ora e' "+this.nextFreeEntry+";");
	}
		
	// PALETTE SET NEXT FREE COLOR ///////////////////////////////////////
	Palette.prototype.setNextFreeColor = function(r_, g_, b_) {
		if(bDebug) console.log("PAL SET NEXT FREE COLOR");
		// nextFreeEntry è settato a negativo se l'intera palette 
		// da colors.length colori è stata riempita completamente. 
		if(this.nextFreeEntry >= 0) {
			//var newColor = [r_, g_, b_];
			if(bDebug) console.log("PAL: il nuovo colore da aggiungere è ("+r_+", "+g_+","+b_+")");
			
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
			if(bDebug) console.log("\tnextFreeEntry ora e' "+this.nextFreeEntry+";");
		} else {
			if(bDebug) console.log("PAL: impossibile settare il nuovo colore, non sono disponibili spazi liberi!");
			if(bDebug) console.log("\tnel caso resettare la palette.");
		}
	}

	// PALETTE SET COLOR /////////////////////////////////////////////////
	// metodo da usare per settare i colori della palette in modo
	// forzato col rischio di sovreascrivere alcune entry già settate
	// i parametri sono l'indice palette del colore da settare
	// e i valori di RED, GREEN e BLUE del suddetto colore
	// Questo metodo è usato durante il PALETTE SHIFTING
	//void setColor(int e_, int r_, int g_, int b_) {
	Palette.prototype.setColor = function(e_, r_, g_, b_) {
		if(bDebug) console.log("PAL SET COLOR");
	    // solo se l'indice è interno alla palette
	    // posso settarne il colore usando 
	    // i valori passati come parametri
	    if( (e_>=0) && (e_<this.nColors) ) {
	    	this.colors[e_][0] = r_;
	    	this.colors[e_][1] = g_;
	    	this.colors[e_][2] = b_;
	    	if(bDebug) console.log("PAL: entry "+e_+") setto a "+r_+", "+g_+", "+b_+";");
	    } else {
	    	if(bDebug) console.log("PAL: il colore che si cerca di settare ha un indice non interno alla palette");
	    }
	}
	
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
	Palette.prototype.transferTo = function(dst) { //function(Palette dst) {
		if(bDebug) console.log("PAL TRANSFER TO: transfer dei colori dalla LOCPAL alla DSTPAL");
	    // salvo in nf l'indice della primissima
	    // entry della destination palette ad essere vuota 
	    // e quindi disponibile per essere sovrascritta
	    var nf = dst.nextFreeEntry;
	    // numero di entry ancora disponibili nella destination palette
	    //int nFreeEntry = dst.nColors - nf + 1; (?????)
	    var freeEntries = dst.nColors - nf ;
	    if(bDebug) console.log("PAL: la prima Entry libera disponibile in DSTPAL e' quella di indice "+nf+";");
	    if(bDebug) console.log("PAL: Nella DSTPAL sono ancora disponibili "+freeEntries+" entry");
	    
	    if(freeEntries < this.nColors) {
	    	if(bDebug) console.log("PAL: lo spazio disponibile nella DSTPAL non e' sufficiente per contenere i colori della LOCPAL");
	    } else {
	    	if(bDebug) console.log("PAL: procedo con la copia");
	    	// copio i colori della palette sorgente
	    	// nella palette di destinazione
	    	for(var e=0; e<this.nColors; e++) {
	    		if(bDebug) console.log("PAL: ciclo nella LOCPAL (entry "+e+") ");
	    		// non ha senso conservare il colore di chiave
	    		if(e != this.chiave ) {
	    			if(bDebug) console.log("NON e' il colore di chiave - procedo con la copia");
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
	    			if(bDebug) console.log("PAL: l'entry "+e+" ("+this.colors[e]+") viene copiata nella DSTPAL in posizione "+dst.nextFreeEntry+";");
	    			dst.nextFreeEntry ++;
	    			if(bDebug) console.log("PAL: ora la NextFreeEntry per la DSTPAL e' "+dst.nextFreeEntry+";");
	    		} else {
	    			if(bDebug) console.log("E' il colore di chiave per il COST attuale: passo oltre;");
	    		} 
	    	}
	    	if(bDebug) console.log("PAL: trasferimento avvenuto, nextFreeEntry per la DSTPAL e' ora: "+dst.nextFreeEntry);
	    }
	    return nf;
	}

	// PALETTE DEBUG /////////////////////////////////////////////////////
	Palette.prototype.debug = function() {
		if(bDebug) console.log("\tPAL: print palette for DEBUG");
		// per un debug elenco tutti i colori della palette
		if(bDebug) console.log(this.colors);
		/*
		for(var e=0; e<this.nColors; e++) {
			console.log("\tentry "+e+") ["+this.colors[e][0]+", "+this.colors[e][1]+", "+this.colors[e][2]+"];")
			if(e === this.chiave) {
				console.log("\t ---> colore CHIAVE");
			}
		}
		*/
	}

	// SPRITE CLASS //////////////////////////////////////////////////////
	function Sprite (w_, h_, bType_) {
		if(bDebug) console.log("## SPRITE COSTRUTTORE ##");
		this.w = w_;
		this.h = h_;
		this.indexes = new Array(this.w * this.h); // new Array();
		this.bXFlip = false;
		this.bYFlip = false;
		// coordinate ottimizzate per determinare il bounding box minimo.
		// Nel caso non venga chiamata l'ottimizzazione per la sprite
	    // inizializzo le coordinate ottimizzate a quelle che contengo
	    // l'intera sprite
	    this.Xmin = 0;
	    this.Xmax = this.w-1;
	    this.Ymin = 0;
	    this.Ymax = this.h-1;
		// numero di pixel utili
		this.useful = 0;
		// la sprite è un livello del BG? è un parallax?
		this.bAnimation = bType_;
	};

	// SPRITE INIT ///////////////////////////////////////////////////////
	Sprite.prototype.init = function() {
		if(bDebug) console.log("## SPRITE INIT ##");
		
		// inizializzo tutti gli indici al valore 0 che,
	    // quando provvederemo a standardizzare la cosa
	    // potrebbe essere il colore di chiave
		//var length = this.w * this.h;
		for(var i=0; i<this.indexes.length; i++) {
			//this.indexes.push( 0 );
			this.indexes[i] = 0;
		}
		if(bDebug) console.log("SP: creata una nuova Sprite "+this.w+"x"+this.h+" ("+this.indexes.length+" indici)");
		if(this.bAnimation)
			if(bDebug) console.log("SP: la sprite fa parte di una animazione");
		else
			if(bDebug) console.log("SP: la sprite è un elemento del BG o un Parallasse");
	}
	
	// SPRITE OPTIMIZE //////////////////////////////////////////////////
	Sprite.prototype.optimize = function( parentCostume ) {
		// ricevo il Costume parent dal quale prelevare il colore chiave.
	    if(bDebug) console.log("SP OPTIMIZE: ottimizzazione della SPRITE");
	    // OTTIMIZZAZIONE 1 *******************************************
	    // posso facilmente stabilire tra quali valori (minimo e massimo) per
	    // i 2 assi X e Y esistano all'interno della sprite pixel utili.
	    // Con questi 2 valori memorizzati potro preoccuparmi di ciclare
	    // soltanto tra queste due coordinate.
	    // imposto le coords ottimizzate ai valori più estremi e poi 
	    // controllo i pixel della seorgente per modificarli
	    if(bDebug) console.log("\tSP: sprite: "+this.w+", "+this.h+", bounding box: ("+this.Xmin+", "+this.Ymin+") - ("+this.Xmax+", "+this.Ymax+"), parentChiave: "+parentCostume.idxChiave+";");
	    this.Xmin = this.w;
	    this.Xmax = 0;
	    this.Ymin = this.h;
	    this.Ymax = 0;
	    for(var y=0; y<this.h; y++) {
	    	for(var x=0; x<this.w; x++) {
	    		var i = x + y*this.w;
	    		// il pixel attuale è colore diverso dalla chiave?
	    		if( this.indexes[i] !== parentCostume.idxChiave ) {          
	    			if(x>this.Xmax)
	    				this.Xmax = x;
	    			if(x<this.Xmin)
	    				this.Xmin = x;
	    			if(y>this.Ymax)
	    				this.Ymax = y;
	    			if(y<this.Ymin)
	    				this.Ymin = y;
	    			this.useful ++;
	    		}
	    	}
	    }
	    if(bDebug) console.log("\tSP: NEW bounding box: ("+this.Xmin+", "+this.Ymin+") - ("+this.Xmax+", "+this.Ymax+")");
	    // OTTIMIZZAZIONE 2 *******************************************
	    // calcoliamo ratio (rapporto tra pixel utili e pixel di chiave)
	    var area = (this.Xmax - this.Xmin + 1) * (this.Ymax - this.Ymin +1);
	    var unuseful = area - this.useful;
	    if( unuseful > 0) {
	    	var ratio = this.useful / unuseful ;
	    	if(bDebug) console.log("\tSP: useful: "+this.useful+"; un-useful: "+unuseful+"; ratio: "+ratio+";");
	    } else {
	    	if(bDebug) console.log("\tSP: gli indici sono tutti associati a pixels diversi dal colore di chiave!");
	    }
	    // per ora non implemento un metodo di display che funzioni con
	    // ottimizzazione 2 avvenuta. Mi limito a mostrare i dati sul
	    // numero di pixel utili, inutili e rratio a titolo di info.
	}
	
	// SPRITE DISPLAY ///////////////////////////////////////////////////
	// questo metodo ha lo scopo di aggioranre gli indici di MAINIDX
	// su base delle informazioni contenute nell'array di indici per la SPRITE.
	// Nel caso invece si opti per fornire al metodo accesso diretto ai
	// pixel di DSTIMG, si avrà bisogno di combinare queste informazioni
	// con quello contenute nella MAINPAL che in qualche modo dovrà essere
	// passata alal funzione.
	//void display(int[] mainIdx_, int offset, Costume parent, int posx, int posy, int dir, int dstW_, int dstH_) {
	Sprite.prototype.display = function (mainIdx_, offset_, parent, posx, posy, dir, dstW_, dstH_) {
		if(bDebug) console.log("SPRITE DISPLAY");
		//if(bDebug) console.log(parent);
		// faccio in modo che le coordinate x e y 
	    // (di supporto per i cicli) si muovano solo 
	    // tra i valori estremi del bounding box minimo
	    var srcX, srcY;
	    var dstX, dstY;
    	var indexDst = 0;
    	var indexSrc = 0;

	    if( this.bAnimation ) {
	    	// devo operare un flip orizzontale??
	    	this.bXFlip = (dir > 0) ? false : true ;
	      
	    	// x1 è limite inferiore del ciclo for per x
	    	// x2 è limite superiore del ciclo for per x
	    	var x1, x2, y1, y2;
	    	if( this.bXFlip ) {
	    		x1 = ( this.w - 1 - this.Xmax) ; 
	    		x2 = ( this.w - 1 - this.Xmin) ;
	    	} else {
	    		x1 = this.Xmin;
	    		x2 = this.Xmax;
	    	}
	      
	    	// y1 è limite inferiore del ciclo for per y
	    	// y2 è limite superiore del ciclo for per y
	    	if( this.bYFlip ) {
	    		y1 = ( this.h - 1 - this.Ymax);
	    		y2 = ( this.h - 1 - this.Ymin);
	    	} else {
	    		y1 = this.Ymin;
	    		y2 = this.Ymax;
	    	}
	      
	    	// se la sprite fa parte di un ciclo di animazione
	    	// deve essere disegnata secono le regole seguenti

	    	for(var y=y1; y<=y2; y++) {
	    		for(var x=x1; x<=x2; x++) {
	    			dstX = ( x+int(posx) ) ;
	    			dstY = ( y+int(posy) ) ;
	    			if( (dstX>=0) && (dstX<dstW_) && (dstY>=0) && (dstY<dstH_) ) {
	            
	    				indexDst = dstX + dstY * dstW_;
	    				srcX = ( this.bXFlip ) ? (this.w - 1 - x) : x ; 
	    				srcY = ( this.bYFlip ) ? (this.h - 1 - y) : y ; 
	            
	    				indexSrc = srcX + srcY*this.w;
	    				if( this.indexes[ indexSrc ] != parent.idxChiave )
	    					mainIdx_[ indexDst ] = this.indexes[ indexSrc ]+( offset_-1 ); 
	    			  
	    			}
	    		}
	      	}
	    } else {
	    	// se la sprite invece non fa parte di un ciclo di animazione 
	    	// ma rappresenta un livello di BG di tipo parallax
	    	if(bDebug) console.log("SPRITE: ul-corner("+this.Xmin+", "+this.Ymin+") e br-corner("+this.Xmax+", "+this.Ymax+"), posx/posy("+posx+", "+posy+"), sprite Width: "+this.w+";");
	    	for (var y=this.Ymin; y<=this.Ymax; y++) {
	    		//for (int y=0; y<dstH_; y++) { // se si vuole l'affinacamento verticale
	    		for (var x=0; x<dstW_; x++) {
	        //for (var y=this.Ymax; y<=this.Ymax+4; y++) {
	        //	  for (var x=0; x<4; x++) {
	    			dstX = x ;
	    			dstY = y+int(posy) ;
	    			if( (dstX>=0) && (dstX<dstW_) && (dstY>=0) && (dstY<dstH_) ) {
	    				// durante il ciclo sulle x, srcX ripassa piu' volte sugli stessi
	    				// pixels dell'immagine sorgente, come risultato, l'immagine sorgente
	    				// si ripete orizzontalmente
	    				// posx in questo caso (parallax) rappresenta lo SHIFT
	    				srcX = ( x+int(posx) ) % this.w;
	    				// durante il ciclo sulle y, srcY ripassa piu' volte sugli stessi
	    				// pixels dell'immagine sorgente, come risultato, l'immagine sorgente
	    				// si ripete verticalmente
	    				srcY = y % this.h;
	    				indexSrc = srcX + srcY *this.w;
	    				indexDst = dstX + dstY*dstW_;
	    				//if(bDebug) console.log("("+x+", "+y+") - srcIdx: "+indexSrc+" ---> dstIdx: "+indexDst+"; "+parent.idxChiave+" ---> (idxSprite: "+this.indexes[ indexSrc ]+", offset: "+offset_+")");
	    				if( this.indexes[ indexSrc ] != parent.idxChiave )
	    					mainIdx_[ indexDst ] = this.indexes[indexSrc]+(offset_-1); 
	    				
	    			}
	    		}
	    	}
	    }	
	}  
	
	// SPRITE DEBUG //////////////////////////////////////////////////////
	Sprite.prototype.debug = function() {
		if(bDebug) console.log(this.indexes.length);
		//if(bDebug) console.log(this.indexes);
	}
	
	// ACTOR COSTRUTTORE /////////////////////////////////////////////////
	function Actor() {
		if(bDebug) console.log("## ACTOR COSTRUTTORE ##");
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
	};
	
	// ACTOR INIT ////////////////////////////////////////////////////////
	// il costruttore per la classe attore prende come parametri
	// - il nome del file JSON su cui sono memorizzati i dati
	// - le dimensioni dell'immagine di destinazione DST
	// - posizione x e y 
	Actor.prototype.init = function(url_, dati_, dstW_, dstH_, pos_, mainPal_) {
	//Actor.prototype.init = function(name_, dstW_, dstH_, pos_, mainPal_) {
		//console.log(this.pos+" - "+pos_);
		
	    if(bDebug) console.log("\n## ACTOR ## ");
	    if(bDebug) console.log("## Inizializzazione dell Actor ##");
	    
	    this.cost = new Costume();
	    //this.cost = new Costume(name_, mainPal_);
	    this.cost.init(url_, dati_, mainPal_);
	    
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
	    this.integrale1 = new Integrale(); // il calcolo dell'indice di sprite da mostrare;
	    this.integrale1.init();
	    this.integrale2 = new Integrale(); // il calcolo dello spostamento latarale dell'attore
	    this.integrale2.init();
	    
	    this.calcolaVelocita( this.vel );
	    if(bDebug) console.log("## ACTOR INIT - FINE ##");
	}

	
	// ACTOR UPDATE //////////////////////////////////////////////////////
	Actor.prototype.update = function() {
		if(bDebug) console.log("ACTOR UPDATE");
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
	    this.index = int( ( this.index + indexIntero) % this.N );
	    
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
	}
	
	// ACTOR DISPLAY /////////////////////////////////////////////////////
	//void display(int[] mainIdx_) {
	Actor.prototype.display = function ( mainIdx_ ) {
		if(bDebug) console.log("ACTOR DISPLAY");
		// facci un nuovo disegno soltanto se è necessario
		//if( this.bRefresh ) {
	    	this.cost.display(mainIdx_, this.index, int( this.pos[0] ), int( this.pos[1] ), this.direction, this.dstW, this.dstH);
	    	//this.bRefresh = false;
		//}
	}
	
	Actor.prototype.interfaceDebug = function() {
		this.cost.interfaceDebug();
	}
	
	// ACTOR SHIFT PALETTE ///////////////////////////////////////////////
	Actor.prototype.shiftPalette = function(amt0to1_ /* float*/, dstPal_) {
		this.cost.shiftPalette(amt0to1_, dstPal_);
	}

	// ACTOR CALCOLA VEL /////////////////////////////////////////////////
	Actor.prototype.calcolaVelocita = function(vel_) {
		// data la velocità pixel/secondo
	    // ottengo la velocità pixel/sprite
		this.velS = int( ( vel_/1000.0 )*( this.T / this.N) );
	    // ottengo la velocità pixel/ciclo
		this.velC = int( ( vel_/1000.0 )*this.T );
	    //console.log("pixel/secondo: "+this.vel+"; pixel/ciclo: "+this.velC+"; pixel/sprite: "+this.velS+";");
	}
	
	// ACTOR SET VEL /////////////////////////////////////////////////////
	Actor.prototype.setVel = function(vel_ /*float*/) {
		// in ingresso abbiamo un valore espresso in pixel/secondo
	    this.vel = vel_;
	    if( this.vel >= 0)
	    	this.direction = -1;
	    else
	    	this.direction = 1;
	    this.calcolaVelocita( this.vel );
	}
	
	// PARALLAX COSTRUTTORE //////////////////////////////////////////////
	// class Parallax {
	function Parallax() {
		if(bDebug) console.log("## PARALLAX COSTRUTTORE ##");
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
	}

	// PARALLAX INIT /////////////////////////////////////////////////////
	// la funzione init per la classe parallax prende come parametri
	// - il nome del file JSON su cui sono memorizzati i dati
	// - le dimensioni dell'immagine di destinazione DST
	// - posizione x e y 
	// Actor.prototype.init = function(url_, dati_, dstW_, dstH_, pos_, mainPal_) {
	//Parallax(url_, dati_, dstW_, dstH_, dist_, pos_, mainPal_) {
	Parallax.prototype.init = function (url_, dati_, dstW_, dstH_, dist_, pos_, mainPal_) {
		if(bDebug) console.log("## PARALLAX INIT ## ");
	    
	    this.dstW = dstW_;
	    this.dstH = dstH_;
	    this.pos.splice(0, 1, pos_[0] );
	    this.pos.splice(1, 1, pos_[1] );
	    // la distanza del parallax dal piano di fondo
	    this.dist = dist_;
	      
	    this.cost = new Costume();
	    //cost = new Costume(name_, mainPal_);
	    this.cost.init(url_, dati_, mainPal_);
	    
	    // ottienei informazioni dal COST
	    this.T = this.cost.getT(); // ottieni da costume il valore di tempo per l'animazione
	    this.wSp = this.cost.getWSprite(); // ottengo la larghezza della singola sprite
	    
	    //this.oldPos = this.pos;
	    //this.index = 0;
	    //this.oldIndex = this.index;
	    
	    // costruisco un integrale
	    this.integrale1 = new Integrale();
	    this.integrale1.init();

	    this.lastTime = Date.now();
	    
	    if(bDebug) console.log("## PARALLAX INIT FINE ##");
	}

	// PARALLAX UPDATE ///////////////////////////////////////////////////
	Parallax.prototype.update = function() {
	    // faccio l'update solo per quei livelli di parallasse che si trovano
	    // distanti dal piano di fondo, il quale, non muovendosi affatto
	    // non ha bisogno che venga fatto alcun calcolo per lui
		if(bDebug) console.log("PARALLAX - UPDATE");
		if(bDebug) console.log("\t la distanza del parallasse attuale è: "+this.dist+";");
	    if(this.dist > 0) {
	    	// tempo trascorso dall'ultimo GAMELOOP
	    	this.actualTime = Date.now();
	    	this.elapsedTime = this.actualTime - this.lastTime;
	    	//if(bDebug) console.log("PARALLAX - UPDATE 2: "+this.actualTime+", "+this.elapsedTime+", "+this.lastTime+";");
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
	    	//if(bDebug) console.log("PARALLAX - UPDATE 3: wSp:"+this.wSp+", "+amount+", "+velIntera+", "+this.shift+";");
	    }  
	}
	
	
	Parallax.prototype.interfaceDebug = function() {
		this.cost.interfaceDebug();
	}
	
	
	// PARALLAX DISPLAY //////////////////////////////////////////////////
	//void display(int[] mainIdx_) {
	Parallax.prototype.display = function ( mainIdx_ ) {
		if(bDebug) console.log("PARALLAX - DISPLAY");
		//console.log("shift: "+this.shift+";");
	    this.cost.display(mainIdx_, this.index, this.shift, int( this.pos[1] ), this.direction, this.dstW, this.dstH);
	}
	
	// PARALLAX SET VEL //////////////////////////////////////////////////
	Parallax.prototype.setVel = function( vel_ /*float*/) {
	    // in ingresso abbiamo un valore espresso in pixel/secondo
	    this.vel = vel_;
	}

	// PARALLAX GETTERS //////////////////////////////////////////////////
	Parallax.prototype.getDist = function() {
		return this.dist;
	}
	
	// PARALLAX SHIFT PALETTE ////////////////////////////////////////////
	//void shiftPalette(float amt0to1_, Palette dstPal_) {
	Parallax.prototype.shiftPalette = function( amt0to1_ /*float*/, dstPal_) {
		//console.log("PARALLAX - SHIFT PALETTE: amt0to1: "+amt0to1_+"; dstPal: "+dstPal_)
		this.cost.shiftPalette(amt0to1_, dstPal_);
	}
	

	// INTEGRALE COSTRUTTORE /////////////////////////////////////////////
	function Integrale() {
		if(bDebug) console.log("## INTEGRALE COSTRUTTORE ##");
		this.cumulativo = 0.0; // (float)
	};
	
	// INTEGRALE INIT ////////////////////////////////////////////////////
	Integrale.prototype.init = function() {
		if(bDebug) console.log("## INTEGRALE INIT ##");
		// do nothing
	}

	// INTEGRALE INTEGRA /////////////////////////////////////////////////
	Integrale.prototype.integra = function(value) {
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
	    		return int( result );
	    	}
	    }
	    // ritorno direttamente il valore se questo è 
	    // maggiore di 1
	    return int( value );
	};	
	
	// OROLOGIO COSTRUTTORE //////////////////////////////////////////////
	function Orologio() {
		if(bDebug) console.log("## OROLOGIO COSTRUTTORE ##");
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
	};

	// OROLOGIO INIT /////////////////////////////////////////////////////
	Orologio.prototype.init = function() {
		if(bDebug) console.log("## OROLOGIO INIT ##")
		this.integrale1 = new Integrale();
		this.integrale1.init();
		
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
	}
	
	// OROLOGIO UPDATE WITH INTERFACE ////////////////////////////////////
	Orologio.prototype.updateWithInterface = function (pos_, r_) {
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
	    secsL = int(r*0.8);
	    minsL = int(r*0.8);
	    hoursL= int(r*0.6);
	    // lo spessore delle 3 lancette
	    secsW = 1;
	    minsW = weight/2;
	    hoursW= weight;
	    // la posizione delle 3 lancette 
	    secsPos.set(  secsL*cos(  secsAngle  ), secsL*sin(  secsAngle  ) );
	    minsPos.set(  minsL*cos(  minsAngle  ), minsL*sin(  minsAngle  ) );
	    hoursPos.set( hoursL*cos( hoursAngle ), hoursL*sin( hoursAngle ) );
	    */
	}
	
	// OROLOGIO UPDATE ///////////////////////////////////////////////////
	// solo la parte logica, senza intefaccia
	Orologio.prototype.update = function() {
		if(bDebug) console.log("OROLOGIO UPDATE");
		// LOGICA *********************************************************
		this.actualTime = Date.now();
		this.elapsedTime = this.actualTime - this.lastTime;
		this.lastTime = this.actualTime;
		//console.log("OROLOGIO - UPDATE: last: "+this.lastTime+"; actual: "+this.actualTime+"; elasped: "+this.elapsedTime+";");
		this.secsTot += this.integrale1.integra( (this.elapsedTime*this.timeWarp)/1000.0 );
		//console.log(this.secsTot);
		if( this.secsTot < 0 )
			this.secsTot = 86400 + this.secsTot;
			      
		this.secs = int( this.secsTot % 60 );
		this.mins = int((this.secsTot / 60) % 60 );
		this.hours= int( this.secsTot / 3600 );
			    
		// il numero di secondi in una intera giornata
		this.secsTot %= 86400;
		//printTime();
	}

	// OROLOGIO GET NORMALIZED AMOUNT ///////////////////////////////////
	Orologio.prototype.getNormalizedAmount = function () {
		if(bDebug) console.log("OROLOGIO GET NORMALIZED AMOUNT");
		// mentre il tempo fluisce,
	    // il valore ritornato è sempre un valore positivo
	    // 0 <= NORMALIZED OUTPUT < 1 (da notare che il valore estremo
	    // superiore 1 non viene mai raggiunto).
	    // questo proprio perchè secsTot è modulato con il valore 86400.
		return (this.secsTot / 86400.0);
	}
	
	// OROLOGIO SET TIME WARP ///////////////////////////////////////////
	// void setTimeWarp(float timeWarp_) {
	Orologio.prototype.setTimeWarp = function ( timeWarp_ ) {
	    this.timeWarp = timeWarp_;
	    //println(timeWarp);
	    //console.log("il valore di warp attuale: "+this.timeWarp);
	}
	
	// OROLOGIO PRINT TIME //////////////////////////////////////////////
	//void printTime() {
	Orologio.prototype.printTime = function() {
	    // mostro a console la stringa formattata con l'orario
	    //console.log("secondi totali: "+int(this.secsTot)+" - "+int(this.hours)+":"+int(this.mins)+":"+int(this.secs) );
	    console.log("secondi totali: "+this.secsTot+" - "+this.hours+":"+this.mins+":"+this.secs );
	}
	
	// FRAMECOUNT CLASS /////////////////////////////////////////////////
	function Framecount() {
		if(bDebug) console.log("## FRAMECOUNT COSTRUTTORE ##");
		this.actualTime = 0; 
		this.elapsedTime = 0; 
		this.lastTime = 0;
		this.initialTime = 0;
		this.secondsSoFar = 0; // secondi trascorsi dall'avvio del programma
		this.currentFrame = 0;
		this.lastFrames = 0;
		this.totalFrames = 0;
		this.avg = 0;
	};
	
	// FRAMECOUNT INIT //////////////////////////////////////////////////
	Framecount.prototype.init = function() {
	    if(bDebug) console.log("## FRAMECOUNT INIT ##");
	    this.initialTime = Date.now();
	    this.lastTime = this.initialTime;

	    
	    // visaulizzazione sulla pagina web *****************************
	    var html = '<div id="debug_framecount">waiting for frames...</div>'
        var div = document.createElement('div');
        div.id = 'framecounter';
       	// per tutto quello che riguarda lo stile, vedere il file CSS
        div.innerHTML = html;
        if(bShowFramecounter)
        	div.style.display = "block";
        else 
        	div.style.display = "none";
        document.getElementsByTagName('body')[0].appendChild(div);
	}
	
	// FRAMECOUNT UPDATE ////////////////////////////////////////////////
	Framecount.prototype.update = function() {
	    this.actualTime = Date.now();
	    this.elapsedTime = (this.actualTime - this.lastTime);

	    if( this.elapsedTime >= 1000) {
	    	// e' trascorso un secondo
	    	this.elapsedTime %= 1000;
	    	this.lastTime = this.actualTime;
	      
	    	if( this.secondsSoFar != 0) 
	    		this.avg = this.totalFrames / this.secondsSoFar;
	    	else
	    		this.avg = this.lastFrames;
	      
	    	
	    	this.lastFrames = this.currentFrame;
	    	this.totalFrames += this.lastFrames;
	    	this.currentFrame = 0;
	    	this.secondsSoFar ++;
	    	//printValues(); 
	    } else {
	    	this.currentFrame ++;
	    }
	    //printValues();
	    
	    // visaulizzazione sulla pagina web *****************************
	    //if( bShowFramecounter ) {
	    	var div = document.getElementById("debug_framecount");
	    		if(div) {
	    			//var decimaliTroncati = trunc(this.avg, 3); /*( Math.round(this.avg * 1000) ) / 1000;*/
	    			var html = '';
                    html += '<table><tr><td colspan="2" align="left"><b><u>FPS</u></b></td></tr>';
                    html += '<tr><td align="right"><b>Avg:</b></td><td align="left"><i>'+ this.avg.toFixed(3) +'</i></td></tr>';
                    html += '<tr><td align="right"><b>Sec:</b></td><td align="left"><i>'+ this.lastFrames +'</i></td></tr>';
                    html += '<tr><td align="right"><b>Cur:</b></td><td align="left"><i>'+ this.currentFrame +'</i></td></tr>';
                    html += '</table>';

                    div.innerHTML = html;
                } // if div
         //   } // if visible
	}
	
	// UTILITY /////////////////////////////////////////////////////////////
	function int(value) {
		// come il casting a int che avviene in Processing
		if(value >= 0)
			return Math.floor( value );
		return Math.ceil( value );
	}
	
	function checkProgress() {
		var p = (nImgLoaded / nImg) * 100;
		var indicator = document.getElementsByClassName("indicator")[0];
		indicator.style.width = p+"%";
		//console.log("progredisco, p: "+p);
		if( p == 100){
			var progress = document.getElementsByClassName("progress")[0];
			progress.style.display = "none";
		} else {	
			window.setTimeout(checkProgress, 30);
		}
	}
	
	// al posto di trunc si può usare la funzione toFixed() della classe Number()
	function trunc(value, precision) {
		var prec = Math.pow(10, precision);
		return ( Math.round(value * prec) ) / prec;
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
	function loadImage(name, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status === 200) {
					if( callback )
						callback( name, JSON.parse(xhr.responseText) );
				} else {
					if(bDebug) console.log("E'avvenuto un errore nella richiesta");
				}
			}
		};
		// carico i dati dal file JSON il cui nome è passato come parametro
		xhr.open("GET", name, true);
		xhr.send();
	}
	*/
	
	
	function loadImgFromJson(src, callbackFunc) {
		if( imgCache.hasOwnProperty(src) ) {
			if(bDebug) console.log("l'immagine "+src+" è già presente in cache");
			return;
		}
		var xhr = new XMLHttpRequest();
		nImg ++;
		imgCache[src] = false;
		if(bDebug) console.log("creo la proprietà "+src+" nella IMAGE CACHE;");
		if( callbackFunc )
			callbacks.push(callbackFunc);
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status === 200) {
					if(bDebug) console.log("richiesta al server avvenuta CORRETTAMENTE!");
					if(bDebug) console.log("immagine "+src+" caricata;");
					nImgLoaded++;
					imgCache[src] = JSON.parse(xhr.responseText);
					if( isReady() ) {
						// quanto segue viene chiamato solo al caricamento
						// completato per tutte le immagini
						if(bDebug) console.log("tutte le immagini sono state caricate in cache");
						executeCallbacksQueue();
					}
				} else {
					if(bDebug) console.log("E'avvenuto un errore nella richiesta");
				}
			}
		};
		// carico i dati dal file JSON il cui nome è passato come parametro
		xhr.open("GET", src, true);
		xhr.send();
	}
	
	function isReady() {
		// ready resta vero se tutte le immagini sono state
		// correttamente caricate in cache
		var ready = true;
		for(var property in imgCache){
			if( !imgCache[property] )
				ready = false;
		}
		return ready;
	};
	
	function executeCallbacksQueue() {
		var nextFunc = callbacks[0];
		// valuto se nextFunc esiste e se non è UNDEFINED
		// (convertendola a boolean e non eseguendola!!)
		if( nextFunc ) {
			if(bDebug) console.log("Ok, la prossima funzione precedentemente registrata è eseguibile!");
			nextFunc(); // la eseguo
			callbacks.shift();
			executeCallbacksQueue(); // provo ad eseguire altre funzioni dalla coda
		} else {
			if(bDebug) console.log("Non ci sono più callback registrati");
		}
	};
	
	// funzioni di prova
	function printLoadingProcess() {
		if(bDebug) console.log("LOADING PROCESS FUNC: Ho "+Object.keys(imgCache).length+" proprietà nella IMAGE CACHE, che sono:");
		for(var property in imgCache){
			if(bDebug) console.log(property);
			console.log( imgCache[property] );
		}
	}
		
	interfaceCreatePaletteContainer = function(identificativo, refPal) {
		var container = document.createElement("div");
		container.innerHTML = "<p>"+identificativo+"</p>";
		container.className = "palette";
		
		// setto la proprietà visibile solo se la variabile booleana lo permette
		if(bShowPalettes)
			container.style.display = "block";
		else
			container.style.display = "none";
		
		container.id = identificativo;
		document.body.appendChild(container);
		
		// creo le entry da inserire all'interno del container
		for(var e=0; e<refPal.nColors; e++) {
			var entry = document.createElement("div");
			entry.className = "entry";
			entry.id = e;
			entry.style.backgroundColor = "rgb(0, 0, 0)";
			container.appendChild(entry);
		}
		// creo il separatore in modo da chidere il DIV della palette 
		// appean sotto alla posizione dell'ultima entry (vedi CSS)
		var separatore = document.createElement("hr");
		separatore.className = "clear";
		container.appendChild(separatore);
	}
	
	interfaceDisplayPalette = function(identificativo, refPal) {
		//console.log("interfaceDisplayPalette chiamata. bShowPalette è :"+bShowPalettes)
		//console.log("## UTILITY: display Palette ##");
		var palette = document.getElementById( identificativo );
		//console.log(palette);
		//console.log("la lunghezza della palette di cui faccio il debug è: "+refPal.colors.length )
		for(var e=0; e<refPal.colors.length; e++){
			var entry = palette.getElementsByClassName("entry")[e];
			entry.style.backgroundColor = "rgb("+refPal.colors[e][0]+","+refPal.colors[e][1]+","+refPal.colors[e][2]+")";
		}
	}
	
	
	// funzioni chiamabili da console per mostrare alcune utilità per il debug
	showPalettes = function() {
		bShowPalettes = !bShowPalettes;
		//console.log(bShowPalettes);
		var palettes = document.getElementsByClassName("palette");
		for(var i=0; i<palettes.length; i++){
			if(bShowPalettes)
				palettes[i].style.display = "block";
			else 
				palettes[i].style.display = "none";
		}
	}
	
	showFramecounter = function() {
		bShowFramecounter = !bShowFramecounter;
		var tab = document.getElementById("framecounter");
		if(bShowFramecounter)
			tab.style.display = "block";
		else 
			tab.style.display = "none";
	}
	
	pauseAnimation = function() {
		console.log("Pausa o NO");
		bPause = !bPause;
		if(!bPause)
			window.requestAnimationFrame(update);
	}
	
	// questa funzione viene chiamata ogni volta che avviene un ridimensionamento della finestra del browser
	windowResize = function() {
		var gc = document.getElementById("game-container");
		gc.style.height = (window.innerHeight - 2*((window.innerHeight - dstH)/3) )+"px";
		gc.style.width = window.innerWidth+"px";
		/*canvasTopX = ((window.innerWidth - dstW) / 2);
		canvasTopY = ((window.innerHeight - dstH) / 2);
		if( canvasTopX < 0) canvasTopX = 0;
		if( canvasTopY < 0) canvasTopY = 0;
		console.log("window resized ---> inner Dims ("+window.innerWidth+", "+window.innerHeight+"), canvas Dims ("+dstW+", "+dstH+"), x/y ("+canvasTopX+", "+canvasTopY+")");
		canvas.style.left = canvasTopX+"px";
		canvas.style.top = canvasTopY+"px";
		*/
	}
	
	
	// CLEAR //////////////////////////////////////////////////////////
	//void clear( int[] indexes, int idxEntry ) {
	function clear ( idxEntry ) {
		for (var i=0; i<mainIdx.length; i++) {
			mainIdx[i] = idxEntry;
		}
	}

	// DISPLAY DST ////////////////////////////////////////////////////
	// void displayDst( PImage dstImg_) {
	function displayDstImg() {	
		//println("\tDISPLAY");
		//dstImg_.loadPixels();
		//ctx.getImageData(dstImg);
		// ciclo nelle coordinate della immagine di destinazione
		var dstIdx = 0;
		var srcX   = 0;
		var srcY   = 0;
		var srcIdx = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		for(var y=0; y < dstH; y++) {
			for(var x=0; x < dstW; x++) {
		//for(var y=0; y < 4; y++) {
		//	for(var x=0; x < 4; x++) {
				
				dstIdx = x+y*dstW;
				srcX = int(x / factor);
				srcY = int(y / factor);
				srcIdx = srcX + srcY*imgW;
				r = mainPal.colors[ mainIdx[ srcIdx ] ][0];
				g = mainPal.colors[ mainIdx[ srcIdx ] ][1];
				b = mainPal.colors[ mainIdx[ srcIdx ] ][2];
				//dstImg_.pixels[i] = color(r, g, b);
				//console.log("("+x+", "+y+") - srcIdx: "+srcIdx+" ---> color("+r+", "+g+", "+b+") ---> dstIdx: "+dstIdx+"; ");
				dstImg.data[ dstIdx*4 + 0 ] = r;
				dstImg.data[ dstIdx*4 + 1 ] = g;
				dstImg.data[ dstIdx*4 + 2 ] = b;
				//dstImg.data[ dstIdx*4 + 3 ] = 255;
			}
		}
		//dstImg.updatePixels();
	  	ctx.putImageData(dstImg, 0, 0, 0, 0, dstW, dstH);
	}
	
	
	// VARIABILI VARIE ///////////////////////////////////////////////////
	// per fare debug e mostrare mesaggi a console
	var bDebug = false;
	// per il caricamento delle risorse
	var nImg = 0;
	var nImgLoaded = 0;
	var imgCache = {};
	var callbacks = [];
	// per il canvas e relativi
	var canvas, ctx;
	var dstW, dstH;
	var canvasTopX = 0; 
	var canvasTopY = 0;
	
	// per il funzionamento del gioco
	// LOGICA *********************************************************
	// tutto cio' che DEVE essere presente perchè tutti i meccanismi
	// funzionino correttamente
	var imgW = 320;
	var imgH = 240;
	
	var mainPal;
	var mainIdx = new Array(imgW * imgH);
	
	var framecounter;
	var orologio;
	var warpAmount = 967.574; // float
	var warp = 2000; //2000.0; // float

	var cavaliere;
	var livelli = [];
	
	var velFactor = 0.95; 	// (float)
	var velActor = -240;	// (int)
	var velCam;				// (int)
	var velActorApparent;	// (int)
	
	// INTERFACCIA GRAFICA ***********************************************
	var factor = 2;
	var bShowPalettes = false;
	var bShowFramecounter = false;
	var bPause = false;

	// INIT //////////////////////////////////////////////////////////////
	var init = function() {
		if(bDebug) console.log("INIT: preparo le funzioni di callback per i vari enventi");
		// collega all'evento RESIZE la funzione corrispondente
		window.addEventListener("resize", function() {
			windowResize();
		}, false);
		
		window.addEventListener("keydown", function(e) {
			e.preventDefault();
			var code = e.keyCode;
			var key;
			switch (code) {
				case 32:
					key = "SPACE";
					pauseAnimation();
					break;
				case 70:
					key = "F";
					showFramecounter();
					break;
				case 80:
					key = "P";
					showPalettes();
					break;
				default:
					key = String.fromCharCode(code);
					console.log(code+" - "+key);
			}
		}, false);
		
		window.addEventListener("keyup", function(e) {
			var code = e.keyCode;
			//do nothing
		}, false);
		
		if( !window.requestAnimationFrame ) {
			alert("Sorry! your browser doesn't sopport 'requestAnimationFrame' technology :(\nTry Firefox instead!");
			return;
			//window.requestAnimationFrame = function(callbak) { return window.setTimeout( function(){ callback(Date.now() - startTime); }, 1000/60  ); };
		}
		/*
		// polyfill per requestAnimationFrame ****************************
		window.requestAnimationFrame = (function() {
			var startTime = Date.now();
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callbak ) {
				   		return window.setTimeout( function() { callback(Date.now() - startTime); }, 1000/60  );
				   };
		})();
		*/
		
		// CANVAS e IMAGE DATAs ******************************************
		if(bDebug) console.log("INIT: preparo CANVAS, CONTEXT e IMAGEDATA");
		dstW = imgW * factor;
		dstH = imgH * factor;
		if(bDebug) console.log("DIMENSIONI DSTIMG: "+dstW+", "+dstH+";");
		canvas = document.createElement("canvas");
		if( !canvas.getContext ) {
			alert("Sorry! your browser doesn't sopport 'canvas' technology :(\nTry Firefox instead!");
			return;
		}
		ctx = canvas.getContext("2d");
		canvas.id = "game";
		canvas.innerHTML = "your browser doesn't support CANVAS element";
		canvas.width = dstW;
		canvas.height = dstH;
		
		// chiama la funzione che si occupa di posizionare gli elementi all'interno
		// della finestra del browser
		windowResize();

		var div = document.getElementById("game-container");
		div.appendChild(canvas);
		if( !ctx.createImageData ) {
			alert("Sorry! your browser doesn't sopport 'createImageData' technology :(\nTry Firefox instead!");
			return;
		}
		dstImg = ctx.createImageData(dstW, dstH);
		// dal momento che la una immagine creata con CREATE IMAGE DATA
		// ha tutti i valori ALPHA per i suoi pixels settati a opacità 0
		// devo provvedere a modificarli affinchè l'imagine finale possa 
		// essere visibile
		for(var y=0; y < dstH; y++) {
			for(var x=0; x < dstW; x++) {				
				dstIdx = x+y*dstW;
				dstImg.data[ dstIdx*4 + 3 ] = 255;
			}
		}
		
		// per visualizzare lo stato di progressione del loading risorse
		if(bDebug) console.log("INIT: creo la barra di progressione per monitorare il caricamento delle risorse");
		var progress = document.createElement("div");
		progress.className = "progress";
		progress.innerHTML = '<div class="indicator"></div>';
		div.appendChild(progress);
		
		// CALCOLI VARI **************************************************
		velCam = int(velFactor * velActor);
		velActorApparent = velActor - velCam;
		
		// MAIN PALETTE **************************************************
		if (bDebug) console.log("INIT: creo la MAINPAL");
		mainPal = new Palette(256, 0);
		mainPal.init();
		// settare eventuali colori prima di cominciare
		mainPal.setNextFreeColor(249, 0, 249);
		// mostro un debug prima di cominciare
		interfaceCreatePaletteContainer("mainPal", mainPal);
		
		// MAIN INDEXES *************************************************
		if (bDebug) console.log("INIT: creo MAINIDX");
		//mainIdx = new int[imgW * imgH];
		for(var i=0; i<mainIdx.length; i++) {
			// l'indice 0 nella palette è un colore di sfondo
			// o comunque un colore che possa essere utilizzato come puliza
			//mainIdx.push( 0 );
			mainIdx[i] = 0;
		}
		
		// Clock *****************************************************
		if (bDebug) console.log("INIT: creo l'OROLOGIO");
		orologio = new Orologio();
		orologio.init();
		//console.log("questo è il valore di warp iniziale: "+warp+";");
		orologio.setTimeWarp(warp);
		
		if (bDebug) console.log("INIT: creo il FRAMECOUNTER");
		framcounter = new Framecount();
		framcounter.init();
		
		
		if (bDebug) console.log("INIT: carico le risorse dai files JSON\n");
		loadImgFromJson("data/00_orari2.json", checkProgress );
		loadImgFromJson("data/01_orari.json", setup );
		loadImgFromJson("data/02_orari.json"); 
		loadImgFromJson("data/03_orari.json");
		//loadImgFromJson("data/sovra.json" );
		loadImgFromJson("data/spritesheet.json");
	}
	
	
	// SETUP /////////////////////////////////////////////////////////////
	var setup = function() {
		if (bDebug) console.log("SETUP: carico le risorse dai files JSON\n");
		// NOTA: nel chiamare il metodo init per il PARALLASSE o p er l'ATTORE
		// sto anche provvedendo alla creazione dei rispettivi elementi di interfaccia 
		// quali, ad esempio, i riquadri che si occuperanno di mostrare le varie LOCPALS 
		
		
		if (bDebug) console.log("SETUP: creo gli ATTORI e li inizializzo\n");
		// BG e PARALLASSE **********************************************
		var parallassePos = [0, 0];
		livelli.push( new Parallax() );
		livelli[0].init("data/00_orari2.json", imgCache["data/00_orari2.json"], imgW, imgH, 0, parallassePos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new Parallax() );
		livelli[1].init("data/01_orari.json", imgCache["data/01_orari.json"], imgW, imgH, 0.25, parallassePos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new Parallax() );
		livelli[2].init("data/02_orari.json", imgCache["data/02_orari.json"], imgW, imgH, 0.5, parallassePos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new Parallax() );
		livelli[3].init("data/03_orari.json", imgCache["data/03_orari.json"], imgW, imgH, 1, parallassePos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);
		
		//var quintePos = [0, 140];
		//livelli.push( new Parallax() );
		//livelli[4].init("data/sovra.json", imgCache["data/sovra.json"], imgW, imgH, 1.25, quintePos, mainPal);
		//mainPal.setNextFreeColor(249, 0, 249);
		
		for (var j=0; j<livelli.length; j++) {
			livelli[j].setVel( velCam );
		} 
		
		// ATTORI *******************************************************
		var actorPos = [160, 120];
		cavaliere = new Actor();
		cavaliere.init("data/spritesheet.json", imgCache["data/spritesheet.json"], imgW, imgH, actorPos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);
		cavaliere.setVel( velActorApparent );

		//window.setInterval(update, 42);
		//update();
		window.requestAnimationFrame(update);
	}

	// UPDATE ////////////////////////////////////////////////////////////
	function update() {
		if (bDebug) console.log("UPDATE\n");
		
		// LOGICA *******************************************************
		if (bDebug) console.log("UPDATE: update di framecounter, orologio e attori");
		framcounter.update();
		
		if(!bPause) {
			orologio.update();
			for (var j=0; j<livelli.length; j++) {
				livelli[j].update();
			}
			cavaliere.update();
		}
		
		// PALETTE SHIFTING *********************************************
		if(bDebug) console.log("UPDATE: operazioni di PALETTE SHIFTING\n");
		for (var j=0; j<livelli.length; j++) {
			livelli[j].shiftPalette( orologio.getNormalizedAmount() , mainPal );
		}
		cavaliere.shiftPalette( orologio.getNormalizedAmount() , mainPal );
		  
		//if(bDebug) console.log("UPDATE: operazioni di COLOR CYCLING\n");
		// COLOR CYCLING ************************************************
		// eventuali operazioni legate al color cycling
		
		/*
		// debug momentaneo per capire se il primo colore utile della prima palette 
		// del primo livello di parallasse cambia nel tempo o meno. Dovrebbe rimanere 
		// sempre uguale a se stesso ma controlliamo
		//var r = livelli[0].cost.pals[0].colors[1][0];
		//var g = livelli[0].cost.pals[0].colors[1][1];
		var mcolor = mainPal.colors[2][1];
		var btocheck = livelli[0].cost.pals[0].colors[2][1];
		var b1 = livelli[0].cost.pals[1].colors[2][1];
		var b2 = livelli[0].cost.pals[2].colors[2][1];
		var b3 = livelli[0].cost.pals[3].colors[2][1];
		var b4 = livelli[0].cost.pals[4].colors[2][1];
		var b5 = livelli[0].cost.pals[5].colors[2][1];
		var b6 = livelli[0].cost.pals[6].colors[2][1];
		var b7 = livelli[0].cost.pals[7].colors[2][1];
		//console.log("MAIN["+mcolor+"] ---> "+btocheck+", "+b1+", "+b2+", "+b3+", "+b4+", "+b5+", "+b6+", "+b7+";");
		*/
		
		draw();
	}

	// DRAW //////////////////////////////////////////////////////////////
	function draw() {	
		if(bDebug) console.log("DRAW\n");
		
		// INTERFACCIA: mostro le varie palettes **************************
		if(bDebug) console.log("DRAW: aggiorno l'interfaccia mostrando le varie palette ed enties\n");
		//livelli[0].cost.debug();
		if(bShowPalettes) {
			// mostro in interfaccia lo stato della MAIN PAL
			interfaceDisplayPalette("mainPal", mainPal);
			// mostro in interfaccia lo stato della LOCPALS per i vari attori
			// anche se (IN TEORIA) le palettes locali non DEVONO cambiare nel tempo
			for (var j=0; j<livelli.length; j++) {
			    livelli[j].interfaceDebug();
			}
			cavaliere.interfaceDebug();
		}
		
		// PULIZIA *******************************************************
		if(bDebug) console.log("DRAW: clear\n");
		// a ben vedere la pulizia non è affatto necessaria
		//var entry = 0;
		//clear( entry );

		if(bDebug) console.log("DRAW: chiamo DISPLAY per ogni ATTORE\n");
		// PARALLASSE POSTERIORI ****************************************
		for (var j=0; j<livelli.length; j++) {
		    if ( livelli[j].getDist() <= 1 ) {
		      livelli[j].display( mainIdx );
		    }
		}
		
		// FOCUS ********************************************************
		cavaliere.display( mainIdx );
		
		// LE QUINTE ****************************************************
		for (var j=0; j<livelli.length; j++) {
		    if ( livelli[j].getDist() > 1 ) {
		      livelli[j].display( mainIdx );
		    }
		}
		
		if(bDebug) console.log("DRAW: visualizzo IMGDATA\n");
		displayDstImg();

		window.requestAnimationFrame(update);
	}

	
	
	return {
		init : init
	};
})();