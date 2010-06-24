//added in emulator

Lucky =null;

emulator = {
    orientationIndex: 3,
    init: function(){
        var _this = this;
        $('body').keyup(function(e){
            if((e.keyCode == 37 || e.keyCode == 39) && e.shiftKey === true){
                _this.changeOrientation( e.keyCode == 37 ? -1 : 1 );
            }
        });
        //override Lucky.locate for using the emulator geopicker
        $('#emulatorContent').load(function(){
          Lucky = this.contentWindow.Lucky
          this.contentWindow.Lucky.locate = function(handler){
            Lucky.handlers['locate'] = handler;
            parent.window.emulator.geoPicker( handler );
          }
        })
    },
    changeOrientation: function( direction ){
        var degrees = [ 90, 180, -90, 0 ];
        this.orientationIndex = ( this.orientationIndex + direction ) % degrees.length;
        if(this.orientationIndex < 0)this.orientationIndex = degrees.length - 1;
        var orientation = degrees[ this.orientationIndex ];
        
        var elements = $("div.emulator,#emulatorContent");
        elements.removeClass('up down left right');
        switch(orientation){
            case 90:
                elements.addClass('right');
                break;
            case -90:
                elements.addClass('left');
                break;
            case 0:
                elements.addClass('up');
                break;
            case 180:
                elements.addClass('down');
                break;
        }
        
        $("#emulatorContent")[0].contentWindow.Lucky.orientationChange( orientation );
    },
    geoPicker: function( handler ){
          var _this = this;
          // Open the Google Map window... 
          var map = jQuery( '#geopicker' );
          map.attr( "src", "@geopicker" );
          map.bind("load", function(){
              var $this = jQuery( this );
              $this.fadeIn();
              this.contentWindow.geopicker.setCallback( function( pos ){
                  if( pos == null ){
                      $this.fadeOut();
                      return;
                  }

                  Lucky.commandResult('locate', { longitude:pos.b, latitude:pos.c, accuracy:100 });
                  // Hide the map
                  setTimeout(function(){
                      $this.fadeOut();
                  },400);
              });
          });

      }
};
