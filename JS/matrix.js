//var mapcirclecolor = ["#3E9A34","#223971","#F4801F"]; //aldi color

window.styleControler = {
	"unclustered": {
		color: "#223971",
		opacity: 0.8,
		strokeWidth: 5,
		strokeColor: "rgb(255,255,255)",
		innertSize: 0.7 //内部方块的大小  80%
	},
	"clustered": {
		color: "#3E9A34",
		opacity: 0.8,
		strokeWidth: 5,
		strokeColor: "rgb(255,255,255)",
		innertSize: 0.7 //内部方块的大小  80%
	},
	"grouped": {
		color: "#F4801F",
		opacity: 0.8,
		strokeWidth: 5,
		strokeColor: "rgb(255,255,255)",
		innertSize: 0.7 //内部方块的大小  80%
	}
};
const appendIdStr = "appendSVG";
const cols = 18;
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

	var svgHeight = document.getElementById(eleID).clientHeight;
	var svgWidth = document.getElementById(eleID).clientWidth - 10;
	var rectWH = parseInt((svgWidth - (cols - 1) * padding) / cols);
	if (matrixsvg) {
		matrixsvg.remove();
	}
	matrixsvg = d3.select("#" + eleID)
		.append("svg")
		.attr("id", "matrixsvg")
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

	function drawTimeLine(key, apendGS, styleConfig) {
		key
		if (!window.storageTime) {
			window.storageTime = {};
		}
		if (!window.storageTime[key]) {
			window.storageTime[key] = {
				timeSelection: window.timeSelection,
				maxTimeSelection: window.maxTimeSelection
			};
		}
		console.log(storageTime);
		var rdistance = new Date(window.storageTime[key].timeSelection[1]).getTime() - new Date(window.storageTime[key]
			.timeSelection[0]).getTime();
		var tdistance = new Date(window.storageTime[key].maxTimeSelection[1]).getTime() - new Date(window.storageTime[
			key].maxTimeSelection[0]).getTime();

		var dataset = [new Date(window.storageTime[key].timeSelection[0]).getTime() - new Date(window.storageTime[key]
			.maxTimeSelection[0]).getTime(),
			rdistance,
			new Date(window.storageTime[key].maxTimeSelection[1]).getTime() - new Date(window.storageTime[key]
				.timeSelection[1]).getTime()
		];

		if (dataset[0] == 0 && dataset[2] == 0) {
			dataset = [dataset[1]];
		}
		var pie = d3.layout.pie().sort(null).value(function(d) {
			return d;
		})
		var piedata = pie(dataset);
		var arc = d3.svg.arc()
			.innerRadius(styleConfig["outcircle"]["innerRadius"])
			.outerRadius(styleConfig["outcircle"]["outerRadius"]);

		var arcs = apendGS
			.selectAll("g")
			.data(piedata)
			.enter()
			.append("g")
			.attr("transform",
				"translate(0,0)");
		arcs.append("path").attr("fill", function(d, i) {
			console.log("i", i);
			if (i == 1 || dataset.length == 1) {
				return styleConfig["outcircleColor"];
			} else {
				return "white";
			}
		}).attr("d", function(d) {
			return arc(d);
		}).attr("stroke", function(d, i) {
			if (i == 1 || dataset.length == 1) {
				return styleConfig["outcircleColor"];
			} else {
				return "white";
			}
		});
	}

	function doLGAcodeToArray(data) {
		console.log(data);
		for (var i = 0; i < data.length; i++) {
			var storageDetails = data[i]["Details"];
			for (var j = 0; j < storageDetails.length; j++) {
				var strLGAcode = storageDetails[j]["LGAcode"];
				console.log(strLGAcode);
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

	console.log("matrix", data);

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
			.attr("transform", "translate(0," + (startYpos) + ")");
		startYpos = startYpos + Math.ceil(storageDetails.length / (cols - 1)) * (rectWH + padding);
		rowGArr["rowId" + data[i]["Storageid"]]["data"] = storageDetails;
		rowGArr["rowId" + data[i]["Storageid"]]["Storageid"] = data[i]["Storageid"]
	}

	for (var key in rowGArr) {
		//修改成 圆圈
		var styleConfig = {
			selectedCircleColor: '#7c7c7c',
			selectedCircleSize: rectWH / 3,
			outerCircleSize: rectWH / 2,
			outcircleColor: "rgba(86,71,121,0.8)", //外圈颜色
			outcircle: {
				innerRadius: rectWH / 3.5,
				outerRadius: rectWH / 2 - 1,
			}
		}
		rowGArr[key]["svg"].append("g")
			.attr("transform", "translate(" + (rectWH / 2) + "," + (rectWH / 2) + ")")
			.append("circle")
			.style("fill", "white")
			.style("stroke", "white")
			.attr("r", rectWH / 2 - 2);
		drawTimeLine(
			key,
			rowGArr[key]["svg"].append("g").attr("transform", "translate(" + (rectWH / 2) + "," + (rectWH / 2) +
				")"),
			styleConfig);
		rowGArr[key]["svg"].append("g")
			.append("text")
			.text(key.replace("rowId", ""))
			.attr("class", "StorageidText")
			.attr("dy", styleConfig["selectedCircleSize"] / 2)
			.style("text-anchor", "middle")
			.style("user-selec", "none")
			.style("font-size", styleConfig["selectedCircleSize"])
			.style("stroke", "black")
			.attr("transform", "translate(" + (rectWH / 2) + "," + (rectWH / 2) + ")");
	}
	for (var key in rowGArr) {
		rowGArr[key]["svg"].append("g")
			.selectAll("g")
			.data(rowGArr[key]["data"])
			.enter().append("g")
			.attr("transform", (d, i) => "translate(" + (Math.floor((i) % (cols - 1)) + 1) * (rectWH + padding) + "," +
				(Math.floor((i) / (cols - 1))) * (rectWH + padding) + ")")
			.attr("x", function(d, i) {
				return (Math.floor((i) % (cols - 1)) + 1) * (rectWH + padding);
			})
			.attr("y", function(d, i) {
				return (Math.floor((i) / (cols - 1))) * (rectWH + padding);
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
			.attr("transform", (d, i) => "translate(" + (Math.floor((i) % (cols - 1)) + 1) * (rectWH + padding) + "," +
				(Math.floor((i) / (cols - 1))) * (rectWH + padding) + ")")
			.attr("x", function(d, i) {
				return (Math.floor((i) % (cols - 1)) + 1) * (rectWH + padding);
			})
			.attr("y", function(d, i) {
				return (Math.floor((i) / (cols - 1))) * (rectWH + padding);
			})
			.attr("class", "OuterRect")
			.attr("id", function(d) {
				return "outer-" + d["Storageid"] + "-" + d["LGAcode"];
			})
			.on("mousedown", function(od, i, n) {
				console.log(od);
				window.storagearr.push(od.Storageid + "-" + od.LGAcode);
				window.storageinfo.push({
					"clickcount": window.clickcount,
					"LGAcode": od.LGAcode,
					"LGAcodeArr": od.LGAcodeArr,
					"Name": od.Name,
					"Storageid": od.Storageid,
					"caseSum": od.caseSum,
					"caseslist": od.caseslist,
					"count": od.count,
					"status": od.status

				});
				d3.select(this).attr("stroke-opacity", 1)
				d3.select(this)
					.append('circle')
					.attr("transform","translate(" + rectWH/2 + ", " + rectWH/2 + ")")
					.attr("r", 5)
					.style("fill", "#fff")
				window.clickcount ++;
				showFlower(od);

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
			.style("stroke-opacity", function(d) {
				return styleControler[d["status"]]["opacity"];
			})
			.style("fill", function(d) {
				return styleControler[d["status"]]["color"];
			})
			.style("fill-opacity", function(d) {
				return styleControler[d["status"]]["opacity"];
			})
			.on("mouseover", function(od, i, n) {
				d3.select('#matrixsvg').selectAll('rect').style("opacity", 0.3)
				//console.log(od);
				d3.select("#" + "outer-" + od["Storageid"] + "-" + od["LGAcode"])
					.style("stroke-width", styleControler[od["status"]]["strokeWidth"])
					.style("stroke", styleControler[od["status"]]["strokeColor"])
					.style("stroke-opacity", styleControler[od["status"]]["opacity"]);


				d3.select(this).style("stroke-opacity", 1)
				d3.select(this).style("fill-opacity", 1)
				//console.log(rowGArr);
				for (var _key in rowGArr) {
					d3.select("#" + "outer-" + rowGArr[_key]["Storageid"] + "-" + od["LGAcode"]).select("rect")
						.style("opacity", 1);
					//console.log("#" + "outer-" + rowGArr[_key]["Storageid"] + "-" + od["LGAcode"])
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
											])
										.style("opacity", 1)
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
										.style("stroke-width", 2)
										.style("stroke", "white")
										.style("fill", styleControler[od["status"]]["color"])
										.style("opacity", 1);

								}
							}
						})
					}
				}

				var templgaarr = od["LGAcode"].split("-");
				map.setFilter('polygon-highlighted', ['in', 'lgacode', ...templgaarr]);
				// console.log(d3.select(this));

				divlegend.style("display","none");

				divlegend.html("LGA(s): "+ od["Name"] +"</br>")

					.style("left", (d3.event.pageX+12) + "px")
					//d3.event.pageX 鼠标坐标x
					//get divlegendwidth
					//外部容器是

					.style("top", (d3.event.pageY-10) + "px")
					.style("opacity", 0.8)
					// .style("height", function(){
					//     //console.log(tempevents);
					//     return 23 * temprows + 'px';
					// })
					.style("display","block");
				//divlegend.style("display","none");
			})
			.on("mouseout", function(od, i, n) {
				d3.select('#matrixsvg').selectAll('rect').style("opacity", 1)
				divlegend.style("display","none");
				map.setFilter('polygon-highlighted', ['in', 'lgacode', '']);

				d3.select("#" + "outer-" + od["Storageid"] + "-" + od["LGAcode"])
					.style("stroke-width", 1)

				d3.select(this).style("fill-opacity", 0.8)
				d3.select(this).style("stroke-opacity", 0.8)
				cancelStatusIds.forEach((d, i) => {
					d3.select(d)
						.style("stroke-width", 1)
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
	var haveDrag = false;
	for (var key in rowGArr) {
		rowGArr[key]["svg"].call(
			d3.behavior.drag().origin(function(d) {
				var t = d3.select(this);
				return {
					x: t.attr("x"),
					y: t.attr("y")
				};
			}).on("dragstart", function(d) {
				sel = d3.select(this);
				sel.moveToFront();
			}).on("drag", function(d) {
				d3.select(this).attr("transform", "translate(0, " + d3.event.y + ")");
				d3.select(this).attr("x", d3.event.x);
				d3.select(this).attr("y", d3.event.y);
				d3.select(this).attr("class", "activeRow")
				d3.selectAll(".row").attr("opacity", 0.8);
				var moveLength = Math.floor(rowGArr[d3.select(this).attr("id")]["data"].length / (cols - 1)) +
					1;
				d3.selectAll(".row").each(function(d) {
					if (Math.abs(d3.select(this).attr("y") - d3.event.y) < rectWH / 2) {
						var posY = d3.select(this).attr("y") * 1.0 + (rectWH + padding) * (d3.event
							.y - d3.select(this).attr("y")) / Math.abs(d3.select(this).attr(
							"y") - d3.event.y) * moveLength;
						d3.select(this).attr("x", 0);
						d3.select(this).attr("y", posY);
						d3.select(this).attr("transform", "translate(0, " + posY +
							")");
					}
				})
				lastDragPosY = d3.event.y;
				haveDrag = true;
			}).on("dragend", function(d) {
				if (haveDrag) {
					d3.select(this).attr("class", "row")
					d3.selectAll(".row").attr("opacity", 8);
					d3.select(this).attr("x", 0);
					var posY = Math.ceil(lastDragPosY / ((rectWH + padding) / 2)) * ((rectWH + padding) / 2)
					posY = Math.floor(posY / (rectWH + padding)) * (rectWH + padding)
					d3.select(this).attr("y", posY);
					d3.select(this).attr("transform", "translate(0, " + posY + ")");
					haveDrag = false;
				}
			})
		);
	}

	console.log(window.storagearr);
	for (var i = 0; i < window.storagearr.length; i ++){
		d3.select("#" + "outer-" + window.storagearr[i])
			.append('circle')
			.attr("transform","translate(" + rectWH/2 + ", " + rectWH/2 + ")")
			.attr("r", 5)
			.style("fill", "#fff")
	}


}
