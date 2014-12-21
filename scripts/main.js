var main = (function() {
	
	// la variabili sono elencate in basso!
	var bShowPalettes = true;
	
	// UTILITY /////////////////////////////////////////////////////////////
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
	
	// CHECK ERRORS ///////////////////////////////////////////////////////////
	function checkError() {
		var error = gl.getError();
		if(error != 0)
			console.log("Abbiamo un errore in WebGL");
	}
	
	// CREATE PROGRAM FROM SCRIPTS ////////////////////////////////////////////
	function createProgramFromScripts(gl, vShName, fShName) {
		//console.log( vShName );
		//console.log( fShName );
		var prg;
		// caricamente e compilazione degli shaders
		var vShader = getShader(gl, vShName );
		var fShader = getShader(gl, fShName );
		
		// creo il programma
		prg = gl.createProgram( );
		gl.attachShader( prg, vShader );
		gl.attachShader( prg, fShader );
		gl.linkProgram( prg );
		if( ! gl.getProgramParameter( prg , gl.LINK_STATUS ) ) {
			console.log( gl.getProgramInfoLog( prg ) );
		}

		return prg;
	}
	
	// GET SHADER /////////////////////////////////////////////////////////////
	function getShader(gl, id) {
	      var shaderScript = document.getElementById(id);
	      if (!shaderScript) {
	          return null;
	      }
	      // estrapolo il contenuto dello script (il sorgente)
	      var str = shaderScript.text;

	      var shader;
	      if (shaderScript.type == "x-shader/x-fragment") {
	          shader = gl.createShader(gl.FRAGMENT_SHADER);
	      } else if (shaderScript.type == "x-shader/x-vertex") {
	          shader = gl.createShader(gl.VERTEX_SHADER);
	      } else {
	          return null;
	      }

	      gl.shaderSource(shader, str);
	      gl.compileShader(shader);

	      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	          console.log( gl.getShaderInfoLog( shader ) );
	          return null;
	      }
	      // ritorna lo shader già compilato, pronto per essere
	      // collegato al programma
	      return shader;
	}

	// LOAD IMAGE FROM JSON ////////////////////////////////////////////////
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
					if( isImgReady() ) {
						// quanto segue viene chiamato solo al caricamento
						// completato per tutte le immagini
						if(bDebug) console.log("tutte le immagini sono state caricate in cache");
						executeImgCallbacksQueue();
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

	// IMAGE IS READY //////////////////////////////////////////////////////
	function isImgReady() {
		// ready resta vero se tutte le immagini sono state
		// correttamente caricate in cache
		var ready = true;
		for(var property in imgCache){
			if( !imgCache[property] )
				ready = false;
		}
		return ready;
	};

	// EXECUTE IMAGE CALLBACK QUEUE ////////////////////////////////////////
	function executeImgCallbacksQueue() {
		var nextFunc = callbacks[0];
		// valuto se nextFunc esiste e se non è UNDEFINED
		// (convertendola a boolean e non eseguendola!!)
		if( nextFunc ) {
			if(bDebug) console.log("Ok, la prossima funzione precedentemente registrata è eseguibile!");
			nextFunc(); // la eseguo
			callbacks.shift();
			executeImgCallbacksQueue(); // provo ad eseguire altre funzioni dalla coda
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
		
	function interfaceCreatePaletteContainer(identificativo, refPal) {
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
	
	function interfaceDisplayPalette(identificativo, refPal) {
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
	function showPalettes() {
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
	
	function showFramecounter() {
		main.utility.bShowFramecounter = !main.utility.bShowFramecounter;
		var tab = document.getElementById("framecounter");
		if(main.utility.bShowFramecounter)
			tab.style.display = "block";
		else 
			tab.style.display = "none";
	}
	
	function pauseAnimation() {
		console.log("Pausa o NO");
		bPause = !bPause;
		if(!bPause)
			window.requestAnimationFrame(update);
	}
	
	// questa funzione viene chiamata ogni volta che avviene un ridimensionamento della finestra del browser
	/*function windowResize() {
		var gc = document.getElementById("game-container");
		gc.style.height = (window.innerHeight - 2*((window.innerHeight - dstH)/3) )+"px";
		gc.style.width = window.innerWidth+"px";
		//canvasTopX = ((window.innerWidth - dstW) / 2);
		//canvasTopY = ((window.innerHeight - dstH) / 2);
		//if( canvasTopX < 0) canvasTopX = 0;
		//if( canvasTopY < 0) canvasTopY = 0;
		//console.log("window resized ---> inner Dims ("+window.innerWidth+", "+window.innerHeight+"), canvas Dims ("+dstW+", "+dstH+"), x/y ("+canvasTopX+", "+canvasTopY+")");
		//canvas.style.left = canvasTopX+"px";
		//canvas.style.top = canvasTopY+"px";
	}*/
	
	// RESIZE /////////////////////////////////////////////////////////////////
	function windowResize() {
		var oA = imgW / imgH;
		var dW = window.innerWidth;
		var dH = window.innerHeight;
		var dA = dW / dH;
		if( oA > dA ){
			f = dW / w ;
		} else if ( oA == dA ) {
			f = dW / imgW;
		} else {
			f = dH / imgH ;
		}
		f *= 0.8;
		fW = f * imgW;
		fH = f * imgH;
		canvas.width = fW;
		canvas.height= fH;
		gl.viewport(0, 0, fW, fH);
	}
	
	
	// CLEAR //////////////////////////////////////////////////////////
	//void clear( int[] indexes, int idxEntry ) {
	function clear ( idxEntry ) {
		for (var i=0; i<mainIdx.length; i++) {
			mainIdx[i] = idxEntry;
		}
	}

	/*// DISPLAY DST ////////////////////////////////////////////////////
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
		
		
		//for(var y=0; y < imgH; y++) {
		//	for(var x=0; x < imgW; x++) {
		//		srcIdx = x + y*imgW;
		//		r = mainPal.colors[ mainIdx[ srcIdx ] ][0];
		//		g = mainPal.colors[ mainIdx[ srcIdx ] ][1];
		//		b = mainPal.colors[ mainIdx[ srcIdx ] ][2];
		//		ctx.fillStyle = "rgb("+r+","+g+","+b+")";
		//		ctx.fillRect(x*factor, y*factor, factor, factor);
		//	}
		//}
		
		
		for(var y=0; y < dstH; y++) {
			for(var x=0; x < dstW; x++) {
		//for(var y=0; y < 4; y++) {
		//	for(var x=0; x < 4; x++) {
				
				dstIdx = x+y*dstW;
				srcX = main.utility.int(x / factor);
				srcY = main.utility.int(y / factor);
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
	}*/
	
	
	// VARIABILI VARIE ///////////////////////////////////////////////////
	// per fare debug e mostrare mesaggi a console
	var bDebug = false;
	// per il caricamento delle risorse
	var nImg = 0;
	var nImgLoaded = 0;
	var imgCache = {};
	var callbacks = [];
	// per il canvas e relativi
	var canvas, gl; //ctx;
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
	
	var framecounter, orologio;
	var warpAmount = 967.574; // float
	var warp = 1000; //2000.0; // float

	var cavaliere;
	var livelli = [];
	
	var velFactor = 0.97; 	// (float)
	var velActor = -240;	// (int)
	var velCam;				// (int)
	var velActorApparent;	// (int)
	
	
	var positions;
	
	
	// INTERFACCIA GRAFICA ***********************************************
	var factor = 3;
	var bShowPalettes = false;
	var bPause = false;

	// INIT //////////////////////////////////////////////////////////////
	function init() {
		
		//console.log("******************* PRIMA DI TUTTO *******************")
		//console.log("- window");
		//console.log(window);
		//console.log("- main");
		//console.log(main);
		
		//Costume;
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
					//console.log(code+" - "+key);
			}
		}, false);
		
		window.addEventListener("keyup", function(e) {
			var code = e.keyCode;
			//do nothing
		}, false);
		
		/*if( !window.requestAnimationFrame ) {
			alert("Sorry! your browser doesn't sopport 'requestAnimationFrame' technology :(\nTry a Desktop Firefox version browser instead!");
			return;
			//window.requestAnimationFrame = function(callbak) { return window.setTimeout( function(){ callback(Date.now() - startTime); }, 1000/60  ); };
		}*/
		
		// polyfill per requestAnimationFrame ****************************
		window.requestAnimationFrame = (function() {
			var startTime = Date.now();
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callbak ) {
				   		return window.setTimeout( function() { callback(Date.now() - startTime); }, 1000/60  );
				   };
		})();
		
		// CANVAS e IMAGE DATAs ******************************************
		if(bDebug) console.log("INIT: preparo CANVAS, CONTEXT e IMAGEDATA");
		canvas = document.createElement("canvas");
		if( !canvas.getContext ) {
			alert("Sorry! your browser doesn't sopport 'canvas' technology :(\nTry a Desktop Firefox version browser instead");
			return;
		}
		
		canvas.id = "game";
		canvas.innerHTML = "your browser doesn't support CANVAS element";

		var div = document.getElementById("game-container");
		div.appendChild(canvas);
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		if (!gl) {
			alert("Sorry! your browser doesn't sopport 'WebGL' technology :(\nTry a Desktop Firefox version browser instead");
			return;
		}
		
		program = createProgramFromScripts( gl, "vshader", "fshader" ); 
		gl.useProgram(program);
		
		// chiama la funzione che si occupa di posizionare gli elementi all'interno
		// della finestra del browser
		windowResize();
		
		var mainIdx_Loc = gl.getUniformLocation(program, "u_image"); 
		var mainPal_Loc = gl.getUniformLocation(program, "u_palette"); 
		// tell it to use texture units 0 and 1 for the image and palette
		gl.uniform1i(mainPal_Loc, 0);
		gl.uniform1i(mainIdx_Loc, 1);
				
		var buffer_Loc = gl.getAttribLocation(program, "a_position");
		positions = [
		             -1,  1,
		              1,  1,
		             -1, -1,
		              1, -1
		              ];
	
		var vertBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
		// uso gl.STATIC_DRAW in quanto i dati sono caricati una sola volta e disegnati poi molte volte
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );
		gl.enableVertexAttribArray( buffer_Loc );
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		
		// per visualizzare lo stato di progressione del loading risorse
		if(bDebug) console.log("INIT: creo la barra di progressione per monitorare il caricamento delle risorse");
		var progress = document.createElement("div");
		progress.className = "progress";
		progress.innerHTML = '<div class="indicator"></div>';
		div.appendChild(progress);
		
		// CALCOLI VARI **************************************************
		velCam = main.utility.int(velFactor * velActor);
		velActorApparent = velActor - velCam;
		
		// MAIN PALETTE **************************************************
		if (bDebug) console.log("INIT: creo la MAINPAL");
		mainPal = new (main.Palette)(256, 0);
		// settare eventuali colori prima di cominciare
		mainPal.setNextFreeColor(249, 0, 249);
		// mostro un debug prima di cominciare
		interfaceCreatePaletteContainer("mainPal", mainPal);
		
		// MAIN INDEXES *************************************************
		if (bDebug) console.log("INIT: creo MAINIDX");
		for(var i=0; i<mainIdx.length; i++) {
			// l'indice 0 nella palette è un colore di sfondo
			// o comunque un colore che possa essere utilizzato come puliza
			mainIdx[i] = 0;
		}
		
		
		// Clock *****************************************************
		if (bDebug) console.log("INIT: creo l'OROLOGIO");
		orologio = new (main.Orologio)();
		//console.log("questo è il valore di warp iniziale: "+warp+";");
		orologio.setTimeWarp(warp);
		
		if (bDebug) console.log("INIT: creo il FRAMECOUNTER");
		framcounter = new (main.Framecount)();		
		
		if (bDebug) console.log("INIT: carico le risorse dai files JSON\n");
		loadImgFromJson("data/00_orari.json", checkProgress );
		loadImgFromJson("data/01_orari.json", setup );		
		loadImgFromJson("data/02_orari.json"); 
		loadImgFromJson("data/03_orari.json");
		//loadImgFromJson("data/sovra.json" );
		loadImgFromJson("data/cavaliere.json");
	}
	
	
	// SETUP /////////////////////////////////////////////////////////////
	function setup() {
		if (bDebug) console.log("SETUP: carico le risorse dai files JSON\n");
		// NOTA: nel chiamare il metodo init per il PARALLASSE o p er l'ATTORE
		// sto anche provvedendo alla creazione dei rispettivi elementi di interfaccia 
		// quali, ad esempio, i riquadri che si occuperanno di mostrare le varie LOCPALS 
		
		
		if (bDebug) console.log("SETUP: creo gli ATTORI e li inizializzo\n");
		// BG e PARALLASSE **********************************************
		var parallassePos = [0, 0];
		livelli.push( new (main.Parallax)("data/00_orari.json", imgCache["data/00_orari.json"], imgW, imgH, 0, parallassePos, mainPal) );
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new (main.Parallax)("data/01_orari.json", imgCache["data/01_orari.json"], imgW, imgH, 0.25, parallassePos, mainPal) );
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new (main.Parallax)("data/02_orari.json", imgCache["data/02_orari.json"], imgW, imgH, 0.5, parallassePos, mainPal) );
		mainPal.setNextFreeColor(249, 0, 249);
		
		livelli.push( new (main.Parallax)("data/03_orari.json", imgCache["data/03_orari.json"], imgW, imgH, 1, parallassePos, mainPal) );
		mainPal.setNextFreeColor(249, 0, 249);
		
		//var quintePos = [0, 140];
		//livelli.push( new (main.Parallax)("data/sovra.json", imgCache["data/sovra.json"], imgW, imgH, 1.25, quintePos, mainPal) );
		//mainPal.setNextFreeColor(249, 0, 249);

		// ATTORI *******************************************************
		var actorPos = [160, 120];
		cavaliere = new (main.Actor)("data/cavaliere.json", imgCache["data/cavaliere.json"], imgW, imgH, actorPos, mainPal);
		mainPal.setNextFreeColor(249, 0, 249);

		// Setup a palette.
		// make palette texture and upload palette
		gl.activeTexture(gl.TEXTURE0);
		var mainPal_Tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, mainPal_Tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array( mainPal.getColors() ) );
		
		// make image textures and upload image
		gl.activeTexture(gl.TEXTURE1);
		var mainIdx_Tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, mainIdx_Tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, imgW, imgH, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(mainIdx) );

		for (var j=0; j<livelli.length; j++) {
			livelli[j].setVel( velCam );
		} 
		cavaliere.setVel( velActorApparent );

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
		
		draw();
	}

	// DRAW //////////////////////////////////////////////////////////////
	function draw() {	
		if(bDebug) console.log("DRAW\n");
		
		// INTERFACCIA: mostro le varie palettes **************************
		if(bDebug) console.log("DRAW: aggiorno l'interfaccia mostrando le varie palette ed enties\n");

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
		
		// re-upload image
		gl.activeTexture(gl.TEXTURE0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array( mainPal.getColors() ) );
    
		gl.activeTexture(gl.TEXTURE1);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, imgW, imgH, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(mainIdx));
	
		
		if(bDebug) console.log("DRAW: visualizzo IMGDATA\n");
		//displayDstImg();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length/2 );

		window.requestAnimationFrame(update);
	}

	// variabili di supporto
	var scriptsQueue = [];
	var callbacksQueue = [];
	var bLoadingScriptsInDOM = false;
	// variabili per il debug 
    var numResLoadedFromServer = 0;
    var numResPlacedInDOM = 0;
    var numRes = 0;
    
    // LOAD /////////////////////////////////////////////////////////////
    function load(src, callback) {
        var image, queueEntry;
        numRes++;
        main.check();
        
        // aggiunge la risorsa alla coda di esecuzione
        queueEntry = {
            src: src,
            //callback: callback,
            loaded: false
        };
        
        scriptsQueue.push(queueEntry);
        callbacksQueue.push(callback);
        
        image = new Image();
        image.onload = image.onerror = function() {
        	numResLoadedFromServer++;
            //console.log("script recuperato dal server e memorizzato in cache come immagine!");
            queueEntry.loaded = true;
            if(!bLoadingScriptsInDOM) {
                loadScriptsInDOM();
            }
        };
        image.src = src;
    }
    
    // LOAD SCRIPTS IN DOM //////////////////////////////////////////////
    function loadScriptsInDOM() {
        // ricordo che next è una istanza della classe "queueEntry"
        // e possiede le proprietà SRC e LOADED
        var next = scriptsQueue[0];
        var first;
        var script;
        if( next && next.loaded ) {
        	bLoadingScriptsInDOM = true;
            // rimuovi il primo elemento dall'array 'scriptsQueue'
            // tanto quello che devo usare già l'ho 
            // memorizzato in 'next'
            scriptsQueue.shift();
            // individuo quale sia il primo script nel DOM
            first = document.getElementsByTagName("script")[0];
            // creo un nuovo elemento/tag di tipo SCRIPT
            script = document.createElement("script");
            // associo una funzione di callback all'evento 'onload'
            script.onload = function() {
            	numResPlacedInDOM++;
            	//console.log("script recuperato dalla cache e innestato nel DOM!");
            	main.check();
                // al caricamento dello script controllo se ci dovessero essere
            	// altri script che ancora sono in attesa d'essere innestati nel DOM.
            	// Se tutti gli script sono già stati inseriti nel DOM, allora 
            	// proseguo esaurendo la 'callbacksQueue'.
            	if( isScriptReady() ){
            		// quanto segue viene chiamato solamente al caricamento
            		// completato di tutti gli scripts sul DOM
            		//console.log("tutti gli scripts sono stati caricati sul DOM!");
            		//console.log("esaurisco la coda delle funzioni di CALLBACK!");
            		executeScriptCallbacksQueue();
            	} else {
            		//console.log("alcuni degli scripts sono ancora in fase di caricamento sul DOM.");
            	}
                // provo a caricare sul DOM eventuali ulteriori scripts
                loadScriptsInDOM();
            };
            // gli aggiungo la proprietà src
            script.src = next.src;
            // inserisci l'attuale script nel DOM
            // appena prima del primissimo script
            first.parentNode.insertBefore(script, first);
        } else {
        	bLoadingScriptsInDOM = false;
        }
    }
    
    // IS READY /////////////////////////////////////////////////////////
    function isScriptReady() {
    	var bReady = true;
    	//console.log("### eseguo SCRIPT READY!");
    	//console.log("\tscriptsQueue length: "+scriptsQueue.length+";");
    	if (scriptsQueue.length !== 0)
    		bReady = false;
    	return bReady;
    }
    
    // EXECUTE CALLBACS QUEUE ///////////////////////////////////////////
    function executeScriptCallbacksQueue() {
    	var nextFunc = callbacksQueue[0];
    	//valuto se nextFunc esiste e non è UNDEFINED
    	// (convertendola a boolean e non eseguendola !!!)
    	if( nextFunc ) {
    		//console.log("ok, la funzione in esame è una valida funzione di callback");
    		nextFunc(); // ora la eseguo
    		callbacksQueue.shift();
    		executeScriptCallbacksQueue();    		
    	} else {
    		//console.log("non più callbacks");
    	}
    }
    
    // funzioni per il debug
	function check() {
		//console.log("### nRes: "+numRes+"; nResLoaded: "+numResLoadedFromServer+"; nResInDOM: "+numResPlacedInDOM+"; ###");
	}
	

	return {
		load : load,
		check : check,
		interfaceCreatePaletteContainer : interfaceCreatePaletteContainer,
		interfaceDisplayPalette : interfaceDisplayPalette,
		init : init
	};
})();