// SPRITE CLASS //////////////////////////////////////////////////////
main.Sprite = main.utility.defineClass({
	name : "Sprite",
	init : function(w_, h_, bType_) {
		if(main.bDebug) console.log("## SPRITE COSTRUTTORE ##");
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
		
		// SPRITE INIT ///////////////////////////////////////////////////////
		if(main.bDebug) console.log("## SPRITE INIT ##");
		// inizializzo tutti gli indici al valore 0 che,
	    // quando provvederemo a standardizzare la cosa
	    // potrebbe essere il colore di chiave
		//var length = this.w * this.h;
		for(var i=0; i<this.indexes.length; i++) {
			//this.indexes.push( 0 );
			this.indexes[i] = 0;
		}
		if(main.bDebug) console.log("SP: creata una nuova Sprite "+this.w+"x"+this.h+" ("+this.indexes.length+" indici)");
		if(this.bAnimation)
			if(main.bDebug) console.log("SP: la sprite fa parte di una animazione");
		else
			if(main.bDebug) console.log("SP: la sprite è un elemento del BG o un Parallasse");
	
	},
	methods : {
		// SPRITE OPTIMIZE //////////////////////////////////////////////////
		optimize : function( parentCostume ) {
			// ricevo il Costume parent dal quale prelevare il colore chiave.
		    if(main.bDebug) console.log("SP OPTIMIZE: ottimizzazione della SPRITE");
		    // OTTIMIZZAZIONE 1 *******************************************
		    // posso facilmente stabilire tra quali valori (minimo e massimo) per
		    // i 2 assi X e Y esistano all'interno della sprite pixel utili.
		    // Con questi 2 valori memorizzati potro preoccuparmi di ciclare
		    // soltanto tra queste due coordinate.
		    // imposto le coords ottimizzate ai valori più estremi e poi 
		    // controllo i pixel della seorgente per modificarli
		    if(main.bDebug) console.log("\tSP: sprite: "+this.w+", "+this.h+", bounding box: ("+this.Xmin+", "+this.Ymin+") - ("+this.Xmax+", "+this.Ymax+"), parentChiave: "+parentCostume.idxChiave+";");
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
		    if(main.bDebug) console.log("\tSP: NEW bounding box: ("+this.Xmin+", "+this.Ymin+") - ("+this.Xmax+", "+this.Ymax+")");
		    // OTTIMIZZAZIONE 2 *******************************************
		    // calcoliamo ratio (rapporto tra pixel utili e pixel di chiave)
		    var area = (this.Xmax - this.Xmin + 1) * (this.Ymax - this.Ymin +1);
		    var unuseful = area - this.useful;
		    if( unuseful > 0) {
		    	var ratio = this.useful / unuseful ;
		    	if(main.bDebug) console.log("\tSP: useful: "+this.useful+"; un-useful: "+unuseful+"; ratio: "+ratio+";");
		    } else {
		    	if(main.bDebug) console.log("\tSP: gli indici sono tutti associati a pixels diversi dal colore di chiave!");
		    }
		    // per ora non implemento un metodo di display che funzioni con
		    // ottimizzazione 2 avvenuta. Mi limito a mostrare i dati sul
		    // numero di pixel utili, inutili e rratio a titolo di info.
		},
		
		// SPRITE DISPLAY ///////////////////////////////////////////////////
		// questo metodo ha lo scopo di aggioranre gli indici di MAINIDX
		// su base delle informazioni contenute nell'array di indici per la SPRITE.
		// Nel caso invece si opti per fornire al metodo accesso diretto ai
		// pixel di DSTIMG, si avrà bisogno di combinare queste informazioni
		// con quello contenute nella MAINPAL che in qualche modo dovrà essere
		// passata alal funzione.
		//void display(int[] mainIdx_, int offset, Costume parent, int posx, int posy, int dir, int dstW_, int dstH_) {
		display : function (mainIdx_, offset_, parent, posx, posy, dir, dstW_, dstH_) {
			if(main.bDebug) console.log("SPRITE DISPLAY");
			//if(main.bDebug) console.log(parent);
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
		    			dstX = ( x+main.utility.int(posx) ) ;
		    			dstY = ( y+main.utility.int(posy) ) ;
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
		    	if(main.bDebug) console.log("SPRITE: ul-corner("+this.Xmin+", "+this.Ymin+") e br-corner("+this.Xmax+", "+this.Ymax+"), posx/posy("+posx+", "+posy+"), sprite Width: "+this.w+";");
		    	for (var y=this.Ymin; y<=this.Ymax; y++) {
		    		//for (int y=0; y<dstH_; y++) { // se si vuole l'affinacamento verticale
		    		for (var x=0; x<dstW_; x++) {
		        //for (var y=this.Ymax; y<=this.Ymax+4; y++) {
		        //	  for (var x=0; x<4; x++) {
		    			dstX = x ;
		    			dstY = y+main.utility.int(posy) ;
		    			if( (dstX>=0) && (dstX<dstW_) && (dstY>=0) && (dstY<dstH_) ) {
		    				// durante il ciclo sulle x, srcX ripassa piu' volte sugli stessi
		    				// pixels dell'immagine sorgente, come risultato, l'immagine sorgente
		    				// si ripete orizzontalmente
		    				// posx in questo caso (parallax) rappresenta lo SHIFT
		    				srcX = ( x+main.utility.int(posx) ) % this.w;
		    				// durante il ciclo sulle y, srcY ripassa piu' volte sugli stessi
		    				// pixels dell'immagine sorgente, come risultato, l'immagine sorgente
		    				// si ripete verticalmente
		    				srcY = y % this.h;
		    				indexSrc = srcX + srcY *this.w;
		    				indexDst = dstX + dstY*dstW_;
		    				//if(main.bDebug) console.log("("+x+", "+y+") - srcIdx: "+indexSrc+" ---> dstIdx: "+indexDst+"; "+parent.idxChiave+" ---> (idxSprite: "+this.indexes[ indexSrc ]+", offset: "+offset_+")");
		    				if( this.indexes[ indexSrc ] != parent.idxChiave )
		    					mainIdx_[ indexDst ] = this.indexes[indexSrc]+(offset_-1); 
		    				
		    			}
		    		}
		    	}
		    }	
		},		
		
		// SPRITE DEBUG //////////////////////////////////////////////////////
		debug : function() {
			if(main.bDebug) console.log(this.indexes.length);
			//if(main.bDebug) console.log(this.indexes);
		}
	}
});