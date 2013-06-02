/**
* Chatbeat component that is responsible on all playlist activity, connections, UI display etc.
* @class playlist
* @constructor 
* @namespace Chatbeat 
*/
Chatbeat.addComponent('playlist', {
	/**
	* container for the JSON playlist generated from server
	* @property list
	*/
	list : null,	
	
	/**
	* a DOM object parent that will contain all the sounds information from a playlist. This will be the main DOM parent that will contain all the JSON "playlist" result from the server
	* @property container
	*/
	container : $('#songlist'),
	
	/**
	* container for AIR ContextMenu Object
	* @property contextMenu
	*/	
	contextMenu : null,
	
	/**
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* - initialize the UI controls, contextmenus and drag and drop source on start up.
	* @method init
	*/
	init : function()	{
	
		//this.featured()
		this.contextMenu = this.menu.create();
		this.plContext = this.menu.createPLcontext();
		
		this.DOMcontrol();
		this.toggleViews();
		
		var dragSource = document.getElementById('songlist');
		dragSource.addEventListener("dragstart",Chatbeat.playlist.drag.start);
		dragSource.addEventListener("dragend", Chatbeat.playlist.drag.end);
		
		var dragTarget = document.getElementById('customPlayList'); 
        dragTarget.addEventListener("dragenter", Chatbeat.playlist.drag.enter); 
        dragTarget.addEventListener("dragover", Chatbeat.playlist.drag.enter);
        dragTarget.addEventListener("drop", Chatbeat.playlist.drag.drop); 
		
		
		var dropzone = document.getElementById("centerPanel");
		dropzone.addEventListener("dragenter", Chatbeat.playlist.drag.enter);
		dropzone.addEventListener("dragover", Chatbeat.playlist.drag.enter);
		dropzone.addEventListener("drop", Chatbeat.playlist.onDrop);
	},
	
	/**
	* triggered when an object has been dropped to the targer. Gets the native path of the dragged object and serve to the application.
	* @method onDrop
	* @param e {System Event}
	*/
	onDrop : function(e)	{
		var files = e.dataTransfer.getData("application/x-vnd.adobe.air.file-list");
		for (var f = 0; f < files.length; f++)     {
			Chatbeat.playlist.create(files[f].nativePath);
		}
	},
	
	/**
	* sets the UI functionality
	* @method DOMcontrol
	*/
	DOMcontrol : function()	{
		var _plParent = this;
		$('#createPlaylistBtn').click(function()	{
			_plParent.add(this);
		});
	},
	
	/**
	* serves as the Global connection of the application to server. Sends API to server and delegates the response to assigned method
	* @method _send
	* @param url {string}
	* @param method {string [GET, POST, DELETE etc.]}
	* @param handler {Chatbeat Method | Callback}
	*/
	_send : function(url, method, handler)	{

		if(Chatbeat.debug)	{
			air.Introspector.Console.dump("[API connect] url=>" + url + " method=>" + method + " callback=>" + handler);
		}
		
		var u = air.EncryptedLocalStore.getItem( 'username' );
		var p = air.EncryptedLocalStore.getItem( 'password' );
		var access = u.readUTFBytes(u.bytesAvailable) + ":" + p.readUTFBytes(p.bytesAvailable);
		
		$.ajax({
			beforeSend: function(xhrObj){
				xhrObj.setRequestHeader("Content-Type","application/json");
				xhrObj.setRequestHeader("Accept","application/json");				
				xhrObj.setRequestHeader("Authorization","Basic " + window.btoa(access));
			},
			type: method,
			url: url,
			processData: false,
			data: '',
			dataType: "json",
			success: function(json){
				if(Chatbeat.debug)	{
					air.Introspector.Console.dump("returned json : " + Chatbeat.playlist.convertObj(json));
				}
				Chatbeat.playlist[handler](json);				
			},
			error : function(xhr, ajaxOptions, thrownError)	{
				if(Chatbeat.debug)	{
					air.Introspector.Console.log('ERROR : ' + xhr.responseText + " url : " + url + " method : " + method);
				}
				Chatbeat.playlist[handler + "error"](xhr.responseText);
			
			}
		});
	},
	
	/**
	* calls the featured playlist
	* @method featured
	*/
	featured : function()	{		
		this._send(Chatbeat.API + "/pl/?t=featured", "GET", "display");		
		$('#playlist_featured').click();
	},

	/**
	* calls the Artist List
	* @method getArtistList
	*/	
	getArtistList : function()	{		
		
		this._send(Chatbeat.API + "/artists/", "GET", "getArtistListHandler");
		
	},
	
	/**
	* handler for the response when getArtistList is called.
	* @method getArtistListHandler
	* @param json {JSON}
	*/	
	getArtistListHandler : function(json)	{

		var count = json.count,
			length = json.length
		
		$('#artistTableContent').html('');
		
		$.each(json.artists, function()	{
			
			var counter = $('#artistTableContent tr').length;
			var row = counter%2;
			var rowClass = (row == 0) ? 'trOdd' : 'trEven';
			var newItem = $('<tr class="artistFileItem"></tr>')
						.append
						(
							$('<td></td>').append(
								$('<li></li>')
								.addClass("albumArtClass")
								
								.css({
									"background" : "url("+ Chatbeat.staticURL + "/art/"+this.id+"/"+this.id+"/)",
									"margin" : 20,
									"margin-right" : 5
								})
							)
						)
						.append($('<td></td>')
								.html("<div style='font-size:16px'>"+this.name+"</div><div style='margin-top:10px'>"+this.background+"</div>")
								.css({"padding" : 25})
						)
						.attr({
							'artist_id' : this.id,
							'id' : "artistListItem_"+this.id,
							
						})
						.addClass(rowClass)
						.dblclick(function()	{
						
							var artist_id = $(this).attr('artist_id');							
							Chatbeat.playlist.getAlbumList(artist_id);
							
						})
						
						;
			$('#artistTableContent').append(newItem);
			
		});
		
		$('#artistPage').show();
	},
	
	/**
	* gets the Album list from the server
	* @method getAlbumList
	* @param id {string}
	*/	
	getAlbumList : function(id)	{		
		
		$('#albumsSelection').click();
		this._send(Chatbeat.API + "/artists/"+id, "GET", "getAlbumListHandler");
		
	},
	
	/**
	* handler for the response when getAlbumListHandler is called.
	* @method getAlbumListHandler
	* @param json {JSON}
	*/	
	getAlbumListHandler : function(json)	{
		var artist_id = json.artist.id,
			background = json.artist.background,
			artist_name = json.artist.name
		
		
		$('#artistInfo h3').text(artist_name);
		$('#artistInfo span').text(background);
		
		$('#albumTableContent').html('');
		
		$.each(json.albums, function()	{
			Chatbeat.playlist.displayAlbums(this);
			
		});
		
		$('#albumPage').show();
	},
	
	/**
	* displays the album list in the UI
	* @method displayAlbums
	* @param albumInfo {JSON Object}
	*/	
	displayAlbums : function(albumInfo)	{
		var counter = $('#albumTableContent tr').length;
		var row = counter%2;
		var rowClass = (row == 0) ? 'trEven' : 'trOdd';
		var newItem = $('<tr class="artistFileItem"></tr>')
					.append
					(
						$('<td></td>').append(
							$('<li></li>')
							.addClass("albumArtClass")
							
							.css({
								"background" : "url("+ Chatbeat.staticURL + "/art/"+albumInfo.artist_id+"/"+albumInfo.artist_id+"/)",
								"margin" : 20
							})
						)
					)
					.append($('<td></td>').html('<h3>'+albumInfo.title+'</h3>').css("padding-top", 70))
					.append($('<td></td>').html('<h3>'+albumInfo.year+'</h3>').css("padding-top", 70))						
					.attr({
						'artist_id' : albumInfo.artist_id,
						'album_id' : albumInfo.id,
						'id' : "albumListItem_"+albumInfo.artist_id,
						'uuid' : albumInfo.uuid,
						'title' : albumInfo.title,
						'year' : albumInfo.year
						
					})
					.addClass(rowClass)
					.dblclick(function()	{
					
						var artist_id = $(this).attr('artist_id');							
						Chatbeat.playlist.getSongsList($(this).attr("artist_id"), $(this).attr("album_id"));
						
					})
					
					;
		
		$('#albumTableContent').append(newItem);
		
	},
	
	/**
	* gets the song list from the server
	* @method getSongsList
	* @param artist_id {string}
	* @param album_id {string}
	*/	
	getSongsList : function(artist_id, album_id)	{		
		
		this._send(Chatbeat.API + "/artists/"+ artist_id + "/" + album_id + "/", "GET", "getSongsListHandler");
		
	},
	
	/**
	* handler for the response when getSongsList is called.
	* @method getSongsListHandler
	* @param json {JSON}
	*/	
	getSongsListHandler : function(json)	{
		
		this.display(json);
		$('#songsPage').show();
		$('.songs').show();
		$('.songsAlbumArt').hide();		
	},
	
	/**
	* gets the song list from the server
	* @method getList
	* @param artist_id {string}
	* @param album_id {string}
	*/
	getList : function()	{		
		this._send(Chatbeat.API + "/pl/", "GET", "getListHandler");
	},
	
	/**
	* handler for the response when getListHandler is called.
	* @method getListHandler
	* @param json {JSON}
	*/
	getListHandler : function(json)	{

		for(var i=0; i < json.length; i++)	{			
			this.addNewPL(json[i].playlist_id, json[i].playlist)
		}		
	},
	
	/**
	* handler for the response when Chatbeat.offline.loadPlaylist is called.
	* @method getOfflineListHandler
	* @param json {JSON}
	*/
	getOfflineListHandler : function(json)	{
		this.addNewOfflinePL(json.playlist_id, json.playlist)
	},
	
	/**
	* loads the list of song of a specified playlist on the server
	* @method _load
	* @param id {string}
	*/
	_load : function(id)	{
		this._send(Chatbeat.API + "/pl/"+id, "GET", "display");
	},
	
	/**
	* loads the list of song of a specified playlist on the local machine
	* @method _loadOffline
	* @param id {string}
	*/
	_loadOffline : function(id)	{
		this._send("app-storage:/Chatbeat/Offline/" + Chatbeat.cache.encrypt(id) + ".json", "GET", "display");
	},
	
	/**
	* UI functionality that will display the Create new playlist input box and button. This method is attached in a UI button.
	* @method add
	* @param obj {DOM object}
	*/
	add : function(obj)	{
		var _plParent = this;		
		var newPL = $('<li></li').append(
						$('<input />')
						.attr({
							'type' : 'text',
							'id' : 'tempPLName'	
						})
						.keyup(function(e)	{
							var code = (e.keyCode ? e.keyCode : e.which);
							
							if(code == 13) { //Enter keycode
								_plParent.save(this);
								$(obj).show();
								$(this).remove();
							}
							
							if(code == 27)	{
								$(obj).show();
								$(this).remove();	 
							}
						})
						.blur(function()	{
							$(obj).show();
							$(this).remove();
						})
					);
		$(obj).before(newPL);
		newPL.focus();
		$(obj).hide();
	
	},
	
	/**
	* UI functionality that will save the new playlist name. This method is attached in a UI button.
	* @method save
	* @param obj {DOM object}
	*/
	save : function(obj)	{
		var plName = $(obj).val();
		this._send(Chatbeat.API + "/pl/?name="+plName, "POST", "renderSave");
	},
	
	/**
	* handler that will catch the JSON returned from server when save button is clicked.
	* @method renderSave
	* @param json {JSON}
	*/
	renderSave : function(json)	{

		var id = json.id,
			name = json.name;
		this.addNewPL(id, name);
			
	},
	
	/**
	* add or creates a new playlist item in the custom playlist list in UI
	* @method addNewPL
	* @param playlist_id {integer}
	* @param name {string}
	*/
	addNewPL : function(playlist_id, name)	{
		newPL = $('<li></li>')
					.attr({
						'id' : "playlist_" + playlist_id,
						"pl_id" : playlist_id,
						"type" : "online"
					})
					.text(name);
		
		$('#customPlayList').append(newPL);
	},
	
	/**
	* add or creates a new playlist item in the offline playlist list in UI
	* @method addNewOfflinePL
	* @param playlist_id {integer}
	* @param name {string}
	*/
	addNewOfflinePL : function(playlist_id, name)	{
		newPL = $('<li></li>')
					.attr({
						'id' : "offlineplaylist_" + playlist_id,
						"pl_id" : playlist_id,
						"type" : "offline"
					})
					.text(name);
		
		$('#offlinePlaylist').append(newPL);
	},
	
	/**
	* method that will convert json object to strings
	* @method convertObj
	* @param playlist_id {integer}
	* @param name {string}
	*/
	convertObj  : function(json)	{
		var str = '';
		for (var m in json) {
			if(typeof json[m] == 'object')	str +=  m + " : [" + this.convertObj(json[m]) + "] ";
			else	str +=  m + " : " + json[m] + ", ";
		}
		return str;
	},
	
	/**
	* list all online playlist in UI
	* @method display
	* @param json {JSON}
	*/
	display : function(json)	{
		
		Chatbeat.playlist.list = {};
		Chatbeat.playlist.list = eval(json);
		
		var counter = 1,
			p_id = Chatbeat.playlist.list.playlist_id,
			p_name = Chatbeat.playlist.list.playlist;
			origin = Chatbeat.playlist.list.origin  || "stream";
		
	
		$('#songsPage tbody').html('');
		$('#songsPage .songsAlbumArt').html('');

		$.each(Chatbeat.playlist.list.songs, function()	{
			
			Chatbeat.playlist.insertToList(this);

		});
		
		Chatbeat.listLenght = counter - 1;
				
	},
	
	/**
	* create a song item in the playlist UI
	* @method insertToList
	* @param info {JSON}
	*/
	insertToList : function(info)	{
		
		var title = info.title||' ',
			artist = info.artist_name||' ',
			album = info.album_title||' ',
			track = info.track||' ',
			year = info.year||' ',
			genre = info.genre||' ',
			art = info.album_art,
			id = info.id,
			artist_id = info.artist_id,
			album_id = info.album_id;
			
		if(origin == 'stream')	path = Chatbeat.httpStream + artist_id + '/' + album_id + '/' + id + '/';
		else	path = 	info.path;
			
		
		var counter = $('#tableContent tr').length;
		var row = counter%2;
		var rowClass = (row == 0) ? 'trOdd' : 'trEven';
		var dragInfo = "title: " + title + "|id:"+id;
		var newItem = $('<tr class="fileItem"></tr>')
						.append($('<td></td>').html('<input type="checkbox" class="selections" />'))	
						.append($('<td></td>').append($('<a></a>').text(title).attr("href", dragInfo).css("cursor", "move")))
						.append($('<td></td>').text(''))
						.append($('<td></td>').text(artist))
						.append($('<td></td>').text(album))
						.append($('<td></td>').text(track))
						.append($('<td></td>').text(year))
						.append($('<td></td>').text(genre))							
						.addClass(rowClass)
						.attr({
							'artist_id' : artist_id,
							'album_id' : album_id,
							'song_id' : id,
							'path' : path,
							'id' : "listitem_"+id,
							'song_name' :  title,
							'album_name' : album,
							'artist_name' : artist
							
						})
						
						;
						
	
		$('#songsPage tbody').append(newItem);
		
		
		
		var newAlbumArt = $('<li></li>')
					.attr({
						'artist_id' : artist_id,
						'album_id' : album_id,
						'song_id' : id,
						'path' : path,
						'id' : "albumlistitem_"+id
					})
					.addClass("albumArtList")
					.addClass("artReflect")
					.addClass("albumArtClass")
					.css({ 
						"background" :"url("+ Chatbeat.staticURL + "/art/"+artist_id+"/"+album_id+"/)",
						"width" : 140,
						"height" : 140,
						"float" : "left",
						"margin" : 10,
						"margin-bottom" : 80
					})
					/*
					.append(
						$('<span></span>')
						.addClass('listAlbumName')
						.text(album)
					)
					*/
					.click(function()	{
						
						artist_id = $(this).attr('artist_id');
						album_id = $(this).attr('album_id');
						id = $(this).attr('song_id');
						
						Chatbeat.player.play($(this).attr('path'));
						
					});
					
		$('#songsPage .songsAlbumArt').append(newAlbumArt);			
	},
	
	/**
	* dynamic playlist creation. used for creating playlist for local mp3 files that is opened by the system.
	* @method create
	* @param e {system event}
	*/
	create : function(e)	{
		
		if(tempCreateInterval)	tempCreateInterval = null;
			
		
				
		var path = e, 
			_plParent = Chatbeat.playlist;
			timelimit = 2000;
			
		_plParent.temp.push(path);

			
		var tempCreateInterval = setInterval(function()	{
			clearInterval(tempCreateInterval);
			if(_plParent.temp.length)	{
				if(Chatbeat.debug)	{
					air.Introspector.Console.log("outside initialize object length : " + _plParent.temp.length); 
				}
				createJSON();					
			}
			
		}, timelimit);
	
		
		function createJSON() {
			
			var content = {
				"playlist_id" : "local_092009",
				"playlist" : "Local Storage",
				"origin" : "local",
				"songs" : new Array()
			};
			
			var counter = 0;
			
			$.each(_plParent.temp, function(index, val)	{
				
				
				
				var tempFile= new air.File();
				tempFile.nativePath = val;
				tempFile.canonicalize();
			
				if(Chatbeat.debug)	{
					air.Introspector.Console.log("reading file : " + val); 
					air.Introspector.Console.log("Conicalize path of file : " + tempFile.url); 					
				}
	
 				var fileStr= new air.FileStream(); 
				fileStr.open(tempFile, air.FileMode.UPDATE);  
				fileStr.position = tempFile.size - 125;
				
				var fileName = tempFile.url.split(".mp3")[0];
					fileName = fileName.split("/");
					fileName = decodeURIComponent(fileName[fileName.length-1]).replace(/\+/gi, " ");
					
				
				var charset = "iso-8859-1",
					id3Title = checkString(fileStr.readMultiByte(30, charset)) || fileName,
					id3Artist = checkString(fileStr.readMultiByte(30, charset)) || '',
					id3Album = checkString(fileStr.readMultiByte(30, charset)) || '',
					id3Year = fileStr.readMultiByte(4, charset),
					id3Comment = fileStr.readMultiByte(30, charset),
					id3GenreCode =  fileStr.readByte().toString(10); 				
					
				var song = {
					"album_id": 1, 
					"track": 1, 
					"ply": "", 
					"artist_name": id3Artist, 
					"br": 128, 
					"year": id3Year, 
					"genre": id3GenreCode, 
					"id": Chatbeat.cache.encrypt(tempFile.url), 
					"album_art": "", 
					"title": id3Title, 
					"album_title": id3Album, 
					"artist_id": 1,
					"path" : tempFile.url
				}				
				
			
				
				content.songs.push(song);				
				counter++;
				
//				Chatbeat.playlist.insertToList(song);
			});
			
			

			_plParent.temp = new Array();
			content = JSON.stringify(content);
			if(Chatbeat.debug)	{
				air.Introspector.Console.dump("JSON created :  " + content); // file path					
			}
			
			createFile(content);

		}
		
		function createFile(json)	{
			var file = air.File.applicationStorageDirectory;
			file = file.resolvePath("Chatbeat/Playlist/testplaylist.json");
			var fileStream = new air.FileStream();
			fileStream.open(file, air.FileMode.WRITE);
			fileStream.writeUTFBytes(json); 
			fileStream.close();
			
			if(Chatbeat.debug)	air.Introspector.Console.dump("local playlist created :  " + file.url);

			_plParent._send(file.url, "GET", "display");
	
		}
		
		function checkString(str)	{
			if(str == null || str == 'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUU' || str == 'ªªªªªªªªªªªªªªªªªªªªªªªªªªªªªª') {
				return null;	
			} 	else {
				return str;	
			}
		}
	},
	
	/**
	* Chatbeat playlist AIR context menu object
	* @property menu {object}
	*/	
	menu : {
		selectedSongID : null,
		selectedPlaylistID : null,
		create : function()	{
			
			var menu = new air.NativeMenu(); 
			var command = menu.addItem(new air.NativeMenuItem("Play")); 
			command.addEventListener(air.Event.SELECT, this.playSelected);
			
			var command = menu.addItem(new air.NativeMenuItem("Add to Playlist")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 
			
			var command = menu.addItem(new air.NativeMenuItem("Add to Favorites")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 

			var command = menu.addItem(new air.NativeMenuItem("Share")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 

			var command = menu.addItem( new air.NativeMenuItem("A", true)); 
		

			var command = menu.addItem(new air.NativeMenuItem("Save to Offline Playlist")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 

			var command = menu.addItem( new air.NativeMenuItem("A", true)); 

			
			var command = menu.addItem(new air.NativeMenuItem("Details")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 

			return menu; 
			
		},
		
		createPLcontext : function()	{
			
			var menu = new air.NativeMenu(); 

			var command = menu.addItem(new air.NativeMenuItem("Rename")); 
			command.addEventListener(air.Event.SELECT, this.onCommand); 
			
			var command = menu.addItem(new air.NativeMenuItem("Delete")); 
			command.addEventListener(air.Event.SELECT, Chatbeat.playlist.deletePlaylist); 

			var command = menu.addItem(new air.NativeMenuItem("Save as Offline Playlist")); 
			command.addEventListener(air.Event.SELECT, Chatbeat.offline.save); 

			return menu; 
			
		},
		
		show : function(event)	{
			event.preventDefault();
			this.selectedSongID = event.target.parentNode.id;
		    Chatbeat.playlist.contextMenu.display(window.nativeWindow.stage, event.clientX, event.clientY);
		}, 
		
		showPLContext : function(event)	{
			event.preventDefault();
			this.selectedPlaylistID = $(event.target).attr("pl_id");
			
			if(this.selectedPlaylistID)	Chatbeat.playlist.plContext.display(window.nativeWindow.stage, event.clientX, event.clientY);
			
		},
		
		onCommand : function(event)	{
			var message = "Selected item: \"" + event.target.label + "\" in " + Chatbeat.playlist.convertObj(event) + ".";
   			air.trace(message);
			
			if(Chatbeat.debug)	air.Introspector.Console.dump("oncommand event :  " + event.target.id);
			
		},
		
		playSelected : function()	{
			
			Chatbeat.player.play($('#'+this.selectedSongID).attr('path'));
		},
	},
	
	/**
	* Drag and Drop Object Controller
	* @property drag {object}
	*/	
	drag : {
		start : function(event)	{
			event.dataTransfer.effectAllowed = "copyMove"; 
			air.trace(event.type + ": " + event.dataTransfer.dropEffect);
		},
		
		end : function(event)	{
			air.trace(event.type + ": " + event.dataTransfer.dropEffect); 
		},
		enter : function(event)	{
			 event.preventDefault(); 
		},
	
		drop : function(event)	{

			var playlist_id = event.target.id.split("_")[1],
				info = event.dataTransfer.getData("text/uri-list");
				song_id = info.split("id:")[1];
			
			Chatbeat.playlist.addSong(playlist_id, song_id);
		}
	},
	
	/**
	* sends add song API to the server
	* @method addSong {object}
	* @param plylistID {integer}
	* @param songID {integer}	
	*/	
	addSong : function(plylistID, songID)	{
		this._send(Chatbeat.API + "/pl/"+plylistID+"/?song_id="+songID, "POST", "addSongHandler");
	},
	
	/**
	* handler that will catch the JSON returned from server when addSong method is called.
	* @method addSongHandler
	* @param json {JSON}
	*/
	addSongHandler : function(json)	{
		//alert(this.convertObj(json));
	},
	
	/**
	* sends delete playlist API to the server based on the selected DOM playlist item.
	* @method deletePlaylist
	*/	
	deletePlaylist :  function()	{
		Chatbeat.playlist._send(Chatbeat.API + "/pl/"+ Chatbeat.playlist.menu.selectedPlaylistID +"/", "DELETE", "deletePlaylistHandler");
	},
	
	/**
	* handler that will catch the JSON returned from server when deletePlaylist method is called.
	* @method deletePlaylistHandler
	* @param json {JSON}
	*/
	deletePlaylistHandler : function(json)	{
		$('#playlist_'+Chatbeat.playlist.menu.selectedPlaylistID).remove();
	},
	
	/**
	* handler that will catch the JSON returned from server when Chatbeat.offline.save method is called.
	* @method saveOffline
	* @param json {JSON}
	*/
	saveOffline : function(json)	{
		Chatbeat.offline.parseJSON(json);
	},
	
	/**
	* handler that will catch the JSON returned from server when  Search API returns.
	* @method searchResult
	* @param json {JSON}
	*/
	searchResult : function(json)	{

		$('#pageTitle').text('Search Results');
		$('.page').hide();
		
		$('#songsPage tbody').html('');
		$('#songsPage .songsAlbumArt').html('');
		$('#songsPage').show();
		$('#toggleViewsContainer').hide();
		
		
		
		$.each(json, function()	{
			
			var artist_name = this.artist.name;
			
			$.each(this.albums, function()	{
				
				var album_title = this.album.title;
				
				$.each(this.songs, function()	{
					
					var custom = {};
					custom.title = this.title,
					custom.artist_name = artist_name,
					custom.album_title = album_title,
					custom.track = this.track,
					custom.year = this.year,
					custom.genre = this.genre,
					custom.album_art = '',
					custom.id = this.id,
					custom.artist_id = this.artist_id,
					custom.album_id = this.album_id;
						
					Chatbeat.playlist.insertToList(custom);
	
				});				
			});
		});
		
		


	},
	
	/**
	* handler that will catch the ERROR response when  Search API returns.
	* @method searchResulterror
	* @param json {JSON}
	*/
	searchResulterror : function(error)	{

	},
	
	/**
	* method that binds the UI to its respective functionality. UI method for Views.
	* @method toggleViews
	* @param json {JSON}
	*/
	toggleViews : function(obj)	{
		
		$('#toggleViewsContainer span').click(function()	{
			
			var view =  $(this).text();
			
			switch(view) {
				case 'List' :
					$('.songs').show();
					$('.songsAlbumArt').hide();				
					break;
					
				case 'Album Art' :					
					$('.songs').hide();
					$('.songsAlbumArt').show();				
					break;
			}

		})
		
	}
	

});