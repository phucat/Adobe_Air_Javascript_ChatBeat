/**
* Chatbeat component for Offline controls
* @class offline
* @constructor  
* @namespace Chatbeat
*/

Chatbeat.addComponent('offline', {
	
	/**   
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* On load : Initialize the searchPlaylist method then determine the Network Connectivity.
	* @method init
	*/
	init  : function()	{
		this.searchPlaylist();
		$('#switch').click(function()	{
			Chatbeat.offline.setMode(this);
		})
	},
	
	/**   
	* calling the Playlist URL and saving all info offline (Calls the saveOffline method)
	* @method save
	*/	
	save : function()	{
		var plid = Chatbeat.playlist.menu.selectedPlaylistID;
		Chatbeat.playlist._send(Chatbeat.API + "/pl/"+plid, "GET", "saveOffline");
	},
	
	/**   
	* this method receives the Playlist JSON content from the server and checks whether the playlist is already saved on local or not
	* @method parseJSON
	* @param json {JSON}	
	*/	
	parseJSON : function(json)	{
	
		var _continue = this.createLocalPlaylist(json, Chatbeat.cache.encrypt(json.playlist_id));

		if(_continue) {
			$.each(json.songs, function()	{
				var artist_id = this.artist_id,
					album_id = this.album_id,
					song_id = this.id,
					songURL = Chatbeat.httpStream + artist_id + "/" + album_id + "/" + song_id + "/";
				
				if(Chatbeat.debug)	{				
					air.Introspector.Console.log("writing to offline playlist => " + songURL);
				}
				if(!Chatbeat.cache.isCached(songURL))	Chatbeat.cache.keep(songURL);
				
				
			});
		}
	},
	
	/**   
	* writes a local playlist on the user hard drive
	* @method createLocalPlaylist
	* @param json {string}	
	* @param name {string}		
	*/	
	createLocalPlaylist : function(json,name)	{
		var file = air.File.applicationStorageDirectory;
		file = file.resolvePath("Chatbeat/Offline/"+name+".json");
		
		if(file.exists)	{
			
			if(Chatbeat.debug)	{
				air.Introspector.Console.dump("offline playlist already existed");
			}
			
			var ask = confirm("This playlist is on you offline playlist already.\nDo you want to overwrite it?");
			if(ask) {
				writeJSON(json);
				return true;
			}	else	{
				return false;	
			}
			
		}	else	{
			writeJSON(json);
			return true;
		}
		
		
		function writeJSON(json)	{
			
			var fileStream = new air.FileStream();
			fileStream.open(file, air.FileMode.WRITE);
			fileStream.writeUTFBytes(JSON.stringify(json)); 
			fileStream.close();
				
			if(Chatbeat.debug)	{
				air.Introspector.Console.dump("offline playlist created =>  " + file.nativePath);
			}
			Chatbeat.playlist.addNewOfflinePL(json.playlist_id, json.playlist);
		}
	},

	/**   
	* this method is being called on every first load of the application from init(). Search the local machine if theres a local playlist saved on the computer.
	* @method searchPlaylist	
	*/
	searchPlaylist : function()	{
		
		var file = air.File.applicationStorageDirectory;
		file = file.resolvePath("Chatbeat/Offline/");		
	
		file.getDirectoryListingAsync();
		file.addEventListener(air.FileListEvent.DIRECTORY_LISTING, directoryListingHandler);
	
		function directoryListingHandler(e) {
	
			var list = e.files;
			
			for (var i = 0; i < list.length; i++) {
				

				var extension = list[i].nativePath.split(".")[1];				
				if(extension == 'json')	{
					if(Chatbeat.debug)	air.Introspector.Console.log("offline playlist found! => " + list[i].nativePath);														
					var url = 'app-storage:/Chatbeat/Offline/' + list[i].name;
					Chatbeat.offline.loadPlaylist(url);
				}
				
			}
		}		
	},
	
	/**   
	* loads a local playlist
	* @method loadPlaylist
	* @param path {string}	
	*/
	loadPlaylist : function(path)	{
		if(Chatbeat.debug)	air.Introspector.Console.log("loading offline playlist => " + path);
		Chatbeat.playlist._send(path, "GET", "getOfflineListHandler");

	},
	
	/**   
	* triggered when a Get Offline / Online button is clicked from UI.
	* @method setMode
	* @param obj {DOM Object}	
	*/	
	setMode  : function(obj)	{
		
		if($(obj).attr("mode"))	this.makeOnline();
		else	this.makeOffline();
			
	},
	
	/**   
	* updates the UI  to adapt Offline environment.
	* @method makeOffline
	*/	
	makeOffline : function()	{
		
		$('#switch').removeClass("blue");
		$('#switch').text("Go Online");			
		$('#switch').attr("mode", "offline");
		
		$('#onlinePlaylistDiv').hide();
		$('#artistsSelection').hide();
		$('#albumsSelection').hide();		
		
		
		
		$('#offlinePlaylist li:first').click();

		if(Chatbeat.isPlaying)	Chatbeat.player.stop();
		
	},

	/**   
	* updates the UI  to adapt Online environment.
	* @method makeOnline
	*/		
	makeOnline : function()	{
		
		if(Chatbeat.isOnline) {
			
			$('#switch').addClass("blue");
			$('#switch').text("Go Offline");			
			$('#switch').removeAttr("mode", "offline");
			
			
			$('#onlinePlaylistDiv').show();		
			$('#artistsSelection').show();
			$('#albumsSelection').show();
			
			$('#playlist_featured').click();
			
			$.each($('#customPlayList li'), function()	{
				if($(this).attr("pl_id") != 'favorites')	{
					$(this).remove();
				}
			});
			
			Chatbeat.playlist.getList();
		}	else	{
			alert('No Internet Connection.');	
		}
	}
	
});
