var addresses = ["江苏 南通", "上海 奉贤", "浙江 衢州", "福建 福州", "江苏 镇江", "福建 厦门", "日本 东京", "四川 成都", "浙江 杭州", "北京", "江苏 常熟", "安徽 滁州", "北京", "湖南 长沙", "江苏 无锡", "安徽 合肥", "广东 广州", "重庆", "上海 浦东", "黑龙江 大庆", "吉林 吉林", "韩国 首尔", "江苏 南通", "贵州 六盘水", "湖南 湘潭", "湖北 武汉", "江西抚州", "安徽 滁州", "山东 滕州", "江苏 扬州", "河南濮阳", "上海", "山东 青岛", "辽宁 沈阳", "天津", "上海", "广东 珠海", "山东东营", "四川 成都", "江苏苏州", "江苏 苏州", "河北 石家庄", "四川 眉山", "福建 厦门", "辽宁 沈阳", "广东 广州", "福建 莆田", "浙江 温州", "浙江 衢州", "江苏宿迁", "安徽 蚌埠", "湖北 武汉", "山东 济南", "广东 湛江", "黑龙江 牡丹江", "江苏 无锡", "上海", "浙江 杭州", "四川 眉山", "四川 成都", "江苏 常熟", "山西 朔州", "江西 萍乡", "江苏 泰州", "广东深圳", "安徽 滁州", "江苏 丹阳", "河南 安阳", "安徽", "北京", "海南 海口", "山西 晋城", "福建 厦门", "广西 桂林", "浙江 温州", "山东 济南", "江西 上饶", "河南 郑州", "浙江 杭州", "江苏 镇江", "北京", "山东 青岛", "浙江台州", "重庆", "黑龙江", "浙江 宁波", "安徽 亳州", "福建 福州", "山东 济宁", "河南郑州", "北京", "河南 信阳", "安徽 池州", "江苏 徐州", "浙江 杭州", "福建 莆田"];

var addr_pos = {};
var ready = 0;
addresses.forEach(function (address) {
    $.ajax({
        url: "http://api.map.baidu.com/geocoder/v2/",
        data: {
            address: address,
            output: "json",
            ak: "wiE55BGOG8BkGnpPs6UNtPbb"
        },
        dataType: 'jsonp',
        success: function (resp) {
            if (resp.status == 0) {
                addr_pos[address] = new BMap.Point(resp.result.location.lng, resp.result.location.lat)
            }
            if (++ready == addresses.length) render();
        }
    });
});

function render() {
    var map = new BMap.Map("container");
    $.ajax({
        url: "http://api.map.baidu.com/geocoder/v2/",
        data: {
            address: "江苏南京",
            output: "json",
            ak: "wiE55BGOG8BkGnpPs6UNtPbb"
        },
        dataType: 'jsonp',
        success: function (resp) {
            if (resp.status == 0) {
                var nanjing = new BMap.Point(resp.result.location.lng, resp.result.location.lat);
                map.centerAndZoom(nanjing, 7);
                map.enableScrollWheelZoom();
                var h = 0;
                for (var addr in addr_pos) {
                    var points = [nanjing, addr_pos[addr]];
                    console.log(points);
                    h += 100;
                    h %= 360;
                    var curve = new BMapLib.CurveLine(points, { strokeColor: "hsl(" + h + ", 100%, 50%)", strokeWeight: 3, strokeOpacity: 0.5 }); //创建弧线对象
                    map.addOverlay(curve); //添加到地图中
                    var dot = new BMap.Circle(addr_pos[addr], 3, { color: 'red' });
                    dot.setFillColor('red');
                    map.addOverlay(dot);
                }
            }
        }
    });

    //var beijingPosition = new BMap.Point(116.432045, 39.910683),
    //    hangzhouPosition = new BMap.Point(120.129721, 30.314429),
    //    taiwanPosition = new BMap.Point(121.491121, 25.127053);
    //var points = [beijingPosition, hangzhouPosition, taiwanPosition];

    //var curve = new BMapLib.CurveLine(points, { strokeColor: "blue", strokeWeight: 3, strokeOpacity: 0.5 }); //创建弧线对象
    //map.addOverlay(curve); //添加到地图中
    //curve.enableEditing(); //开启编辑功能
}