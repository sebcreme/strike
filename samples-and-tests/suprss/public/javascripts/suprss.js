Lucky.onready(function(){suprss.init()})
suprss = {
    init : function(){
        this.loadItems()
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
            })
    }
}