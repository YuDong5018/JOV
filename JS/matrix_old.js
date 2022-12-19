//var mapcirclecolor = ["#2E8B57","#483D8B","#e69e19"]
window.styleControler = {
    "unclustered": {
        color: "#483D8B",
        strokeWidth: 5,
        strokeColor: "rgba(221,54,130,1)",
        innertSize: 0.8 //内部方块的大小  80%
    },
    "clustered": {
        color: "#2E8B57",
        strokeWidth: 5,
        strokeColor: "rgba(221,54,130,1)",
        innertSize: 0.8 //内部方块的大小  80%
    },
    "grouped": {
        color: "#e69e19",
        strokeWidth: 5,
        strokeColor: "rgba(221,54,130,1)",
        innertSize: 0.8 //内部方块的大小  80%
    }
};
const appendIdStr = "appendSVG";
const cols = 20;
const rectPadding = 1;
matrixsvg = null;
/**
 * @param {Object} eleID	追加元素的id
 * @param {Object} data		指定格式定义好的数据
 * @param {Object} styleControler		格式控制数组
 * @param {Object} cols		一行多少列
 * @param {Object} padding		方格之前的间距
 * @param {Object} mapcirclecolor		方格的颜色
 */
function playRects(eleID, data, styleControler, cols, padding, mapcirclecolor) {
    console.log(data);
    var svgHeight = document.getElementById(eleID).clientHeight;
    var svgWidth = document.getElementById(eleID).clientWidth-10;
    var rectWH = parseInt((svgWidth - (cols - 1) * padding) / cols);
    if(matrixsvg){
        matrixsvg.remove();
    }
    matrixsvg = d3.select("#" + eleID)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);
    var svg = matrixsvg;


    function sortByCaseNum(data, sortType = "desc") {
        for (var i = 0; i < data.length; i++) {
            var storageDetails = data[i]["Details"];
            for (var j = 0; j < storageDetails.length; j++) {
                var caseslist = storageDetails[j]["caseslist"];
                storageDetails[j]["caseSum"] = d3.sum(caseslist, function(d) {
                    return d["cases"]
                });
            }
            data[i]["Details"] = storageDetails.sort(function(d2, d1) {
                if (sortType == "desc") {
                    return d1["caseSum"] - d2["caseSum"];
                } else {
                    return d2["caseSum"] - d1["caseSum"];
                }
            });
        }
        return data;
    }

    function doLGAcodeToArray(data) {
        for (var i = 0; i < data.length; i++) {
            var storageDetails = data[i]["Details"];
            for (var j = 0; j < storageDetails.length; j++) {
                var strLGAcode = storageDetails[j]["LGAcode"];
                var arayLGAcode = strLGAcode.split("-");
                arayLGAcode = arayLGAcode.filter(function(d) {
                    if (d) {
                        return true;
                    } else {
                        return false;
                    }
                })
                storageDetails[j]["LGAcodeArr"] = arayLGAcode;
                storageDetails[j]["Storageid"] = data[i]["Storageid"];
            }
            data[i]["Details"] = storageDetails;
        }
        return data;
    }

    data = sortByCaseNum(data);
    data = doLGAcodeToArray(data);
    var startYpos = 0;

    var rowGArr = {};
    for (var i = 0; i < data.length; i++) {
        var storageDetails = data[i]["Details"];
        rowGArr["rowId" + data[i]["Storageid"]] = {};
        rowGArr["rowId" + data[i]["Storageid"]]["svg"] = svg.append("g").attr("id", "rowId" + data[i]["Storageid"])
            .style("cursor", "move")
            .attr("x", "0")
            .attr("class", "row")
            .attr("y", startYpos)
            .attr("transform", "translate(0," + startYpos + ")");
        startYpos = startYpos + Math.ceil(storageDetails.length / (cols - 1)) * (rectWH + padding);
        rowGArr["rowId" + data[i]["Storageid"]]["data"] = storageDetails;
        rowGArr["rowId" + data[i]["Storageid"]]["Storageid"] = data[i]["Storageid"]
    }

    for (var key in rowGArr) {
        rowGArr[key]["svg"].append("g")
            .append("text")
            .text(key.replace("rowId", ""))
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + (rectWH / 2) + "," + (rectWH / 2) + ")");
    }
    for (var key in rowGArr) {
        rowGArr[key]["svg"].append("g")
            .selectAll("g")
            .data(rowGArr[key]["data"])
            .enter().append("g")
            .attr("transform", (d, i) => "translate(" + (Math.floor((i ) % (cols-1))+1) * (rectWH + padding) + "," +
                (Math.floor((i ) / (cols-1))) * (rectWH + padding) + ")")
            .attr("x", function(d, i) {
                return (Math.floor((i ) % (cols-1))+1) * (rectWH + padding);
            })
            .attr("y", function(d, i) {
                return (Math.floor((i) / (cols-1))) * (rectWH + padding);
            })
            .append("rect")
            .attr("width", rectWH)
            .attr("height", rectWH)
            .style('stroke-dasharray', ('2,3'))
            .style('stroke', '#dedede')
            .style("fill", "white");

    }

    /**
     * 判断数组a是否包涵数组b
     * @param {Object} a 数组
     * @param {Object} b 数组
     */
    function isAIncludesB(a, b) {
        return b.every(val => a.includes(val));
    }
    var cancelStatusIds = [];
    var removeStatusIds = [];

    for (var key in rowGArr) {
        rowGArr[key]["svg"].append("g")
            .selectAll("g")
            .data(rowGArr[key]["data"])
            .enter().append("g")
            .attr("transform", (d, i) => "translate(" + (Math.floor((i ) % (cols-1))+1) * (rectWH + padding) + "," +
                (Math.floor((i ) / (cols-1))) * (rectWH + padding) + ")")
            .attr("x", function(d, i) {
                return (Math.floor((i ) % (cols-1))+1) * (rectWH + padding);
            })
            .attr("y", function(d, i) {
                return (Math.floor((i) / (cols-1))) * (rectWH + padding);
            })
            .attr("class", "OuterRect")
            .attr("id", function(d) {
                return "outer-" + d["Storageid"] + "-" + d["LGAcode"];
            })
            .append("rect")
            .attr("transform", (d, i) =>
                "translate(" + ((rectWH - rectWH * styleControler[d["status"]]["innertSize"]) / 2) + "," +
                ((rectWH - rectWH * styleControler[d["status"]]["innertSize"]) / 2) + ")")
            .attr("width", function(d) {
                return rectWH * styleControler[d["status"]]["innertSize"];
            })
            .attr("height", function(d) {
                return rectWH * styleControler[d["status"]]["innertSize"];
            })
            .style("stroke", function(d) {
                return styleControler[d["status"]]["color"];
            })
            .style("fill", function(d) {
                return styleControler[d["status"]]["color"];
            })
            .on("mouseover", function(od, i, n) {
                d3.select("#" + "outer-" + od["Storageid"] + "-" + od["LGAcode"])
                    .style("stroke-width", styleControler[od["status"]]["strokeWidth"])
                    .style("stroke", styleControler[od["status"]]["strokeColor"]);

                var templgaarr = od["LGAcode"].split("-");
                map.setFilter('polygon-highlighted', ['in', 'lgacode', ...templgaarr]);
                //console.log(od);

                divlegend.style("display","none");

                divlegend.html("LGA(s): "+ od["Name"] +"</br>")

                    .style("left", (d3.event.pageX+12) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .style("opacity", 0.8)
                    // .style("height", function(){
                    //     //console.log(tempevents);
                    //     return 23 * temprows + 'px';
                    // })
                    .style("display","block");

                for (var _key in rowGArr) {
                    if (rowGArr[_key]["Storageid"] != od["Storageid"]) {
                        rowGArr[_key]['data'].forEach((_d, i) => {
                            if (isAIncludesB(_d["LGAcodeArr"], od["LGAcodeArr"])) {
                                if (_d["status"] == od["status"]) {
                                    cancelStatusIds.push("#" + "outer-" + _d["Storageid"] + "-" +
                                        _d["LGAcode"]);

                                    d3.select("#" + "outer-" + _d["Storageid"] + "-" + _d["LGAcode"])
                                        .style("stroke-width", styleControler[_d["status"]][
                                            "strokeWidth"
                                            ])
                                        .style("stroke", styleControler[_d["status"]][
                                            "strokeColor"
                                            ]);
                                } else {
                                    removeStatusIds.push("#" + "inner-" + _d["Storageid"] + "-" + _d[
                                        "LGAcode"]);
                                    d3.select("#" + "outer-" + _d["Storageid"] + "-" + _d["LGAcode"])
                                        .append("rect")
                                        .attr("id", function() {
                                            return "inner-" + _d["Storageid"] + "-" + _d["LGAcode"];
                                        }())
                                        .attr("transform", "translate(" +
                                            ((rectWH - rectWH * styleControler[_d["status"]][
                                                "innertSize"
                                                ] / 2) / 2) +
                                            "," +
                                            ((rectWH - rectWH * styleControler[_d["status"]][
                                                "innertSize"
                                                ] / 2) / 2) +
                                            ")")
                                        .attr("width", function() {
                                            return rectWH * styleControler[_d["status"]][
                                                    "innertSize"
                                                    ] /
                                                2;
                                        }())
                                        .attr("height", function() {
                                            return rectWH * styleControler[_d["status"]][
                                                    "innertSize"
                                                    ] /
                                                2;
                                        }())
                                        .style("stroke", function() {
                                            return styleControler[_d["status"]]["color"];
                                        }())
                                        .style("fill", styleControler[od["status"]]["color"]);
                                }
                            }
                        })
                    }
                }
            })
            .on("mouseout", function(od, i, n) {
                divlegend.style("display","none");
                map.setFilter('polygon-highlighted', ['in', 'lgacode', '']);
                d3.select("#" + "outer-" + od["Storageid"] + "-" + od["LGAcode"])
                    .style("stroke-width", 0)
                cancelStatusIds.forEach((d, i) => {
                    d3.select(d)
                        .style("stroke-width", 0)
                })
                removeStatusIds.forEach((d, i) => {
                    d3.select(d).remove();
                })
                cancelStatusIds = [];
                removeStatusIds = [];
            })


    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };
    var lastDragPosY = 0;
    for (var key in rowGArr) {
        //var dragStartPosY = 0;
        rowGArr[key]["svg"].call(
            d3.behavior.drag().origin(function(d) {
                var t = d3.select(this);
                return {
                    x: t.attr("x"),
                    y: t.attr("y")
                };
            }).on("dragstart", function(d) {
                sel = d3.select(this);
                //dragStartPosY = d3.select(this).attr("y");
                sel.moveToFront();
            }).on("drag", function(d) {
                d3.select(this).attr("transform", "translate(0, " + d3.event.y +
                    ")");
                d3.select(this).attr("x", d3.event.x);
                d3.select(this).attr("y", d3.event.y);
                d3.select(this).attr("class", "activeRow")
                d3.selectAll(".row").attr("opacity", 0.8);
                var moveLength = Math.floor(rowGArr[d3.select(this).attr("id")]["data"].length / (cols-1)) + 1;
                console.log("moveLength",moveLength);
                d3.selectAll(".row").each(function(d) {

                    console.log( d3.select(this).attr("id"));
                    if (Math.abs(d3.select(this).attr("y") - d3.event.y) < rectWH / 2) {
                        //var _dragStartPosY = dragStartPosY;
                        //dragStartPosY = d3.select(this).attr("y");
                        var posY = d3.select(this).attr("y") * 1.0 + (rectWH + padding) * (d3.event
                            .y - d3.select(this).attr("y")) / Math.abs(d3.select(this).attr(
                            "y") - d3.event.y)*moveLength;
                        d3.select(this).attr("x", 0);
                        d3.select(this).attr("y", posY );
                        d3.select(this).attr("transform", "translate(0, " + posY +
                            ")");
                    }
                })
                lastDragPosY = d3.event.y;
            }).on("dragend", function(d) {
                //dragStartPosY = 0;
                d3.select(this).attr("class", "row")
                d3.selectAll(".row").attr("opacity", 8);
                d3.select(this).attr("x", 0);
                var posY = Math.ceil(lastDragPosY / ((rectWH + padding) /2)) *((rectWH + padding) /2)
                posY = Math.floor(posY / (rectWH + padding)) * (rectWH + padding)
                d3.select(this).attr("y", posY);
                d3.select(this).attr("transform", "translate(0, " + posY + ")");
            })
        );
    }
}
