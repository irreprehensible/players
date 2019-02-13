(function ($) {

    $.fn.countdown = function (options) {

        var settings = $.extend({
            "seconds": 0,
            "ongoing": true,
            "selector-start": "",
            "selector-pause": "",
            "prefix-text": "",
            "stop-text": "00:00",
            "normal-class": "",
            "warning-class": "",
            "stop-class": "",
            "warning-time": 0,
            "warning-text":""
        }, options);
        var timer;
        var elem = this;
        var ongoing = settings['ongoing'];

        function draw() {
            if (settings['seconds'] <= 0) {
                $(elem).html(settings['stop-text']);
                $(elem).removeClass(settings['normal-class']).removeClass(settings['warning-class']).addClass(settings['stop-class']);
                clearInterval(timer);
            } else {
                if (settings['seconds'] <= settings['warning-time'] && !$(elem).hasClass(settings['warning-class'])) {
                    $(elem).removeClass(settings['normal-class']).addClass(settings['warning-class']);
                }
                var res = Math.floor(settings['seconds'] / 60) < 10 ? "0" + Math.floor(settings['seconds'] / 60) : Math.floor(settings['seconds'] / 60);
                res = res + ':' + (settings['seconds'] % 60 < 10 ? "0" + (settings['seconds'] % 60) : settings['seconds'] % 60);
                if($(elem).hasClass(settings['warning-class'])){
                    $(elem).html(settings['prefix-text'] + res +'<br><b>'+settings['warning-text']+'</b>');
                }
                else{
                    $(elem).html(settings['prefix-text'] + res);
                }
            }

        }

        $(settings['selector-start']).bind("click", function () {
            if (!ongoing) {
                timer = setInterval(function () {
                    settings['seconds']--;
                    draw();
                    
                }, 1000);
                ongoing = true;
            }
        });
        var callback = function(){
            alert();
        }
        $(settings['selector-pause']).bind("click", function () {
            clearInterval(timer);
            ongoing = false;
        });

        $(elem).removeClass(settings['stop-class']).removeClass(settings['warning-class']).addClass(settings['normal-class']);
        
        draw();

        if (ongoing) {
            timer = setInterval(function () {
                settings['seconds']--;
                draw();
                if(settings['seconds']==0){
                    callUpdate();
                }
            }, 1000);
        }
    };
})(jQuery);

