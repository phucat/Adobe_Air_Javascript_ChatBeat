/**
* Chatbeat component that controls the loaded page when a user selects or navigates on the application.
* @class pages
* @constructor 
* @namespace Chatbeat 
*/
Chatbeat.addComponent('pages', {
	
	/**
	* container for active status of the page
	* @property active	
	*/
	active : null,
	
	/**
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* binds all the respective buttons in the UI to its specific methods.
	* @method init
	*/
	init : function()	{
		
		_pageParent = this;
		
		$('#leftPanel li, #rightPanel li').live("click", function()	{
			// void if creating a playlist
			var val = $(this).text();		
			if(val == 'Create New Playlist' || val =='') return false;
			
			// mark the tab that is currrently selected
			if(_pageParent.active) {				
				$(_pageParent.active).removeClass('pageCurrent');			
			}			
			$(this).addClass('pageCurrent');
			_pageParent.active = this;
						
			// reset values
				
			$('#pageTitle').text(val);
			$('.page').hide();
			$('#toggleViewsContainer').hide();


			// if custom playlist
			if($(this).attr("pl_id"))	{
				
				var id = $(this).attr("pl_id"),
					type = $(this).attr("type");
				
				// check if offline or online playlist
				if(type == "offline")	{
					Chatbeat.playlist._loadOffline(id);	
				}	else {
					Chatbeat.playlist._load(id);
				}
				
				$('#songsPage').show();
				$('#toggleViewsContainer').show();				
							
			//	$('#pageContent').load('html/playlist.html');
				if(Chatbeat.debug)	{				
					air.Introspector.Console.log("[load custom playlist] id=>" + id);
				}				
				
			// pre built-in menus
			}	else {

				_pageParent.setPages(val);
				
			}
			
		})
		
		
		this.setActions();


	},
	
	/**
	* sets the pages looks, functionalities etc. depending ong the object caption or text <br>
	* @method setPages
	* @param val {string}
	*/
	setPages : function(val)	{
		if(Chatbeat.debug)	{				
			air.Introspector.Console.log("[page select]=> " + val);
		}				
		
		switch(val)	{
			case 'Artists': 
				Chatbeat.playlist.getArtistList();
				
				break;
			case 'Albums':
				
				break;
				
			case 'Now Playing':
				$('#nowPlayingPage').show();
				$('#toggleViewsContainer').show();
				break;
				
			case 'My Account':
				
				break;
			case 'Settings':
				
				break;
			case 'Logout':
				
				break;

		}	
	},
	
	/**
	* this defines the functionality that will be applied to an element that will be added to a certain page dynamically
	* @method setActions
	*/
	setActions : function()	{
		
		$('#nowPlayingPage tbody tr').live("dblclick", function()	{
			
			Chatbeat.player.play($(this).attr('path'));
			
		});

		$('#nowPlayingPage .songsAlbumArt li').live("dblclick", function()	{
			
			Chatbeat.player.play($(this).attr('path'));			
		});
		
		
		$('#songsPage tbody tr, #songsPage .songsAlbumArt li').live("dblclick", function()	{
			
			artist_id = $(this).attr('artist_id');
			album_id = $(this).attr('album_id');
			id = $(this).attr('song_id');			
			
			$('#pageTitle').text('Now Playing > ' + $(_pageParent.active).text());
			
			$('#nowPlayingPage').html('');
			$('#songsPage .wrapper').clone().appendTo('#nowPlayingPage');
			$('#nowPlayingSelection').click();
			$('#songsPage').hide();
			
			var selected = $(this).attr("id");
		
			$('#nowPlayingPage tbody tr[id="'+ selected+'"]').dblclick();
		});
		
	
	}
	
});