/**
* Chatbeat component that handlers all the triggers of specific events in the application
* @class handlers
* @constructor  
* @namespace Chatbeat
*/

Chatbeat.addComponent('handlers', {
	
	/**   
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent 
	*/	
	init : function()	{
		
	},
	
	/**   
	* handler for first inialization of Chatbeat Application. Whether it is opened manually by double clicking of an icon by a user or, opened by system for playing music file.
	* @method initializationHandler
	* @param e {event returned by the system}
	*/
	initializationHandler : function(e) {
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("app trigger => " + e.arguments[0] || ' manual launch'); // file path
		}
		if(e.arguments.length > 0)	{
			Chatbeat.playlist.create(e.arguments[0]);
		}	else	{
			Chatbeat.playlist.featured();
		}
	},
	
	/**   
	* handler for directory object (AIR FILE OBJECT) triggered by Chatbeat.offline.searchPlaylist()
	* @method directoryListingHandler
	* @param e {event returned by the system}
	*/
	directoryListingHandler : function(e) {
        
		var list = e.files;
		var firstRun = true;
		var counter = 1;
		
		for (var i = 0; i < list.length; i++) {
			
			if($cb.debug)	{
				air.Introspector.Console.log(list[i].nativePath);			
			}
			var extension = list[i].nativePath.split(".")[1];
			
			if(extension == 'mp3')	{				
				$cb.playListSongs[counter] = list[i].nativePath;
				if(firstRun)	{
					firstRun = false;					
				}
				counter++;
			}
		}
		$cb.listLenght = counter - 1;
		//$cb.songposition = Math.floor(Math.random() * counter);
		//playSound();
		//Chatbeat.player._load();

    },
	
	/**   
	* handler for the GLOBAL Ticker or Timer (Chatbeat.ticker) of the whole application. Primarily used for displaying the real time status of playing, streaming and loaded amount of music file.
	* @method soundDetailsProgress
	*/
	soundDetailsProgress : function()	{
		
		if(Chatbeat.channel) {
		
			var percentLoaded = (Chatbeat.soundObj.bytesLoaded / Chatbeat.soundObj.bytesTotal) * $('#mainDuration').width();
			var loadTime = Chatbeat.soundObj.bytesLoaded / Chatbeat.soundObj.bytesTotal;
			var loadPercent = Math.round(100 * loadTime);
			var estimatedLength = Math.ceil(Chatbeat.soundObj.length / (loadTime));
			Chatbeat.estimatedLength = estimatedLength
			var playbackPercent = Math.round(100 * (Chatbeat.channel.position / estimatedLength));
			var playbackbar = Math.round($('#mainDuration').width() * (Chatbeat.channel.position / estimatedLength));
			
			/*
			
			$('#debugDiv').html("Sound files size is " + Chatbeat.soundObj.bytesTotal + " bytes.\n"  
										+ "Bytes being loaded: " + Chatbeat.soundObj.bytesLoaded + "\n"
										+ "Percentage of sound file that is loaded " + loadPercent + "%.\n"
										+ "Sound playback is " + playbackPercent + "% complete " + "%.\n"
										+ "Seeker Position " + Chatbeat.channel.position + ".\n"
										+ "Sound Length " + Chatbeat.soundObj.length 
										);
			
			*/
			
			$('#duration').width(percentLoaded);		
			$('#position').width(playbackbar);
			
			if(percentLoaded < 100)	{
			
				percentLoaded = (Chatbeat.soundObj.bytesLoaded / Chatbeat.soundObj.bytesTotal) * $('#mainDuration').width();
				$('#duration').width(percentLoaded);

			}
			
			Chatbeat.player.getDuration();
			
		}
	},
	
	
	/**   
	* handler for COMPLETE_STATUS of AIR SoundObject. Triggered by Chatbeat.soundObj. This function is called when a streaming object is completed loaded.
	* @method completeHandler
	*/
	completeHandler : function(e)	{

		percentLoaded = (Chatbeat.soundObj.bytesLoaded / Chatbeat.soundObj.bytesTotal) * $('#mainDuration').width();
		$('#duration').width(percentLoaded);
		$('#seeker').attr("max", Chatbeat.soundObj.length);
		
	},
	
	/**   
	* handler for ID3 info of AIR Sound Object. Triggered by Chatbeat.soundObj. This function is called when a streaming object has an ID3 meta data attached on it.
	* @method id3Handler
	*/
	id3Handler : function(e)	{
		
		if(Chatbeat.debug)	{
			for (i in Chatbeat.soundObj.id3) {
		//		air.Introspector.Console.log("id3: " + i + " : " + 	Chatbeat.soundObj.id3[i]);
			}
		}

		/*
		$('#title').text(Chatbeat.soundObj.id3.TIT2);
		$('#artist').text(Chatbeat.soundObj.id3.TPE1);
		$('#album').text(Chatbeat.soundObj.id3.TALB);
		*/
	},
	
	/**   
	* handler for ERROR_STATUS of AIR Sound Object. Triggered by Chatbeat.soundObj. This function is called when a streaming object cannot be loaded, file not found or file corrupted
	* @method ioErrorHandler
	*/
	ioErrorHandler  : function(e)	{
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("ioErrorHandler: " + e);
		}
	},
	
	/**   
	* handler for air.ProgressEvent.PROGRESS of AIR Sound Object. Triggered by Chatbeat.soundObj. This method broadcast the status of the streaming object while it is still downloading or streamin.
	* @method progressHandler
	*/
	progressHandler : function(e)	{
		Chatbeat.player.getDuration();
	},
	
	/**   
	* handler for air.Event.SOUND_COMPLETE of AIR Sound Object. Triggered by Chatbeat.soundObj. this method is called when the player is already finish playing the sound object.
	* @method handleSoundComplete
	*/
	handleSoundComplete : function()	{
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("Sound Complete!");
		}
		Chatbeat.player.next();
	}
	
});