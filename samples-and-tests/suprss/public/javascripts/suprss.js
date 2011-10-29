Lucky.onready(function(){suprss.init()});
suprss = {
    init : function(){

        // Temporary test for emulator rotation
        Lucky.onorientationchange(function( orientation ){
            console.log( orientation )
        });
        this.loadItems()

        // Temporary "GEO" button for testing fake geo location
        /*var button = document.createElement('input');
        button.setAttribute( "type", "button" );
        button.setAttribute( "value", "GEO test");
        button.setAttribute( "id", "geotest" );
        button.addEventListener("click", function(){
            // do the geo location...
            Lucky.locate(function(obj){
                window.parent.document.getElementsByTagName("input")[0].value = "GEO " + obj.latitude + ":" + obj.longitude;
            });
        }, false);
        window.parent.document.getElementsByTagName("div")[0].appendChild(button); */
    },
    loadItems : function(){
            $ajax('get','/public/rss.xml', function(list){
               var data, html = "", items = list.getElementsByTagName('item')
               for ( var i = 0; i < items.length; i++ )
                {
                    data = {}
                    var date = new Date(items.item(i).querySelectorAll('pubDate')[0].firstChild.nodeValue)
                    data.id = 'art'+i
                    data.date = date.toLocaleDateString()
                    data.title = items.item(i).querySelectorAll('title')[0].firstChild.nodeValue
                    data.link = items.item(i).querySelectorAll('link')[0].firstChild.nodeValue
                    data.description = items.item(i).querySelectorAll('description')[0].firstChild.nodeValue
                    html += tmpl("item_tmpl",data)
                }
                $("li")[0].innerHTML = html
                $('.item').each(function(item){
                    item.on('click',function(){
                            if ($hasClass(this, 'active')){
                                $removeClass(this, 'active')
                            } else {
                                $('.active').each(function(el){$removeClass(el, 'active')})
                                $addClass(this, 'active')
                            }
                    })
                })

                console.log(document.getElementById('locate'))
            })
    }
}