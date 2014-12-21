main.Framecount = main.utility.defineClass({
	name : "Framecount",
	init : function() {
		if(main.bDebug) console.log("## FRAMECOUNT COSTRUTTORE ##");
		this.actualTime = 0; 
		this.elapsedTime = 0; 
		this.lastTime = 0;
		this.initialTime = 0;
		this.secondsSoFar = 0; // secondi trascorsi dall'avvio del programma
		this.currentFrame = 0;
		this.lastFrames = 0;
		this.totalFrames = 0;
		this.avg = 0;
		
		// FRAMECOUNT INIT //////////////////////////////////////////////////
		if(main.bDebug) console.log("## FRAMECOUNT INIT ##");
	    this.initialTime = Date.now();
	    this.lastTime = this.initialTime;

	    // visaulizzazione sulla pagina web *****************************
	    var html = '<div id="debug_framecount">waiting for frames...</div>'
	    var div = document.createElement('div');
	    div.id = 'framecounter';
	   	// per tutto quello che riguarda lo stile, vedere il file CSS
	    div.innerHTML = html;
	    if(main.utility.bShowFramecounter)
	    	div.style.display = "block";
	    else 
	    	div.style.display = "none";
	    document.getElementsByTagName('body')[0].appendChild(div);
		
	},
	methods : {
		// FRAMECOUNT UPDATE ////////////////////////////////////////////////
		update : function() {
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
	}
});




