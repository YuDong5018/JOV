/*
			 *        |-----------------------------|----------|
			 *        |							    |          |
			 *        |							    |          |
			 *        |				1			    |    3     |
			 *        |							    |          |
			 * 		  |-----------------------------|          |
			 *        |				2			    |          |
			 *  	  |-----------------------------|----------|
			 */

/**
 * @param {Object} appendID
 * @param {Object} data
 * @param {Object} styleConfig
 */

window.styleConfig = {
    classificationColor: { // 各类颜色
        "0": "#D0637C",
        "1": "#EABEC3",
        "2": "rgba(255,255,255,0)",
        "3": "rgba(0,0,223,0.8)",
        "4": "rgba(23,32,16,0.8)"
    },
    classificationTextColor: { // 各类颜色
        "1": "rgba(0,0,0,0.9)",
        "2": "rgba(0,0,0,0.9)",
        "3": "rgba(0,0,0,0.9)",
        "4": "rgba(0,0,0,0.9)",
    },
    selectionBarColor: "rgba(86,71,121,1)", // brush 选区颜色
    selectionBarHeight: 12, //brush 选区高度
    selectionBarFillOpacity: 0.8, //brush 选区透明度
    lines: 4, //行数
    lineHeight: 0.3, //
    lineColor: "rgba(166,166,166,0.5)",

    rightRadio: 0.2,
    rightMaxWidth: 8,

    leftUpHeight: 50, //

    leftBottom: 0.2,
    leftBottomMaxWidth: 150,

    sliderWidth:50,
    sliderBarHeight:15,
    sliderBarColor:"rgba(75,75,75,0.8)",
    sliderBarBgColor:"rgba(150,150,150,0.3)",
    sliderMaxHeight:150,

    brushHeight: 30
}


function drawTimeLineByData(appendID, data, styleConfig) {
    window.realtimetimestart = 0;
    window.realtimeend = 24;
    function washData(data) {
        var _data = [];
        data.forEach(function(d, i) {
            d.times.forEach(function(_d, i) {
                _d["label"] = d["label"];
                _d["isIncluded"] = d["isIncluded"];
                _d["classification"] = d["classification"];
                _data.push(_d);
            })
        })
        return _data;
    }

    function getLayOutG(appendID, styleConfig) {
        var svgHeight = 1.0 * document.getElementById(appendID).clientHeight;
        var svgWidth = 1.0 * document.getElementById(appendID).clientWidth;

        var rightGWidth = styleConfig["rightRadio"] * svgWidth;
        if (rightGWidth > styleConfig['rightMaxWidth']) {
            rightGWidth = styleConfig['rightMaxWidth'];
        }
        var leftGWidth = svgWidth - rightGWidth;



        var leftGBottomHeight = svgHeight * styleConfig["leftBottom"]
        leftGBottomHeight = leftGBottomHeight > styleConfig["leftBottomMaxWidth"] ?
            styleConfig["leftBottomMaxWidth"] : leftGBottomHeight;

        var leftGUpHeight = svgHeight - leftGBottomHeight;

        var svg = d3v4.select("#" + appendID)
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
            .attr("preserveAspectRatio", "xMidYMid meet");
        //3
        var rightG = svg.append("g")
            .attr("class", "rightG")
            .attr("width", rightGWidth)
            .attr("height", svgHeight)
            .attr("transform", "translate(" + leftGWidth + ",0)");

        var leftG = svg.append("g")
            .attr("class", "leftG")
            .attr("transform", "translate(0,0)");

        svg.append("defs").append("clipPath")
            .attr("id", "leftGUpClip")
            .append("rect")
            .attr("width", leftGWidth)
            .attr("height", leftGUpHeight);

        svg.append("defs").append("clipPath")
            .attr("id", "leftGUpBottomClip")
            .append("rect")
            .attr("width", leftGWidth)
            .attr("height", leftGUpHeight -  styleConfig["lineHeight"] );
        //1
        var leftGUp = leftG.append("g")
            .attr("class", "leftGUp")
            .attr("width", leftGWidth)
            .attr("height", leftGUpHeight)
            .attr("leftGUpBottomHeight",leftGUpHeight -  styleConfig["lineHeight"])
            .attr("clip-path", "url(#leftGUpClip)")
            .attr("transform", "translate(0,0)");

        //2
        var leftGBottom = leftG.append("g")
            .attr("class", "leftGBottom")
            .attr("width", leftGWidth)
            .attr("height", leftGBottomHeight)
            .attr("transform", "translate(0," + leftGUpHeight + ")");
        return {
            "leftGUp": leftGUp,
            "leftGBottom": leftGBottom,
            "rightG": rightG
        };
    }


    function drawBrush(data, layOutG, styleConfig, brushedCallback) {
        var minTime = d3v4.min(data, function(d) {
            return d["starting_time"]
        })
        var maxTime = d3v4.max(data, function(d) {
            return d["ending_time"]
        })
        var x = d3v4.scaleTime()
            .range([0, layOutG["leftGBottom"].attr("width")])
            .domain([minTime, maxTime]);

        var xAxis = d3v4.axisBottom(x)
            .ticks(10, d3v4.timeMonth)
            .tickFormat(d => d3v4.timeFormat("%Y-%m")(d));

        layOutG["leftGBottom"].append("g")
            .attr("transform", "translate(0," + styleConfig["selectionBarHeight"] / 2 + ")")
            .call(xAxis.tickSize(styleConfig["selectionBarHeight"] / 2 + 5));

        var brush = d3v4.brushX()
            .extent([
                [0, 0],
                [layOutG["leftGBottom"].attr("width"), styleConfig["selectionBarHeight"]]
            ]).on("brush", function() {
                brushedCallback(x, data, layOutG, styleConfig);
            });
        var x1 = d3v4.scaleLinear()
            .range([0, 1 * layOutG["leftGBottom"].attr("width")]);
        layOutG["leftGBottom"].append("g")
            .call(brush)
            .call(brush.move, x1.range()).each(function(d) {
            d3v4.select(this).select(".selection")
                .style("fill-opacity", styleConfig["selectionBarFillOpacity"])
                .style("stroke", styleConfig["selectionBarColor"])
                .style("stroke-width", 0)
                .style("fill", styleConfig["selectionBarColor"]);
        });
        drawMainArea(new Date(minTime), new Date(maxTime), data, layOutG, styleConfig)
		window.maxTimeSelection = [new Date(minTime), new Date(maxTime)];
        window.timeSelection = [new Date(minTime), new Date(maxTime)];
        console.log("minTime", minTime, "maxTime", maxTime);
        console.log(window.timeSelection);
    }

    function toDays(d) {
        d = d || 0;
        return d / 24 / 60 / 60 / 1000;
    }

    function toUTC(d) {
        if (!d || !d.getFullYear) return 0;
        return Date.UTC(d.getFullYear(),
            d.getMonth(), d.getDate());
    }

    function daysBetween(d1, d2) {
        return toDays(toUTC(d2) - toUTC(d1));
    }


    function drawMainArea(minExtent, maxExtent, data, layOutG, styleConfig) {
        if (d3v4.select("#mainAreaG")) {
            d3v4.select("#mainAreaG").remove();
        }
        var mainAreaG = layOutG["leftGUp"].append("g").attr("id", "mainAreaG");
        var days = daysBetween(minExtent, maxExtent);
        var tFormat = "%Y-%m";
        var tTick = 'timeMonth';
        if (days < 40) {
            tFormat = "%Y-%m-%d";
            tTick = 'timeWeek';
        }
        var xTop = d3v4.scaleTime()
            .range([0, layOutG["leftGUp"].attr("width")])
            .domain([minExtent, maxExtent]);

        var xAxisTop = d3v4.axisBottom(xTop)
            .ticks(10, d3v4[tTick])
            .tickFormat(d => d3v4.timeFormat(tFormat)(d));
        mainAreaG.append("g").call(xAxisTop);

        var rectAreaG = mainAreaG.append("g")
            .attr("clip-path", "url(#leftGUpBottomClip)")
            .attr("transform", "translate(0," +1* styleConfig["leftUpHeight"] + ")");
        var rectAreaHeight = 1 * layOutG["leftGUp"].attr("height") - styleConfig["leftUpHeight"];


        //lines: 3, //行数
        //lineHeight: 3, //

        var rectHeight = (rectAreaHeight - 5 - styleConfig["lines"] * styleConfig["lineHeight"]) / styleConfig[
            "lines"];
        var rectAreaGMain =  rectAreaG.append("g")
            .attr("transform", "translate(0,-" +movePostion + ")")
            .attr("height",(rectHeight + styleConfig["lineHeight"]) * (data.length+0.8))
            .attr("id","rectAreaG");

        var toolTipDateFormat = d3v4.timeFormat("%Y-%m");

        var currentLine = rectAreaG.append("g").append('line')
            .style("stroke","blue")
            .attr('class', "currentLine")
            .attr("x1", xTop(new Date())).attr("x2", xTop(new Date())).attr("y1", 0).attr("y2", layOutG["leftGUp"].attr("height") -  styleConfig["lineHeight"] );

        var rectAndLine = rectAreaGMain.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", (d, i) => "translate(0," + i * (rectHeight + styleConfig["lineHeight"]) + ")")
            .each(function(d) {
                var clearver;
                d3v4.select(this).append("rect")
                    .attr("x", function(d) {
                        return xTop(d.starting_time);
                    }).attr("y", styleConfig["lineHeight"])
                    .attr("width", d => xTop(d.ending_time) - xTop(d.starting_time))
                    .attr("height", d => rectHeight)
                    .style("fill", d => styleConfig["classificationColor"][d["classification"]])
                    // .on("mouseover", function(d) {
                    //     clearTimeout(clearver)
                    //     div.transition()
                    //         .duration(200)
                    //         .style("opacity", .9);
                    //     div.html("Start Time " + toolTipDateFormat(d.starting_time) + "<br>" + "End Time " +
                    //         toolTipDateFormat(d.ending_time))
                    //         .style("left", (d3v4.event.pageX+10) + "px")
                    //         .style("top", (d3v4.event.pageY - 10) + "px");
                    // })
                    // .on("mousemove", function(d) {
                    //     clearTimeout(clearver)
                    //     div.transition()
                    //         .duration(200)
                    //         .style("opacity", .9);
                    //     div.html("Start Time " + toolTipDateFormat(d.starting_time) + "<br>" + "End Time " +
                    //         toolTipDateFormat(d.ending_time))
                    //         .style("left", (d3v4.event.pageX+10) + "px")
                    //         .style("top", (d3v4.event.pageY - 10) + "px");
                    // })
                    // .on("mouseout", function(d) {
                    //     clearver = setTimeout(function(){
                    //         div.transition()
                    //             .duration(500)
                    //             .style("opacity", 0);
                    //     },100);
                    // });
                d3v4.select(this).append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("y2", 0)
                    .attr("x2", 1 * layOutG["leftGUp"].attr("width"))
                    .style("stroke", styleConfig["lineColor"])
                    .style("stroke-width", styleConfig["lineHeight"])

                if (xTop(d.ending_time) > xTop(new Date(minExtent))) {
                    d3v4.select(this).append("text")
                        .attr("y", styleConfig["lineHeight"] + rectHeight / 2 + 5)
                        .text(d["label"])
                        .style('font-family', 'Helvetica')
                        .style('font-size', "12px")
                        .style("text-anchor", "middle")
                        .style("stroke", d => styleConfig["classificationTextColor"][d["classification"]])
                        .attr("x", d => {
                            if (1*xTop(new Date(maxExtent)) <= 1*xTop(d.ending_time) &&
                                1*xTop(d.starting_time) <= 1*xTop(new Date(minExtent))) {
                                return 1*xTop(new Date(maxExtent)) / 2 + 1*xTop(new Date(minExtent)) / 2;
                            }

                            if (1*xTop(new Date(maxExtent)) >= 1*xTop(d.ending_time) &&
                                1*xTop(d.starting_time) >= 1*xTop(new Date(minExtent))) {
                                return 1*xTop(d.ending_time) / 2 + 1*xTop(d.starting_time) / 2;
                            } else if (1*xTop(new Date(maxExtent)) <= 1*xTop(d.ending_time)) {
                                return (1*xTop(d.starting_time) + 1*xTop(new Date(maxExtent))) / 2;
                            } else {
                                return 1*xTop(d.ending_time) / 2 + 1*xTop(new Date(minExtent)) / 2;
                            }
                        });
                }
            });

    }

    function brushedCallback(x, data, layOutG, styleConfig) {
        if (!d3v4.event.sourceEvent) return; // Only transition after input.
        if (!d3v4.event.selection) return; // Ignore empty selections.

        var timeSelection = d3v4.event.selection.map(x.invert);
        //console.log("timeSelection", timeSelection);

        window.timeSelection = timeSelection

        var minExtent = timeSelection[0];
        var maxExtent = timeSelection[1];
        drawMainArea(minExtent, maxExtent, data, layOutG, styleConfig)

        var timestart = getFormatDatetoNormal(window.timeSelection[0]);
        var timeend = getFormatDatetoNormal(window.timeSelection[1]);

        //console.log([timestart, timeend]);

        if (timestart === "2020-03-25"){
            timestart == "2020-01-01";
        }

        var startarr = timestart.split("-");
        var endarr = timeend.split("-");
        var tempyear = Number(endarr[0]) - Number(startarr[0]);
        var tempmonth = Number(endarr[1]) - Number(startarr[1]);
        var tempday = Number(endarr[2]) - Number(startarr[2]);

        var tempstart = Number(startarr[0]) - 2020;
        var tempstartseq = tempstart * 12 + Number(startarr[1]) - 1;


        var timespan = tempyear * 12 + tempmonth;
        var timespanarr = [{
            "timespan": timespan,
            "timestart": startarr[0] + '-' + startarr[1],
            "timeend": endarr[0] + '-' + endarr[1],
            "timestartseq": tempstartseq
        }]
        //console.log(timespanarr);

        window.realtimetimestart = Number(timespanarr[0].timestartseq);
        window.realtimeend = Number(timespanarr[0].timestartseq) + Number(timespanarr[0].timespan);
        //window.realtimearr = [realtimetimestart, realtimeend];

        if ((timeend == "2022-01-31") && (timestart == "2020-01-01")){
            window.timelineflag = 0;
        }
        else{
            window.timelineflag = 1;
        }

        // setTimeout(console.log(timespanarr),200);
        //
        // console.log(map.getSource('lga-polygon'));

    }

    function drawRightSlider(layOutG,styleConfig){
        var height =1* layOutG["rightG"].attr("height");
        var width = 1* layOutG["rightG"].attr("width");
        height = height > styleConfig["sliderMaxHeight"] ? styleConfig["sliderMaxHeight"] :height;
        layOutG["rightG"].append("g").append("rect")
            .attr("x",width/2-(styleConfig["sliderWidth"]<width?styleConfig["sliderWidth"]:width)/2 + 10)
            .style("fill",styleConfig["sliderBarBgColor"])
            .attr("height",height)
            .attr("width",styleConfig["sliderWidth"]<width?styleConfig["sliderWidth"]:width);

        layOutG["rightG"].append("g").append("rect")
            .attr("x",width/2-(styleConfig["sliderWidth"]<width?styleConfig["sliderWidth"]:width)/2 + 10)
            .style("fill",styleConfig["sliderBarColor"])
            .attr("height",styleConfig["sliderBarHeight"])
            .style("cursor","move")
            .attr("width",styleConfig["sliderWidth"]<width?styleConfig["sliderWidth"]:width)
            .call(
                d3v4.drag().on("drag", function() {
                    var position =  1*d3v4.event.y <=0 ?0: 1*d3v4.event.y ;
                    if(d3v4.event.y > 0){
                        position = 1*d3v4.event.y > height - styleConfig["sliderBarHeight"]?height - styleConfig["sliderBarHeight"]:d3v4.event.y;
                    }
                    d3v4.select(this).attr("transform", "translate(0, " + position +")");

                    var leftGUpBottomHeight = 1*layOutG["leftGUp"].attr("leftGUpBottomHeight");
                    var totalLeftGUpBottomHeight = 1*d3v4.select("#rectAreaG").attr("height");

                    window.movePostion = (position/(height - styleConfig["sliderBarHeight"])) * (totalLeftGUpBottomHeight - leftGUpBottomHeight + 50);
                    d3v4.select("#rectAreaG").attr("transform", "translate(0,-"+movePostion+")");
                })
            );

    }

    var mainTopY = 0;
    window.movePostion =0;
    data = washData(data);
    var layOutG = getLayOutG(appendID, styleConfig);
    var div = d3v4.select("body").append("div")
        .attr("class", "tooltip")
        .style("z-index","1000")
        .style("background","rgba(0,0,0,0.3)")
        .style("position","absolute")
        .style("padding","10px")
        .style("color","white")
        .style("border-radius","5px")
        .style("opacity", 0);
    drawBrush(data, layOutG, styleConfig, brushedCallback);
    drawRightSlider(layOutG,styleConfig);

}