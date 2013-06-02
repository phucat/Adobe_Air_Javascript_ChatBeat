/**
* Chatbeat component for UI and basic player functionalities
* @class player
* @constructor 
* @namespace Chatbeat 
*/

Chatbeat.addComponent('player', {
	
	/**   
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* - Bind DOM elements with their respective methods<br>
	* - Encrypt the secret key and store it on Encrypted local store provided by Air Runtime<br>
	* @method init
	*/
	init  : function()	{
		// get controls ID and bind their functionality
		this.bindControls();


	},

	/**   
	* You can configure which DOM elements you want to have the Player functionality
	* @method DOMcontrol
	* @config test
	*/
	DOMcontrol : {
		// global variables used in this extension
		play : '#controlPlay',
		next : '#controlNext',
		prev : '#controlPrev',
		stop : '#controlStop',
		pause : '#controlPause',
		scrubber : '#scrubber',
		slider : '#slider',
		selector : '.selections',
		playVideo : '#playVideoBtn',
		searchTxtBox : '#searchInput',
		
		displayNumberCurrent : '#listPos',
		displayNumberTotal : '#totalList'
		
	},
	
	/**   
	* Bind the DOM and the method configured in runtime
	* @method bindControls
	*/
	bindControls : function()	{
		
		_Parent = this; 
		
		$(this.DOMcontrol.prev).click(function()	{
			_Parent.prev();
		});
		
		$(this.DOMcontrol.next).click(function()	{
			_Parent.next();
		});
		
		$(this.DOMcontrol.pause).click(function()	{
			_Parent.pause();
		});
		
		$(this.DOMcontrol.stop).click(function()	{
			_Parent.stop();
		});
		
		$(this.DOMcontrol.play).click(function()	{
			if($(this).attr("class") == 'playBtn')	{
				_Parent.play();
			} else {
				_Parent.pause();
			}
		});
		
		$(this.DOMcontrol.selector).click(function()	{
			_Parent.selector(this);	
		});
		
		$(this.DOMcontrol.playVideo).click(function()	{
			_Parent.playVideo();	
		});
		
		$(this.DOMcontrol.searchTxtBox).focus(function()	{
			_Parent._search(this);	
		});
		
		// for sound scrubbing
		$(this.DOMcontrol.scrubber).mousedown(function(e)	{
		
			if(Chatbeat.isPlaying) {
				
				var offset = $(this).offset(),
					relativeX = e.pageX - offset.left,
					relativeY = e.pageY - offset.top,
		
					origPos= Math.round(((relativeX * Chatbeat.estimatedLength) / $('#mainDuration').width()));
		
				if(Chatbeat.debug)	{
					air.Introspector.Console.log("relative X Position: " + relativeX);
					air.Introspector.Console.log("relative Y Position: " + relativeY);		
					air.Introspector.Console.log("Sound Position: " + origPos);
				}
				
				Chatbeat.channel.stop();
				
				if(origPos  <= Chatbeat.estimatedLength)	{		
					Chatbeat.channel = Chatbeat.soundObj.play(origPos, false);
				}	else	{
					Chatbeat.channel = Chatbeat.soundObj.play(Chatbeat.estimatedLength-2000, false);
				}
				
				_Parent.setVolume();
				Chatbeat.scrubed = true;
			}
		});
		
		// volume slider
		$(this.DOMcontrol.slider).slider({
			range: "min",
			value: Chatbeat.defaultVolume * 100,
			min: 1,
			max: 100,
			slide: function( event, ui ) {
				//$( "#amount" ).val( "$" + ui.value );
				_Parent.setVolume(ui.value * 0.01);
			}	
		});
		
	},
	
	/**   
	* Load the Sound from AIR URLloader Object to Air Sound Object
	* @method _load
	* @param url {string}
	*/
	_load : function(url)	{

		$(this.DOMcontrol.play).addClass('playBtn');
		$(this.DOMcontrol.play).removeClass('pauseBtn');
		

		Chatbeat.URLObj.url = url;

		if(Chatbeat.debug)	{
			air.Introspector.Console.log("load from URL => " + Chatbeat.URLObj.url);
			air.Introspector.Console.log("operating system : " + air.Capabilities.os);
		}
		
		//get ids from URL and highlight the item that will be played in UI.
		try {		
			var params = Chatbeat.cache.parseURL(Chatbeat.URLObj.url), pArtistID, pAlbumID, pSongID;
			if(params)	{
				pArtistID = params[0],
				pAlbumID = params[1],
				pSongID = params[2];
			}
			
		}	catch(e)	{
			air.Introspector.Console.log("No URL");
			
		}

		if(Chatbeat.playingitem) {
			$(Chatbeat.playingitem).removeClass('playing');	
		}
		
		$('#listitem_'+pSongID).addClass('playing');
		Chatbeat.playingitem = document.getElementById('listitem_'+pSongID);
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("set as playing item => " + "#listitem_" + pSongID);		
		}

		this.setInfos($('#listitem_'+pSongID));
		
		//check if not null
		if(Chatbeat.URLObj.url) {
			
			/*
			//encode to safe URL			
			Chatbeat.URLObj.url = (air.Capabilities.os == "Linux") 
								? encodeURIComponent(Chatbeat.URLObj.url)
								: Chatbeat.URLObj.url;
			*/
			
			Chatbeat.autoPlay = false;
			
			//check if cached		
			var isCached = Chatbeat.cache.isCached(Chatbeat.URLObj.url);
			
			//check if local
			var isLocal = (Chatbeat.URLObj.url.split(Chatbeat.httpStream).length > 1) ? false : true;
			
			if(Chatbeat.debug)	air.Introspector.Console.log("isLocal File  : " + isLocal);
			if(isCached)	{
				
				// return the native path of stored cached file
				Chatbeat.URLObj.url = isCached;								
				if(Chatbeat.debug)	air.Introspector.Console.log("playing from local storage : " + isCached);
				
				
			}	else	{
				
				if(isLocal) {
					if(Chatbeat.debug)	air.Introspector.Console.log("playing a local file : " + Chatbeat.URLObj.url);
					Chatbeat.autoPlay = true;
				}	else {
					//if not cached, save data to local storage.
					Chatbeat.cache.keep(Chatbeat.URLObj.url);	
				}		
			}
					
			//start creating soundObject and load the sound from assigned URL	
			Chatbeat.soundObj = new air.Sound();
			Chatbeat.soundContext =  new air.SoundLoaderContext(Chatbeat.bufferTime, false);
			Chatbeat.soundTransformObj =  new air.SoundTransform(Chatbeat.defaultVolume);			
			Chatbeat.soundObj.load(Chatbeat.URLObj, Chatbeat.soundContext);		
			this.soundDetails();
			
			// handlers for the events of sound object
			Chatbeat.soundObj.addEventListener(air.Event.COMPLETE, Chatbeat.handlers.completeHandler);
			Chatbeat.soundObj.addEventListener(air.Event.ID3, Chatbeat.handlers.id3Handler);
			Chatbeat.soundObj.addEventListener(air.IOErrorEvent.IO_ERROR, Chatbeat.handlers.ioErrorHandler);
			Chatbeat.soundObj.addEventListener(air.ProgressEvent.PROGRESS, Chatbeat.handlers.progressHandler);
			
			//if scrubed
			Chatbeat.scrubed = false;
	
		}
	},
	
	/**   
	* play the sound loaded from the Sound Object. Can also directly load a sound when URL parameter is assigned.
	* @method play
	* @param url {string}
	*/
	play : function(url)	{
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("isPaused :  " + Chatbeat.isPaused);
		}

		url = url || null;
		
		// if paused
		if(Chatbeat.isPaused && url == null)	{
			
			Chatbeat.isPaused = false;
			Chatbeat.channel = Chatbeat.soundObj.play(Chatbeat.lastposition, false);
			this.setVolume();
			
		}	else {
			
			if(url != null)	{
				this._load(url);
			}
			
			if(Chatbeat.channel) { Chatbeat.channel.stop(); }	
			if(Chatbeat.soundObj)	{		
				Chatbeat.channel = Chatbeat.soundObj.play(0, false);
				this.setVolume();
				if(Chatbeat.channel) {
					Chatbeat.channel.soundTransform = Chatbeat.soundTransformObj;		
					Chatbeat.channel.addEventListener(air.Event.SOUND_COMPLETE, Chatbeat.handlers.handleSoundComplete);
				}	else	{
					Chatbeat.window.toast("Header", "Message!");
				}
			}

		}

		Chatbeat.isPlaying = true;		
		this.soundDetails();			
		
		$(this.DOMcontrol.play).removeClass('playBtn');
		$(this.DOMcontrol.play).addClass('pauseBtn');
		
	},
	
	/**   
	* gets the ID of the currently playing or loaded sound.
	* @method getPlayingID
	* @return jQuery Object {object}
	*/
	getPlayingID : function()	{
		retObj = $('#tableContent .playing');
		return retObj;
	},
	
	/**   
	* Update the artist, album and song information in UI.
	* @method setInfos
	* @param jQuery Object {object}
	*/
	setInfos : function(playingObj)	{
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("playind DOM id => " + playingObj.attr("ID")); 		
		}
		
		$('#title').text(playingObj.attr("song_name"));
		$('#artist').text(playingObj.attr("artist_name"));
		$('#album').text(playingObj.attr("album_name"));
	},
	
	/**   
	* play next song
	* @method next
	*/
	next : function()	{
		
		if(Chatbeat.isRandom)	{
			
			var index = Math.floor(Math.random() * ($('#tableContent tr').length + 1)), // nth-child indices start at 1
				nextURL = $("#tableContent tr:nth-child(" + index + ")").attr("path");
			
		}	else {
		
			var playingObj = this.getPlayingID(),
				nextURL = playingObj.next().attr("path");	
		}		
		
		if(nextURL == null)	{
			nextURL = $('#tableContent tr:first-child').attr("path");
		}

		Chatbeat.lastposition = 0;
		Chatbeat.channel.stop();
		this.play(nextURL);
		
	},
	
	/**   
	* play previous song
	* @method prev
	*/
	prev : function()	{
		
		if(Chatbeat.isRandom)	{
			
			var index = Math.floor(Math.random() * ($('#tableContent tr').length + 1)), // nth-child indices start at 1
				nextURL = $("#tableContent tr:nth-child(" + index + ")").attr("path");
			
		}	else {
		
			var playingObj = this.getPlayingID(),
				nextURL = playingObj.prev().attr("path");	
		}		
		
		if(nextURL == null)	{
			nextURL = $('#tableContent tr:last-child').attr("path");
		}

		Chatbeat.lastposition = 0;
		Chatbeat.channel.stop();
		this.play(nextURL);
		
	},
	
	/**   
	* stops the player
	* @method stop
	*/
	stop : function()	{
		
		Chatbeat.lastposition = 0;
		Chatbeat.channel.stop();	
		Chatbeat.isPlaying = false;	
		Chatbeat.ticker.stop();
		
	},
        
	/**   
	* pause the player
	* @method pause
	*/
	pause : function()	{
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("isPaused :  " + Chatbeat.isPaused);
		}
		
		Chatbeat.isPaused = true;
		Chatbeat.isPlaying = false;
		
		Chatbeat.lastposition = Chatbeat.channel.position;
		Chatbeat.channel.stop();
		Chatbeat.ticker.stop();
		
		$(this.DOMcontrol.play).addClass('playBtn');
		$(this.DOMcontrol.play).removeClass('pauseBtn');
		
	},
	
	/**   
	* pause the player
	* @method setVolume
	* @param val {int}
	*/
	setVolume : function(val)	{

		Chatbeat.defaultVolume = (val) ? val : Chatbeat.defaultVolume;
		if(Chatbeat.channel) {
			var transform = Chatbeat.channel.soundTransform;
			transform.volume = Chatbeat.defaultVolume
			Chatbeat.channel.soundTransform = transform;
		}
	},
	
	/**   
	* calculates the current playing duration 
	* @method soundDetails
	*/
	soundDetails : function()	{

		$(this.DOMcontrol.displayNumberCurrent).text(Chatbeat.songposition);
		$(this.DOMcontrol.displayNumberTotal).text(Chatbeat.listLenght);

		Chatbeat.ticker.start();

	},
	
	/**   
	* updates the UI for song duration
	* @method getDuration
	*/
	getDuration : function()	{
		
		var Milliseconds, Minutes, Seconds,SecondsTens;
		
		// duration for buffering
		if(Chatbeat.soundObj.bytesTotal) {
			
			Milliseconds = (Chatbeat.soundObj.bytesTotal / (Chatbeat.soundObj.bytesLoaded / Chatbeat.soundObj.length)),
			Minutes = Math.floor(Milliseconds/60000),
			Seconds = (Milliseconds%60000),
			SecondsTens = Math.floor(Seconds/10000),

			Seconds = Math.ceil(Seconds%10000)
			Seconds /= 1000;		
			
			$('#totalDuration').text(Minutes + ":" + SecondsTens + "" + Seconds.toString().split(".")[0]);
			
		}		

		// duration for sound length
		if(Chatbeat.channel) {
			
			Milliseconds = Chatbeat.channel.position,
			Minutes = Math.floor(Milliseconds/60000),
			Seconds = (Milliseconds%60000),
			SecondsTens = Math.floor(Seconds/10000);
			
			Seconds = Math.ceil(Seconds%10000)
			Seconds /= 1000;		
						
			$('#currentDuration').text(Minutes + ":" + SecondsTens + "" + Seconds.toString().split(".")[0]);
			
		}
		
		// NOTE: if scrubed. the COMPLETE Event from listeners will not be triggered again,
		// so we need to check if playing is completed based on the time elapsed.		
		if(Chatbeat.scrubed)	{
			this.checkIfComplete();
		}

	},
	
	/**   
	* check if the song duration has reach the final duration
	* @method checkIfComplete
	*/
	checkIfComplete : function()	{
		if(Chatbeat.channel)	{
			if($('#totalDuration').text() == $('#currentDuration').text())	{
				Chatbeat.player.next();	
			}
		}
	},
	
	/**   
	* selects songs thats is being checked or selected
	* @method selector
	* @param jQuery Object {object}
	*/
	selector : function(obj)	{
		if($(obj).attr('id') == 'mainSelector')	{
			
			if($(obj).attr("checked"))	{
				$(this.DOMcontrol.selector).attr("checked", "checked");
			}	else	{
				$(this.DOMcontrol.selector).removeAttr("checked");
			}
		}	else	{
			
			
		}
	},

	/**   
	* play video
	* @method playVideo       
	*/
	playVideo : function(){

	
	    /* ==================================================================
			playing local file. NOTE: do not use flv format.
			* ive wasted 48 hrs trying to play a local file using FLV and 
			used 10 minutes to play mp4 and it magically work. demmet!
		===================================================================*/

		var f = new air.File();
		f.nativePath = 'app:/dare.mp4';

		url = f.url;
	
		var videoURL = "http://localhost/chatbeat/dare.mp4";
		var connection;
		var stream;
		
		var CustomClient = {
			onMetaData : function(info)	{
				air.trace("metadata: duration=" + info.duration + " width=" + info.width + " height=" + info.height + " framerate=" + info.framerate);
			},
			onCuePoint : function(info)	{
				air.trace("cuepoint: time=" + info.time + " name=" + info.name + " type=" + info.type);
			},
			onPlayStatus : function(info)	{
				air.trace("video player status : " + info.status);				
			}
		};
		
		Chatbeat.videoObj.x = 220;
		Chatbeat.videoObj.y = 160;
		Chatbeat.videoObj.width = $('#centerPanel').width();
		Chatbeat.videoObj.height = $('#centerPanel').height();
		
        function NetConnection() {
            connection = new air.NetConnection();
            connection.addEventListener(air.NetStatusEvent.NET_STATUS, netStatusHandler);
            connection.addEventListener(air.SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
            connection.connect(null);
        }

        function netStatusHandler(event)	{
            switch (event.info.code) {
                case "NetConnection.Connect.Success":
                    connectStream();
                    break;
                case "NetStream.Play.StreamNotFound":
                    air.trace("Stream not found: " + videoURL);
                    break;
            }
        }

        function securityErrorHandler(event) {
            air.trace("securityErrorHandler: " + event);
        }

        function connectStream(){
            var stream = new air.NetStream(connection);
            stream.addEventListener(air.NetStatusEvent.NET_STATUS, netStatusHandler);
			stream.inBufferSeek = true;			
            stream.client = CustomClient;
			stream.seek(100);
			stream.play(null);
			
			var byte = new air.ByteArray();
			byte.writeUTFBytes(100000);
			stream.appendBytes(byte);
			
			
            Chatbeat.videoObj.attachNetStream(stream);

            stream.play(videoURL);
            window.nativeWindow.stage.addChild(Chatbeat.videoObj);
			//$('#centerPanel').append(video);
			
        }

		NetConnection();
	},
	
	/**   
	* search functionality attached to search UI.
	* @method _search       
	*/
	_search : function(obj)	{
		$(obj).val('');
		$(obj).css({
			'font-weight' : 'bold',
			'font-style' : 'normal'
		});
		
		$(obj).unbind("blur");
		$(obj).unbind("keyup");		
		
		$(obj).blur(function()	{
			if($(obj).val() == '')	{
				$(obj).val('Search Chatbeat');
				$(obj).css({
					'font-weight' : 'normal',
					'font-style' : 'italic'
				});
			}
		});
		
		$(obj).keyup(function(e)	{
			val = $(this).val();
			if(e.keyCode == 13 && val != '')	{				
				Chatbeat.playlist._send(Chatbeat.API + "/songs/?q=" + val, "GET", "searchResult")
			}			
		});
	}
	
	
});
