/**
* This contains the global configuration of Chatbeat variables and access to other extended object properties, methods and events.
* @module chatbeat
* @namespace  
*/

/**
* This contains the global configuration of Chatbeat variables and access to other extended object properties, methods and events.
* @class Chatbeat
* @constructor  
* 
*/

var Chatbeat;  if (!Chatbeat) Chatbeat = {};
(function(callback)	{

	
var Chatbeat = {

	/**   
	* app username of the user
	* @property username   
	* @type string   
	*/
	username : 'ray',

	/**   
	* app password of the user
	* @property password   
	* @type string   
	*/
	password : 'ray',

	/**   
	* sets app if in debug mode
	* @property debug   
	* @type string   
	*/	
	debug : true,

	/**   
	* sets buffer time before playing
	* @property bufferTime
	* @type int
	*/
	bufferTime : 100,

	/**   
	* sets the initial volume amount
	* @property defaultVolume
	* @type int
	*/
	defaultVolume : .3,

	/**   
	* startup position of selected song on the playlist
	* @property songposition
	* @type int
	*/
	songposition : 1,
	
	/**   
	* last position of bytes played in Sound Object. Use for scrubbing.
	* @property lastposition
	* @type int
	*/
	lastposition : 0,
	
	/**   
	* channel container for AIR sound Object
	* @property channel
	* @type AIR {object}
	* @return AIR {object}
	*/
	channel : null,
	listLenght: 0,
	
	/**   
	* status of player
	* @property isPlaying
	* @type boolean
	*/
	isPlaying : false,
	
	/**   
	* status of random
	* @property isRandom
	* @type boolean
	*/	
	isRandom : false,
	
	/**   
	* status of pause
	* @property isPaused
	* @type boolean
	*/	
	isPaused : false,

	/**   
	* status of scrub
	* @property scrubed
	* @type boolean
	*/	
	scrubed : false,
 	
	/**   
	* http stream URL
	* @property httpStream
	* @type string
	* @final
	*/
	httpStream : 'http://dev.stream.chatbeat.com/',
	
	/**   
	* API URL
	* @property httpStream
	* @type string
	* @final
	*/
	API : 'https://dev.api.Chatbeat.com/v2',
	
	/**   
	* Thumbnail URL
	* @property staticURL
	* @type string
	* @final
	*/
	staticURL : 'http://dev.static.chatbeat.com',

//	mode : 'light',

	/**   
	* mode of the application to use.
	* @property mode
	* @type {string [full or light]}
	* @final
	*/	
	mode : 'full',
	
	/**   
	* status of Network Connectivity
	* @property isOnline
	* @type boolean
	*/		
	isOnline : false,
	
	/**   
	* Chatbeat global URL Request Object
	* @property URLObj
	* @type {AIR Object}
	*/			
	URLObj : new air.URLRequest(),

	/**   
	* Chatbeat global Sound Object
	* @property soundObj
	* @type {AIR Object}
	*/				
	soundObj : null,
	
	/**   
	* Chatbeat global Sound Context Object. Used for Volume Control
	* @property soundContext
	* @type {AIR Object}
	*/
	soundContext : null,
	
	/**   
	* Chatbeat global Sound Transform Object. Also used for Volume Control
	* @property soundTransformObj
	* @type {AIR Object}
	*/
	soundTransformObj: null,
	
	/**   
	* Chatbeat global Video Object
	* @property videoObj
	* @type {AIR Object}
	*/		
	videoObj : new air.Video(),
	
	/**   
	* Global timer of the application, with the default 300 millisecond interval
	* @property ticker
	* @type {AIR Object}
	* @final
	*/
	ticker : new air.Timer(300),
	
	/**   
	* if the first music on a playlist will be played automatically when a playlist is loaded and selected
	* @property autoPlay
	* @type {boolean}
	*/
	
	autoPlay : false,
	//directory : air.File.applicationDirectory,
	//folderName : "mp3",
	
	component: {},
	
	/**
	* Add components to the Chatbeat module dynamically on runtime
	* @param name {string}
	* @param ptype {Object literal}
	* @method addComponent
	*/
	addComponent: function (name, ptype)    {
		this.component[name] = ptype;
        },
	
	/**
	* Initalize and include all extension files in the object
	* @method initComponent
	*/
	initComponent : function()	{
		// initialize plugins
		for (var k in this.component) {
			if (this.component.hasOwnProperty(k)) {
			var ptype = this.component[k];
				// jslint complaints about the below line, but this is fine
				var F = function () {};
				F.prototype = ptype;
				this[k] = new F();
				this[k].init(this);
			}
		}	

		if(this.debug)	air.Introspector.Console.log("chatbeat component initialized.");
		
	
	},
	
	/**
	* Starts Chatbeat module
	* @method init
	*/
	init : function()	{
		
		this.checkConnection();
		
		if(!Chatbeat.debug)	{
			var u = prompt("please enter your USERNAME : ");
			var p = prompt("please enter your PASSWORD : ");
			//encrypt username and password		
		}	else	{
			u = Chatbeat.username;
			p = Chatbeat.password;	
		}
		
		var uBytes = new air.ByteArray();
		uBytes.writeUTFBytes(u);
		air.EncryptedLocalStore.setItem("username", uBytes);

		var pBytes = new air.ByteArray();
		pBytes.writeUTFBytes(p);
		air.EncryptedLocalStore.setItem("password", pBytes);
		
		// initialize all components included
		this.initComponent();
		
		// stage framerate
		window.nativeWindow.stage.frameRate = 60;
		
		// global timer
		this.ticker.addEventListener(air.TimerEvent.TIMER, this.handlers.soundDetailsProgress);
				
		// On application start
		air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, this.handlers.initializationHandler);		
		
		
	},
	
	/**
	* check internet connection asyncronously
	* @method checkConnection
	*/
	checkConnection : function()	{
		var request = new air.URLRequest( 'http://www.google.com' ) ;
		var monitor = new air.URLMonitor( request );
		monitor.addEventListener(air.StatusEvent.STATUS, announceStatus);
		monitor.start();
		
		function announceStatus(e) {
	 		if(Chatbeat.debug)	air.Introspector.Console.log("Status change. Current status => " + e.code);
			switch(e.code)	{
				case 'Service.unavailable'	:
					Chatbeat.isOnline = false;
					Chatbeat.offline.makeOffline();
					break;
				case 'Service.available':
					Chatbeat.isOnline = true;
					Chatbeat.offline.makeOnline();					
					break;
			}

		}			
	}
}
	
window.Chatbeat = $cb = Chatbeat;
$(document).ready(function()	{
	Chatbeat.init();
})
}(window));