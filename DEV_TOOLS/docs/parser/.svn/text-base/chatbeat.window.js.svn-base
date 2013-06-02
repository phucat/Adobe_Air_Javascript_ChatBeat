/**
* Chatbeat component that is responsible on  overall native windows behaviour.
* @class window
* @constructor 
* @namespace Chatbeat 
*/
Chatbeat.addComponent('window', {
	
	/**
	* status of window
	* @property state {[normal or maximized]}
	*/
	state : 'normal',
	
	/**
	* this method is automatically loaded onStart of the application called by Chatbeat.initComponent <br>
	* - initialize the startup window positioning and size. <br>
	* - applies the correct effects of window depending on the users operating system
	* @method init
	*/
	init : function()	{
	
		cbWindiwParent = this;
		
		window.nativeWindow.x = Math.ceil((air.Capabilities.screenResolutionX - window.nativeWindow.width) / 2);
		window.nativeWindow.y = Math.ceil((air.Capabilities.screenResolutionY - window.nativeWindow.height) / 2);	
		
		$('#moveHandle').mousedown(function(e) {
			window.nativeWindow.startMove()
		});
				
		$('#moveHandle').dblclick(function(e) {
			if(window.nativeWindow.displayState == 'normal')	{
				window.nativeWindow.maximize();	
				cbWindiwParent.state = 'maximized';	
			}	else	{
				window.nativeWindow.restore();
				cbWindiwParent.state = 'normal';				
			}
			
		});
	
		$('#closeBtn').click(function()	{
			window.nativeWindow.close();
		});
		
		$('#minBtn').click(function()	{
			
			window.nativeWindow.minimize();
	
		});
		
		$('#maxBtn').click(function()	{
			if(window.nativeWindow.displayState == 'normal')	{
				window.nativeWindow.maximize();	
				cbWindiwParent.state = 'maximized';
			}	else	{
				window.nativeWindow.restore();
				cbWindiwParent.state = 'normal';
			}
		});
		
		$('#resizeHandle .top').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.TOP);
		});

		$('#resizeHandle .bottom').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.BOTTOM);
		});

		$('#resizeHandle .left').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.LEFT);
		});

		$('#resizeHandle .right').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.RIGHT);
		});
		
		$('#resizeHandle .bottom-right').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.BOTTOM_RIGHT);
		});
		$('#resizeHandle .bottom-left').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.BOTTOM_LEFT);
		});
		$('#resizeHandle .top-right').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.TOP_RIGHT);
		});
		$('#resizeHandle .top-left').mousedown(function()	{
			window.nativeWindow.startResize(air.NativeWindowResize.TOP_LEFT);
		});
		
		window.nativeWindow.minSize = new air.Point(650, 500);
		
		function resizeWrapper()	{
			
			if(!air.NativeWindow.supportsTransparency || Chatbeat.mode == 'light')	{
				
				$('#wrapper').width(window.nativeWindow.width);
				$('#wrapper').height(window.nativeWindow.height);
				$('body').width(window.nativeWindow.width);
				$('body').height(window.nativeWindow.height);
				$('html').width(window.nativeWindow.width);
				$('html').height(window.nativeWindow.height);

				$('#wrapper').css("-webkit-border-radius", "0");
				$('#wrapper').css("opacity", "1");
				$('#moveHandle').css("-webkit-border-radius", "0");
				$('#playerControls').css("-webkit-border-radius", "0");

				$('#wrapper').css("margin", "0");
				$('#wrapper').css("-webkit-box-shadow", "none");
				
			

			}	else	{
				$('#wrapper').width(window.nativeWindow.width - 50);
				$('#wrapper').height(window.nativeWindow.height - 50);				
			}
			
			
			
			var subs = $('#wrapper').height() - 170;
			$('#mainDuration').width($('#wrapper').width() - 180)
			$('#contents').height(subs);
			$('#leftPanel').height(subs);
			$('#rightPanel').height(subs);			
			$('#centerPanel').height(subs);
			
			$('#searchInput').width($('#rightPanel').width() - 50);

			Chatbeat.videoObj.height = $('#centerPanel').height() -42;	
			Chatbeat.videoObj.width = $('#centerPanel').width();	
			//Chatbeat.videoObj.height = getAspectHeight($('#centerPanel').width(), 640, 480);

			var offset = $("#centerPanel").offset();
			Chatbeat.videoObj.x =  offset.left;
			Chatbeat.videoObj.y =  offset.top + 42;			
			
			$('#toastWindow').css("top", (($('#wrapper').height() - $('#toastWindow').outerHeight()) / 2));
			$('#toastWindow').css("left", (($('#wrapper').width() - $('#toastWindow').outerWidth()) / 2));
		}
		
		function getAspectWidth(newHeight,orginalWidth,originalHeight)	{
		
			var aspectRatio = orginalWidth / originalHeight;
			return newHeight * aspectRatio;
		}
		
		function getAspectHeight(newWidth,orginalWidth,originalHeight)	{
		
			var aspectRatio = originalHeight / orginalWidth;
			return newWidth * aspectRatio;
		}
		
		resizeWrapper();
		
		window.nativeWindow.addEventListener(air.Event.RESIZE, resizeWrapper);
		
		if(Chatbeat.debug)	{
			air.Introspector.Console.log("Supports Transparency : " + air.NativeWindow.supportsTransparency);
		}
		
		
	},
	
	toast : function(title, message)	{
		
		alert('unable to play!');
	}
	
});
