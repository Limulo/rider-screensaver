// COSTUME CLASS /////////////////////////////////////////////////////
main.Costume = main.utility.defineClass({
	name: "Costume",
	init: function(name_, jsonFile, dstPal_) {
		if(main.bDebug) console.log("## COSTUME COSTRUTTORE ##");
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
		this.sprites; //= new Array();
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
		// COSTUME INIT //////////////////////////////////////////////////////
		this.fileName = name_;
		if(main.bDebug) console.log("## COSTUME INIT ("+this.fileName+") ##");
		// supporti per l'estrazione dei dati dal file JSON
			
		if(main.bDebug) console.log("COST: il colore chiave è: "+this.idxChiave);
			
		if(main.bDebug) console.log("COST: l'array descritto dal file JSON caricato contiene "+jsonFile.length+" elemento." );
		// W e H per lo SPRITESHEET ***********************************
		this.w = jsonFile[0]["width"];
		this.h = jsonFile[0]["height"];
		if(main.bDebug) console.log("COST: l'immagine ha dimensioni: "+this.w+"x"+this.h+";");
			
		// Quante SPRITE nello SPRITESHEET ****************************
		// trovo quante sono le sprite descritte dal file JSON
		this.nSprites = jsonFile[0]["nSprites"];
		if( this.nSprites > 1) {
			if(main.bDebug) console.log("COST: il file JSON e' uno spritesheet che contiene "+this.nSprites+" sprites;");
		} else {
			if(main.bDebug) console.log("COST: il file JSON descrive solo "+this.nSprites+" immagine;");
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
			if(main.bDebug) console.log("COST: impostazione di default per T ("+this.animationTime+" ms);");
		} else {
			if(main.bDebug) console.log("COST: la durata del ciclo di animazione rappresentato nello spritesheet e' di "+this.animationTime+" ms;");
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
		if(main.bDebug) console.log("COST: l'immagine contiene "+this.nPals+" palettes da "+this.nC+" colori ciascuna (compresa la chiave)");
		var nColors = -1;
		//this.pals;
		for(var ip=0; ip<this.nPals; ip++) {
			var jsonPalette = jsonPals[ip];
			nColors = jsonPalette.length;
			if(main.bDebug) console.log("COST: esamino la palette "+ip+", che ha "+nColors+" colori;");
			if(nColors != this.nC) {
				if(main.bDebug) console.log("COST: Attenzione! I numeri di colori tra le palettes differisce - controlla il file JSON");
			}
			// creo le palettes locali LOCPALs
			// NOTA: le LOCPALs contengono il colore chiave.
		    // Quando invece le si copia nelle SHADOW PALETTE, 
		    // il colore di chiave viene tralasciato
		    //var paletta = new Palette(this.nC, this.idxChiave);
		    //this.pals.push( paletta );
		    var newLocalPalette =  new (main.Palette)(this.nC, this.idxChiave);
		    //newLocalPalette.init();
		    
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
		    main.interfaceCreatePaletteContainer(paletteIdentifier, this.pals[ip]);
		 }
		 		
		 // TRASFERIMENTO della LOCPAL alla MAINPAL ********************
		 // al momento viene trasferita nella MAINPAL solo la palette di 
		 // indice 0, la prima di quelle che il COST possiede
		 this.paletteOffset = this.pals[0].transferTo( dstPal_ );
		 if(main.bDebug) console.log("COST: al termine del trasferimento posso referenziare i colori in palette grazie a 'paletteOffset' = "+this.paletteOffset+";");
		
		 // SPRITES ****************************************************
		 if(main.bDebug) console.log("COST: mi occupo ora delle SPRITE");
		 this.wSprite = main.utility.int(this.w / this.nSprites);
		 this.hSprite = this.h;
		 // creo tante SPRITE quante indicate dal file JSON
		 for(var is=0; is<this.nSprites; is++) {
			 var newSprite = new (main.Sprite)( this.wSprite, this.hSprite, bAnimation);
			 //newSprite.init();
			 newSprite.debug();
			 
			 //this.sprites.push( newSprite );
			 this.sprites[is] = newSprite; 
		 }
		 
		 // SPRITE IDX *************************************************
		 if(main.bDebug) console.log("COST: mi occupo ora dell'array di indici");
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
		        var is = main.utility.int(xss / this.wSprite); // indice della sprite su cui andare a copiare i dati 
		        var offsetSS = xss + yss*this.w;
		        var offsetSP = xsp + ysp*this.wSprite;
		        this.sprites[is].indexes[offsetSP] = jsonIndexes[offsetSS] ;
		        //sprites[is].indexes[offsetSP] = jsonIndexes.getInt(offsetSS);
		    }
		 }
		 if(main.bDebug) console.log("QUI SOTTO tutte le sprite del COST corrente");
		 if(main.bDebug) console.log(this.sprites);
		 
		 
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
    	 // fine della funzione INIT
	},
	methods: {
		// COSTUME DISPLAY //////////////////////////////////////////////
		// - mainIdx
		// - indice della sprite da mostrare
		// - posizioni X e Y
		// - direzione (per calcolare un eventuale FLIP
		// - dimensioni dell'immagine di destinazione
		//void display(int[] indexes_, int is_, int x_, int y_, int direction_, int dstW_, int dstH_) {
		display : function (indexes_, is_, x_, y_, direction_, dstW_, dstH_) {
			if(main.bDebug) console.log("COST - DISPLAY");
			//if(main.bDebug) console.log("is: "+is_+", x/y ("+x_+", "+y_+"), dir: "+direction_+", dstW/H ("+dstW_+", "+dstH_+");");
			// alla sprite passo un riferimento al costume corrente, suo PARENT
		    this.sprites[ is_ ].display(indexes_, this.paletteOffset, this, x_, y_, direction_, dstW_, dstH_);
		},
		
		// COSTUME SHIFT PALETTE ////////////////////////////////////////
		shiftPalette : function( amt0to1_ /*float*/, dstPal_ ) {
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
		    	this.idxH = (this.idxL + 1) % main.utility.int(range);
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
		    		rI = main.utility.int( main.utility.linearInterpolation( amongAmount, rL, rH) );
		    		gI = main.utility.int( main.utility.linearInterpolation( amongAmount, gL, gH) );
		    		bI = main.utility.int( main.utility.linearInterpolation( amongAmount, bL, bH) );
		        
		    		dstPal_.setColor( (e + this.paletteOffset - 1), rI, gI, bI);   
		    	}
		    } else {
		    	// il range è 1 o inferiore: significa che la sprite ha una sola palette colori
		    	// disponibile. Questo non rende possibile alcun palette shifting
		    	// do nothing
		    	//console.log("COST: per la sprite corrente non esistono Palette multiple tra le quali shiftare!");
			}
		},
		
	    // COSTUME GETTERS //////////////////////////////////////////////
	    getN : function() {
	      // restituisco il numero di sprite nello spritesheet
	      return this.nSprites;
	    },
	    
	    getNPals : function() {
	      // restituisco il numero di Palettes
	      return this.nPals;
	    },
	    
	    getWSprite : function() {
	      // restituisco la larghezza della singola sprite
	      return this.wSprite;
	    },
	    
	    getT : function() {
	      // restituisco la larghezza della singola sprite
	      return this.animationTime;
	    },
	    
	    // COSTUME DEBUG /////////////////////////////////////////////////////
	    interfaceDebug : function() {
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
	    		main.interfaceDisplayPalette(idPalette, this.pals[ip] );
	    	}
	    }
	} // fine dei metodi per la classe
});
	
	
	  

    
    