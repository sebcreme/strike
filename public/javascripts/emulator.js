var emulator = {
    orientationIndex: 3,
    init: function(){
        var _this = this;
        $('body').keyup(function(e){
            if((e.keyCode == 37 || e.keyCode == 39) && e.shiftKey === true){
                _this.changeOrientation( e.keyCode == 37 ? -1 : 1 );
            }
        });
    },
    changeOrientation: function( direction ){
        var degrees = [ 90, 180, -90, 0 ];
        this.orientationIndex = ( this.orientationIndex + direction ) % degrees.length;
        if(this.orientationIndex < 0)this.orientationIndex = degrees.length - 1;
        var orientation = degrees[ this.orientationIndex ];
        
        var container = $("div.emulator");
        var contents = $("#emulatorContent");
        var elements = $("div.emulator,#emulatorContent");
        elements.removeClass('up down left right');
        switch(orientation){
            case 90:
                elements.addClass('right');
                contents.css({
                    "-webkit-transform": "rotate(90)",
                    "-webkit-transition:": "-webkit-transform 0.5s linear"
                })
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
    }
};
