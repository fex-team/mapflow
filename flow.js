function getPointAtLine( p, q, t ) {
    return [
        p[ 0 ] + t * ( q[ 0 ] - p[ 0 ] ),
        p[ 1 ] + t * ( q[ 1 ] - p[ 1 ] )
    ];
}

function divideBezier( a, b, c, d, t ) {
    var _ = getPointAtLine,
        e = _( a, b, t ),
        f = _( b, c, t ),
        g = _( c, d, t ),
        h = _( e, f, t ),
        j = _( f, g, t ),
        k = _( h, j, t );
    return [ [ a, e, h, k ], [ k, j, g, d ] ];
}

function findControllPoint( from, to ) {
    var dx = to.x - from.x,
        dy = to.y - from.y,
        L = Math.sqrt( dx * dx + dy * dy ),
        l = L * 0.1,
        dxx = dy * l / L,
        dyy = -Math.abs( dx ) * l / L;
    return {
        x: ( ( from.x + to.x ) / 2 ) + dxx,
        y: ( ( from.y + to.y ) / 2 ) + dyy
    };
}

var ConnectiveAnimator = kity.createClass( "ConnectiveAnimator", {
    base: kity.Animator,
    constructor: function () {
        this.callBase( {
            beginValue: 0,
            finishValue: 1,
            setter: function ( target, value ) {
                target.duration = value;
                target.draw();
            }
        } );
    }
} );

var Connective = kity.createClass( "Connective", {
    base: kity.Path,
    constructor: function ( map, fromPoint, toPoint ) {
        this.callBase();
        this.map = map;
        this.fromPoint = fromPoint;
        this.toPoint = toPoint;
        this.duration = 0;
        new ConnectiveAnimator().start( this, 2000, 'ease' );
    },
    draw: function () {
        var from = this.map.pointToPixel( this.fromPoint ),
            to = this.map.pointToPixel( this.toPoint ),
            c = findControllPoint( from, to, 20 ),
            curve = divideBezier( [ from.x, from.y ], [ c.x, c.y ], [ c.x, c.y ], [ to.x, to.y ], this.duration )[ 0 ];
        this.setPathData( [ 'M', curve.shift(), 'C', curve ] );
    }
} );

var ConnectiveGraph = kity.createClass( "ConnectiveGraph", {
    base: kity.Paper,
    mixins: [ window.BMap.Overlay ],
    constructor: function () {
        this.callBase( document.body );
        window.BMap.Overlay.apply( this );
        this.connectives = [];
        this.addShape( new kity.Rect( 10000, 10000, 0, 0 ).fill( 'black' ).setOpacity( 0.5 ) );
    },
    initialize: function ( map ) {
        this.map = map;
        return this.node;
    },
    draw: function () {
        this.setWidth( this.map.getSize().width );
        this.setHeight( this.map.getSize().height );
        this.connectives.forEach( function ( c ) {
            c.draw();
        } );
    },
    start: function ( fromPoint, toPoint ) {
        var c = new Connective( this.map, fromPoint, toPoint ).stroke( 'white', 1 ).setOpacity( 0.8 );
        this.addShape( c );
        this.connectives.push( c );
    }
} );

( function ( $, BMap ) {

    var targetCity = "南京",
        targetCityPosition;
    var connectiveCities = [ "江苏 南通", "上海 奉贤", "浙江 衢州", "福建 福州", "江苏 镇江", "福建 厦门", "日本 东京", "四川 成都", "浙江 杭州", "北京", "江苏 常熟", "安徽 滁州", "北京", "湖南 长沙", "江苏 无锡", "安徽 合肥", "广东 广州", "重庆", "上海 浦东", "黑龙江 大庆", "吉林 吉林", "韩国 首尔", "江苏 南通", "贵州 六盘水", "湖南 湘潭", "湖北 武汉", "江西抚州", "安徽 滁州", "山东 滕州", "江苏 扬州", "河南濮阳", "上海", "山东 青岛", "辽宁 沈阳", "天津", "上海", "广东 珠海", "山东东营", "四川 成都", "江苏苏州", "江苏 苏州", "河北 石家庄", "四川 眉山", "福建 厦门", "辽宁 沈阳", "广东 广州", "福建 莆田", "浙江 温州", "浙江 衢州", "江苏宿迁", "安徽 蚌埠", "湖北 武汉", "山东 济南", "广东 湛江", "黑龙江 牡丹江", "江苏 无锡", "上海", "浙江 杭州", "四川 眉山", "四川 成都", "江苏 常熟", "山西 朔州", "江西 萍乡", "江苏 泰州", "广东深圳", "安徽 滁州", "江苏 丹阳", "河南 安阳", "安徽", "北京", "海南 海口", "山西 晋城", "福建 厦门", "广西 桂林", "浙江 温州", "山东 济南", "江西 上饶", "河南 郑州", "浙江 杭州", "江苏 镇江", "北京", "山东 青岛", "浙江台州", "重庆", "黑龙江", "浙江 宁波", "安徽 亳州", "福建 福州", "山东 济宁", "河南郑州", "北京", "河南 信阳", "安徽 池州", "江苏 徐州", "浙江 杭州", "福建 莆田" ];

    var map = new BMap.Map( "container" );

    cameraTarget();

    function getGeoPosition( address, callback ) {
        $.ajax( {
            url: "http://api.map.baidu.com/geocoder/v2/",
            data: {
                address: address,
                output: "json",
                ak: "wiE55BGOG8BkGnpPs6UNtPbb"
            },
            dataType: 'jsonp',
            success: function ( response ) {
                if ( response.status === 0 ) {
                    var loc = response.result.location;
                    callback( new BMap.Point( loc.lng, loc.lat ) );
                }
            }
        } );
    }
    var cg;

    function cameraTarget() {
        getGeoPosition( targetCity, function ( cityPosition ) {
            targetCityPosition = cityPosition;
            map.centerAndZoom( cityPosition, 7 );
            map.enableScrollWheelZoom();
            map.addOverlay( cg = new ConnectiveGraph() );
            showConnective();
        } );
    }
    var startDelay = 0;

    function showConnective() {
        connectiveCities.forEach( function ( city ) {
            getGeoPosition( city, function ( cityPosition ) {
                setTimeout( function () {
                    cg.start( targetCityPosition, cityPosition );
                }, startDelay += 50 );
            } );
        } );
    }

    // $.ajax( {
    //     url: "http://api.map.baidu.com/geocoder/v2/",
    //     data: {
    //         address: "江苏南京",
    //         output: "json",
    //         ak: "wiE55BGOG8BkGnpPs6UNtPbb"
    //     },
    //     dataType: 'jsonp',
    //     success: function ( resp ) {
    //         if ( resp.status === 0 ) {
    //             var nanjing = new BMap.Point( resp.result.location.lng, resp.result.location.lat );
    //             map.centerAndZoom( nanjing, 7 );
    //             map.enableScrollWheelZoom();
    //             var h = 0;

    //             addresses.forEach( function ( address ) {
    //                 $.ajax( {
    //                     url: "http://api.map.baidu.com/geocoder/v2/",
    //                     data: {
    //                         address: address,
    //                         output: "json",
    //                         ak: "wiE55BGOG8BkGnpPs6UNtPbb"
    //                     },
    //                     dataType: 'jsonp',
    //                     success: function ( resp ) {
    //                         if ( resp.status == 0 ) {
    //                             var addr = new BMap.Point( resp.result.location.lng, resp.result.location.lat );
    //                             var points = [ nanjing, addr ];
    //                             h += 100;
    //                             h %= 360;
    //                             var curve = new BMapLib.CurveLine( points, {
    //                                 strokeColor: "blue",
    //                                 strokeWeight: 3,
    //                                 strokeOpacity: 0.5
    //                             } ); //创建弧线对象
    //                             map.addOverlay( curve ); //添加到地图中
    //                             var dot = new BMap.Circle( addr, 3, {
    //                                 color: 'red'
    //                             } );
    //                             dot.setFillColor( 'red' );
    //                             map.addOverlay( dot );
    //                         }
    //                     }
    //                 } );
    //             } );
    //         }
    //     }
    // } );

} )( window.$, window.BMap );