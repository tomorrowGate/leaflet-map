function showCharts(url, type) {
    var chart;
    switch (type) {
        case 0:
            chart = getPipChart('container' + type, '苗木进场分析');
            break;
        case 1:
            chart = getPipChart('container' + type, '种植进度分析');
            break;
        case 2:
            chart = getPipChart('container' + type, '定位进度分析');
            break;
        case 3:
            chart = getLineChart('container' + type, '各标段合格率分析');
            break;
    }
    chart.showLoading();
    $.get(url, null,
        function (data) {

            switch (type) {
                case 0:
                    showPipChart(chart, '苗木进场总数', data);
                    break;
                case 1:
                    showPipChart(chart, '种植数量', data);
                    break;
                case 2:
                    showPipChart(chart, '定位数量', data);
                    break;
                case 3:
                    showQualityChart(chart, data);
                    break;
            }
        });
}

//种植质量分析 按标段  监理验收合格率  业主抽查合格率
function showQualityChart(chart, datas) {
    var self = this;

    var x_time = []; //x轴
    var secOne_datas = []; //监理验收合格率
    var secTwo_datas = []; //业主抽查合格率

    var sectionList = [];
    var wpData = self.wpUnits;
    for (var i = 0; i < wpData.length; i++) {
        if (wpData[i].Section.indexOf("标段") > 0) {
            sectionList.push(wpData[i].Section);
        }
    }

    //标段去重
    var sectionData = [];
    var json = {};
    for (var i = 0; i < sectionList.length; i++) {
        if (!json[sectionList[i]]) {
            sectionData.push(sectionList[i]);
            json[sectionList[i]] = 1;
        }
    }
    sectionData.sort();


    if (datas.length != 0) {

        for (var i = 0; i < datas.length; i++) {
            for (var j = 0; j < wpData.length; j++) {
                if (datas[i].Label == wpData[j].No) {
                    datas[i].Label = wpData[j].Section;
                }
            }
        }

        var timeList = [];

        for (var i = 0; i < datas.length; i++) {
            for (var j = 0; j < sectionData.length; j++) {
                if (datas[i].Label == sectionData[j]) {
                    timeList.push(datas[i].Label);
                }
            }
        }
        //标段去重
        var timeData = [];
        var _json2 = {};
        for (var i = 0; i < timeList.length; i++) {
            if (!_json2[timeList[i]]) {
                timeData.push(timeList[i]);
                _json2[timeList[i]] = 1;
            }
        }
        timeData.sort();

        for (var i = 0; i < timeData.length; i++) {
            x_time.push(timeData[i]);

            var rate1 = 0;
            var rate2 = 0;
            var num1 = 0;
            var num2 = 0;
            var num3 = 0;
            var num4 = 0;
            var sum1 = 0;
            var sum2 = 0;
            for (var j = 0; j < datas.length; j++) {
                if (timeData[i] == datas[j].Label && datas[j].Status == 0) {
                    num1 = datas[j].Num != null ? datas[j].Num : 0;
                } else if (timeData[i] == datas[j].Label && datas[j].Status == 1) {
                    num2 = datas[j].Num != null ? datas[j].Num : 0;
                } else if (timeData[i] == datas[j].Label && datas[j].Status == 2) {
                    num3 = datas[j].Num != null ? datas[j].Num : 0;
                } else if (timeData[i] == datas[j].Label && datas[j].Status == 3) {
                    num4 = datas[j].Num != null ? datas[j].Num : 0;
                }
                sum1 = num1 + num2 == 0 ? 1 : num1 + num2;
                sum2 = num3 + num4 == 0 ? 1 : num3 + num4;
                //rate1 = (100*num2/sum1).toFixed(1);
                //rate2 = (parseFloat(100*num3/sum2)).toFixed(1);
                rate1 = parseFloat((100 * num2 / (num1 + num2)).toFixed(1));
                rate2 = parseFloat((100 * num3 / (num3 + num4)).toFixed(1));
            }
            secOne_datas.push(rate1);
            secTwo_datas.push(rate2);
        }
        //console.log(secTwo_datas);
        //console.log(secOne_datas);

        chart.addSeries({
            name: '监理验收合格率',
            type: 'column',
            data: secTwo_datas,
            yAxis: 0
        });
        chart.addSeries({
            name: '业主抽查合格率',
            type: 'column',
            data: secOne_datas,
            yAxis: 0
        });

        //chart.xAxis[0].setCategories(x_time);
    }
    chart.xAxis[0].setCategories(x_time);
    chart.redraw();
    chart.hideLoading();
}


function getLineChart(container, title) {
    return Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            title: { enabled: false }
        },
        credits: {
            enabled: false
        },
        series: []
    });
}

function getPipChart(container, title) {
    return Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: title
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: '{series.name}<br>',
            pointFormat: '{point.name}: <b>{point.y}({point.percentage:.1f}%)</b>'
        },
        series: []
    });
}

function showPipChart(chart, yText, data) {
    var series_data = [
        {
            name: '1标段',
            y: 0
        }, {
            name: '2标段',
            y: 0
        }, {
            name: '3标段',
            y: 0
        }, {
            name: '4标段',
            y: 0
        }, {
            name: '5标段',
            y: 0
        }];
    data.forEach(function (element) {
        if (element.Section) {
            switch (element.Section.substring(0, 1)) {
                case '1':
                    series_data[0].y += element.Num;
                    break;
                case '2':
                    series_data[1].y += element.Num;
                    break;
                case '3':
                    series_data[2].y += element.Num;
                    break;
                case '4':
                    series_data[3].y += element.Num;
                    break;
                case '':
                    series_data[4].y += element.Num;
                    break;
            }
        }
    }, this);
    chart.addSeries({
        type: 'pie',
        name: yText,
        data: series_data
    });
    chart.redraw();
    chart.hideLoading();
}

var wpUnits = [];

$.get("http://124.160.68.105:9000/tree/wpunits?parent=", null,
    function (data) {
        wpUnits = data;
        console.log("Data Loaded: " + data);
    }
)
