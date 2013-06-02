/**
* Chatbeat component that controls the caching and other related caching properties and tools.
* @class cache
* @constructor  
* @namespace Chatbeat
*/

Chatbeat.addComponent('cache', {
	/**   
	* get the default nativepath of the application storage 
	* @property docDir
	* @type AIR File object
	*/
	docDir : air.File.applicationStorageDirectory,

	/**   
	* sets the default Folder name
	* @property appDir
	* @type string
	*/
	appDir : "ChatBeat",
        
	/**   
	* sets the cache directory name
	* @property cacheDir
	* @type string
	*/
	cacheDir : "cache",
        
	/**   
	* Temporary secret key 
	* @property key
	* @type string
	*/
	key : "secretkey",

	/**   
	* a variable to store the AIR File object of Cache directory in runtime
	* @property cacheLocation
	* @type AIR file Object
	*/
	cacheLocation : null,
	
	/**   
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* - Initialize the cache location and adds events listener of discovered files<br>
	* - Encrypt the secret key and store it on Encrypted local store provided by Air Runtime<br>
	* @method init
	*/
	init  : function()	{
		
		this.cacheLocation = this.docDir.resolvePath(this.appDir).resolvePath(this.cacheDir);	
		this.cacheLocation.createDirectory(); 
		this.cacheLocation.getDirectoryListingAsync();
		this.cacheLocation.addEventListener(air.FileListEvent.DIRECTORY_LISTING, this.cacheDirHandler);
		
		var passwordBytes = new air.ByteArray();
		passwordBytes.writeUTFBytes(this.key);
		air.EncryptedLocalStore.setItem("key", passwordBytes);
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("app sotrage location => " + this.cacheLocation.nativePath);			
		}

	},

	/**   
	* check if the current streaming music is already on local storage
	* @method isCached
	* @return {true or false}
	*/
	isCached : function(url)	{

		params = this.parseURL(url);
		var pArtistID = params[0],
			pAlbumID = params[1],
			pSongID = params[2];
			
		checkFile = this.checkLocation(pArtistID, pAlbumID, pSongID);
		if(checkFile)	{		
			return checkFile;
		}	else	{
			return false;
		}
		
		
	},
	
	/**   
	* return the Artist ID, Album ID, Song ID from the URL parameter (if JSON is coming from streaming server)
	* @method parseURL
	* @param url {string}
	* @return {Object}
	*/
	parseURL : function(url)	{
		
		if(url)	{
			try {
			var paramArr = url.split(Chatbeat.httpStream)[1].split("/");
			} catch(e) {
			var paramArr = new Array();
				paramArr[0] = 'local';
				paramArr[1] = 'local';
				paramArr[2] =  this.encrypt(url);
			}
			return paramArr;			
		}
	},
	
	/**   
	* Check the file if exist on local based on IDs.
	* @method checkLocation
	* @param artistID {string}
	* @param albumID {string}
	* @param songID {string}
	* @return {true or false}
	*/
	checkLocation : function(artistID, albumID, songID)	{
		
		var getCacheLoc =  this.cacheLocation,
			artistLoc = getCacheLoc.resolvePath(this.encrypt(artistID)),
			albumLoc = artistLoc.resolvePath(this.encrypt(albumID)),
			songLoc = albumLoc.resolvePath(this.encrypt(songID) + ".cmf");
			
		if(artistLoc.exists)	{		
			if(albumLoc.exists)	{
				if(songLoc.exists)	{
					return songLoc.url;
				}	else	{
					return false;	
				}				
			}	else	{
				return false;	
			}			
		}	else	{
			return false;	
		}

	},
	
	cacheDirHandler : function(e)	{
		var list = e.files;
			
		
		for (i = 0; i < list.length; i++) {
			
		}
	},

	/**   
	* Save the streaming music data in local storage
	* @method keep
	* @param url {string}
	*/
	keep : function(url)	{
		
		params = this.parseURL(url);
		
		var artistID = params[0],
			albumID = params[1],
			songID = params[2],
		
			newFile = this.cacheLocation.resolvePath(this.encrypt(artistID))
							.resolvePath(this.encrypt(albumID) + "/" + this.encrypt(songID) +".cmf"),
		
			urlStream = new air.URLStream(),
			fileData = new air.ByteArray();
		
		var URLObj = new air.URLRequest();
		URLObj.url = url;
		urlStream.addEventListener(air.Event.COMPLETE, loaded);
		urlStream.load(URLObj);
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("params  : " + Chatbeat.playlist.convertObj(params));
			air.Introspector.Console.log("filename BEFORE : " + songID + " AFTER : " + this.encrypt(songID));
			air.Introspector.Console.log("saving data to local storage ... ");
			air.Introspector.Console.log("Trying to store in : " + newFile.nativePath);			
		}
		
		function loaded(event) { 
			urlStream.readBytes(fileData, 0, urlStream.bytesAvailable); 
			writeCMF(); 
		} 
		 
		function writeCMF() { 
			var fileStream = new air.FileStream(); 
			fileStream.open(newFile, air.FileMode.WRITE); 
			fileStream.writeBytes(fileData, 0, fileData.length); 
			fileStream.close(); 
			
			if(Chatbeat.debug)	{
				air.Introspector.Console.log("new file is writen on : " + newFile.nativePath);
			}
		}
	},
	
	remove : function()	{
		
	},
	
	/**   
	* Encrypt the given string
	* @method encrypt
	* @param str {string}
	* @return str {string}
	*/
	encrypt : function(str)	{
		
		var localStorage = air.EncryptedLocalStore.getItem("key"),
			key = localStorage.readUTFBytes(localStorage.length);
			enc = $.rc4EncryptStr (str, key);
	
		return enc;
		
	},

	/**   
	* Decrypt the given string
	* @method decrypt
	* @param str {string}
	* @return str {string}
	*/	
	decrypt : function(str)	{

		var localStorage = air.EncryptedLocalStore.getItem("key"),
			key = localStorage.readUTFBytes(localStorage.length);		
		return  $.rc4DecryptStr (str, key );
		
	},
        
	/**   
	* Create random ID on runtime
	* @method getID
	* @return str {string}
	*/	
	getID : function()	{
		return  "ID_" + new Date().getTime();
	}
	
	
});
