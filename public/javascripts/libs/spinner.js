// ** Begin spin plugin
// @author      : trankhanh
// @description : add/remove ajax spinner into page

define(['jquery'], function () {
  var timeout_id, counter_start, counter_1, counter_2, counter_3,
    $spinner_0, $spinner_1, $spinner_2, $spinner_3, $el,
    spin_num = 11;

  function config(map) {
    var i;

    // setting up default configuration if no arguments are found
    if (typeof map !== 'object') { map = {}; }
    if (typeof map.el !== 'string') { map.el = '.spinner'; }
    if (typeof map.translateX !== 'string') { map.translateX = '4px'; }
    if (typeof map.width !== 'string') { map.width = '6px'; }
    if (typeof map.bgColor !== 'string') {
      map.bgColor = 'rgb(255, 255, 255)';
    }
    $el = $(map.el);

    // return if spinner already exist
    if ($el.html() !== '') { return; }

    // add html to spinner
    $el.append('<div role="progressbar" class="spin-js"></div>');

    $(map.el + ' > div').css({ position: 'relative', width: '0px', zIndex: 2000000000 });

    for (i = 0; i < spin_num; i++) {
      $(map.el + ' > div').append('<div><div></div></div>');
    }

    for (i = 1; i < spin_num + 1; i++) {
      $(map.el + ' > div > div:nth-child(' + i + ') > div').css({
        backgroundColor         : map.bgColor,
        width                   : map.width,
        height                  : '2px',
        transform               : 'rotate(' + 327 / (spin_num - 1) * (i - 1) + 'deg) translate(' + map.translateX + ', 0px)',
        position                : 'absolute',
        boxShadow               : 'rgba(0, 0, 0, 0.0980392) 0px 0px 1px',
        transformOrigin         : '0% 50%',
        borderTopLeftRadius     : '1px',
        borderTopRightRadius    : '1px',
        borderBottomRightRadius : '1px',
        borderBottomLeftRadius  : '1px',
        backgroundPosition      : 'initial initial',
        backgroundRepeat        : 'initial initial'
      });
    }
  }

  function spin() {
    counter_start = counter_start || 0;

    switch (counter_start) {
    case 9:
      counter_1 = counter_start + 1;
      counter_2  = counter_start + 2;
      counter_3 = 1;
      break;
    case 10:
      counter_1  = counter_start + 1;
      counter_2  = 1;
      counter_3  = 2;
      break;
    case 11:
      counter_1  = 1;
      counter_2  = 2;
      counter_3  = 3;
      counter_start   = 1;
      break;
    default:
      counter_1  = counter_start + 1;
      counter_2  = counter_start + 2;
      counter_3  = counter_start + 3;
      break;
    }

    $spinner_0        = $('.spin-js > div:nth-child(' + counter_start + ')');
    $spinner_1 = $('.spin-js > div:nth-child(' + counter_1 + ')');
    $spinner_2 = $('.spin-js > div:nth-child(' + counter_2 + ')');
    $spinner_3 = $('.spin-js > div:nth-child(' + counter_3 + ')');

    $('.spin-js > div').css({ opacity: 0.25 });

    $spinner_0.css({opacity: 0.45});
    $spinner_1.css({opacity: 0.65});
    $spinner_2.css({opacity: 0.85});
    $spinner_3.css({opacity: 1});
    counter_start++;
    timeout_id = setTimeout(spin, 100);
  }

  function start(map) {
    config(map);
    $el.show();
    spin();
  }

  return {
    start : start,
    stop  : function () {
      // if (typeof $el !== 'undefined') {
        $el.hide();
        clearTimeout(timeout_id);
      // }
    }
  };
});
