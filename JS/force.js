//var mapcirclecolor = ["#3E9A34","#223971","#F4801F"]; //aldi color
var fstyleConfig = {
	selectedCircleColor: '#7c7c7c',
	statusList: {
		"unclustered": {
			color: "#223971",
			opacity: 0.8,
		},
		"clustered": {
			color: "#3E9A34",
			opacity: 0.8,
		},
		"grouped": {
			color: "#F4801F",
			opacity: 0.8,
		}
	},
	rectsColumns: 5,
	rectsRows: 3,
	padding: {
		top: 5,
		left: 5,
		right: 5,
		bottom: 0
	}

}

function drawRects() {

}



function startDrawRectFlower(apendSVGID) {
	var client = document.getElementById(apendSVGID);
	var width = client.clientWidth;
	var height = client.clientHeight;
	var svg;
	if (d3.select("#" + apendSVGID).select("svg").empty()) {
		svg = d3.select("#" + apendSVGID)
			.append("svg")
			.attr("width", width)
			.attr("height", height);
	} else {
		svg = d3.select("#" + apendSVGID).select("svg");
	}

	var perColWidth = (width * 1.0 - fstyleConfig["padding"]["left"] - fstyleConfig["padding"]["right"]) / fstyleConfig[
		"rectsColumns"];
	var svgOuterRects = svg.append("g").attr("transform", "translate(" + (fstyleConfig["padding"]["top"]) + "," + (
		fstyleConfig["padding"]["left"]) + ")");
	for (var i = 0; i < fstyleConfig["rectsRows"]; i++) {
		for (var j = 0; j < fstyleConfig["rectsColumns"]; j++) {
			var outerG = svgOuterRects.append("g")
				.attr("column", j)
				.attr("row", i)
				.attr("class", "outerRectG")
			if (j + 1 < fstyleConfig["rectsColumns"]) {
				outerG.attr("nex-row", i)
				outerG.attr("nex-column", j + 1)
			} else {
				outerG.attr("nex-row", i + 1)
				outerG.attr("nex-column", 0)
			}
			outerG.attr("empty", 1)
			outerG.classed("outerRectG_empty", true)
			outerG.attr('id', "id" + i + "_" + j)
			outerG.attr("transform", "translate(" + (j * perColWidth) + "," + (i * perColWidth) + ")");
		}
	}
	svg.selectAll(".outerRectG")
		.append("rect")
		.attr("width", perColWidth)
		.attr("height", perColWidth)
		.style("fill", "none")
		.style("stroke", "rgba(233,233,233,0.8)")
	return {
		svg: svg,
		perColWidth: perColWidth,
		svgOuterRects: svgOuterRects
	};

}
var container = startDrawRectFlower("treestructure");

function showFlower(data) {
	console.log(data);
	window.showMoth = false;
	data.id = new Date().getTime();
	if(!window.flowerData){
		window.flowerData = [];
	}
	window.flowerData.push(data);

	var caseBig = d3.max(data.caseslist, d => {
		return d.cases
	});

	window.flowerData.forEach((od,i)=>{
		var nowcaseBig = d3.max(od.caseslist, d => {
			return d.cases
		});
		if(caseBig < nowcaseBig){
			caseBig = nowcaseBig;
		}
	})

	//redraw all var svgpies = d3.selectAll('.svgpieG');
	var redrawsvgpieGs = d3.selectAll('.svgpieG');
	if(!redrawsvgpieGs.empty()){
		redrawsvgpieGs[0].forEach(function(d, i) {
			var odata = JSON.parse(d3.select(d).attr("data"));
			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d) {
					return d.cases;
				});

			var arc = d3.svg.arc()
				.startAngle(function(d) {
					return d.data.start * 2 * Math.PI / 360;
				})
				.endAngle(function(d) {
					return d.data.end * 2 * Math.PI / 360;
				})
				.innerRadius(container.perColWidth / 5)
				.outerRadius(function(d) {
					if (d.value === 0) {
						return container.perColWidth / 5;
					} else {
						return container.perColWidth / 5 + (Math.log2(d.value) / Math.log2(caseBig)) *
							(container
								.perColWidth * 3 / 10 - 5) + 1;
					}
				})
			d3.select(d).selectAll('path').remove();
			d3.select(d).selectAll('path')
				.data(pie(odata.caseslist))
				.enter()
				.append("path")
				.attr("data",d=>JSON.stringify(d))
				.attr("d", d => {
					return arc(d);
				})
				.attr("class",d=>"month"+d.data.Month)
				.classed("mothpath",true)
				.attr('id', function(d, o) {
					return 'piebar-' + o;
				})
				.style("fill", function(d) {
					if (d.data.cases === 0)
						return ColorGrey[0];
					else
						return Flowercolorpannel[0];
				})
				.style("fill-opacity", 0.8)
				.attr('opacity',function(d){
					if(window.showMoth){
						if( d.data.Month == window.showMoth){
							return 1;
						}else{
							return 0.3;
						}
					}
					return 1;
				})
				.on("mousemove",function(d){
					window.showMoth = d.data.Month;
					d3.selectAll('.mothpath').attr('opacity',0.3)
					d3.selectAll('.month'+d.data.Month).attr('opacity',1)
				})
				.on("mouseout", function(d){
					window.showMoth = false;
					d3.selectAll('.mothpath').attr('opacity',1)

					d3.selectAll('.MonthText')
						.text([])
				})
				.style("stroke-width", 0.5)
				.style("stroke", "white")
		});
	}

	d3.selection.prototype.moveToFront = function() {
		return this.each(function() {
			this.parentNode.appendChild(this);
		});
	};

	var goToAddFlowerG = container["svg"].select(".outerRectG_empty");
	if (goToAddFlowerG.empty()) {
		return;
	}
	var transformStr = goToAddFlowerG.attr("transform");
	var translateArr = transformStr.substring(transformStr.indexOf("(") + 1, transformStr.indexOf(")")).split(",");
	var svgpieG = container["svg"].append("g")
		.attr("class", "svgpieG")
		.classed(goToAddFlowerG.attr("id"), true)
		.attr("data", JSON.stringify(data))
		.attr("ourterGID", goToAddFlowerG.attr("id"))
		.attr("transform", "translate(" + (
			translateArr[0] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["left"]
		) + "," + (
			translateArr[1] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["top"]
		) + ")");


	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.cases;
		});

	var arc = d3.svg.arc()
		.startAngle(function(d) {
			return d.data.start * 2 * Math.PI / 360;
		})
		.endAngle(function(d) {
			return d.data.end * 2 * Math.PI / 360;
		})
		.innerRadius(container.perColWidth / 5)
		.outerRadius(function(d) {
			if (d.value === 0) {
				return container.perColWidth / 5;
			} else {
				return container.perColWidth / 5 + (Math.log2(d.value) / Math.log2(caseBig)) *
					(container
						.perColWidth * 3 / 10 - 5) + 1;
			}
		})

	svgpieG.selectAll("path")
		.data(pie(data.caseslist))
		.enter()
		.append("path")
		.attr("data",d=>JSON.stringify(d))
		.attr("class",d=>"month"+d.data.Month)
		.classed("mothpath",true)
		.attr("d", d => {
			return arc(d);
		})
		.attr('id', function(d, o) {
			return 'piebar-' + o;
		})
		.style("fill", function(d) {
			if (d.data.cases === 0)
				return ColorGrey[0];
			else
				return Flowercolorpannel[0];
		})
		.style("fill-opacity", 0.8)
		.style("stroke-width", 0.6)
		.style("stroke", "white")
		.attr('opacity',function(d){
			if(window.showMoth){
				if( d.data.Month == window.showMoth){
					return 1;
				}else{
					return 0.1;
				}
			}
			return 1;
		})
		.on("mousemove",function(d){
			window.showMoth = d.data.Month;
			d3.selectAll('.mothpath').attr('opacity',0.3)
			d3.selectAll('.month'+d.data.Month).attr('opacity',1)
		})
		.on("mouseout", function(d){
			window.showMoth = false;
			d3.selectAll('.mothpath').attr('opacity',1)

			d3.selectAll('.MonthText')
				.text([])
		})
	var circle = svgpieG.append("circle")
		.attr("r", container.perColWidth / 5 - 0.5)
		.attr('id', function (){
			var tempLGAcodestring = "";
			for (var i = 0; i < data.LGAcodeArr.length; i++){
				tempLGAcodestring += data.LGAcodeArr[i] + "-"
			}
			return tempLGAcodestring;
		})
		.style("fill", fstyleConfig.statusList[data.status].color)
		.style("fill-opacity", fstyleConfig.statusList[data.status].opacity)
		.on('mousemove', function () {
			//console.log(d3.select(this).attr('id'));
			console.log(data);
			var templgaarr = d3.select(this).attr('id').split("-");
			map.setFilter('polygon-highlighted', ['in', 'lgacode', ...templgaarr]);

			var tempcurrentname = data.Storageid + "-" + data.LGAcode;

			d3.select('#matrixsvg').selectAll('rect').style("opacity", 0.3)
			d3.select('#matrixsvg').select("#outer-" + tempcurrentname).select("rect").style("opacity", 1);

			console.log(window.storageinfo);


		})
		.on("mouseout", function(od, i, n) {
			map.setFilter('polygon-highlighted', ['in', 'lgacode', '']);
			d3.select('#matrixsvg').selectAll('rect').style("opacity", 1)

			d3.selectAll('.MonthText')
				.text([])
			d3.selectAll('.CaseText')
				.attr("dy", ".35em")
				.style("font-size", "11px")

		})
	var CaseText = svgpieG.append("svg:text")
		.attr("class", "CaseText")
		.attr("text-anchor", "middle")
		.attr("dx", 0)
		.attr("dy", ".35em")
		.attr('id', function(d, i) {
			var tempeachmonth = new Array(25).fill(0);
			for (var i = 0; i < data.caseslist.length; i++){
				tempeachmonth[data.caseslist[i].Month - 1] = data.caseslist[i].cases
			}
			// var tempeachmonthstr = "";
			// for (var j = 0; j < tempeachmonth.length; j++){
			// 	tempeachmonthstr += tempeachmonth[j] + "@";
			// }
			// tempeachmonthstr = tempeachmonthstr.substring(0, tempeachmonthstr.length - 1);
			//
			// var tempsplice = tempeachmonthstr.split("@");
			// console.log(tempsplice);
			return 'text-' + data.Storageid + "-" + data.LGAcode + "case";
		})
		.text(function(d) {
			//console.log(data);
			return data.caseSum ;
		})
		// .style("fill", 'black')
		.style("stroke", "white")
		.style("stroke-width", 1)
		.style("font-size", "11px")
	var MonthText = svgpieG.append("svg:text")
		.attr("class", "MonthText")
		.attr("text-anchor", "middle")
		.attr("dx", 0)
		.attr("dy", "-0.25em")
		.attr('id', function(d, i) {
			return 'text-' + data.Storageid + "-" + data.LGAcode + "month";
		})
		.text([])
		// .style("fill", 'black')
		.style("stroke", "white")
		.style("stroke-width", 1)
		.style("font-size", "8.5px")


	svgpieG.on("mousemove", function(d) {
		//console.log(d);
		var baseData = JSON.parse(d3.select(this).attr("data"));
		var basecaseBig = d3.max(baseData.caseslist, d => {
			return d.cases
		});
		//console.log("baseData", baseData);
		var svgpies = d3.selectAll('.svgpieG');
		svgpies[0].forEach(function(d, i) {
			var odata = JSON.parse(d3.select(d).attr("data"));
			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d) {
					return d.cases;
				});

			var arc = d3.svg.arc()
				.startAngle(function(d) {
					return d.data.start * 2 * Math.PI / 360;
				})
				.endAngle(function(d) {
					return d.data.end * 2 * Math.PI / 360;
				})
				.innerRadius(container.perColWidth / 5)
				.outerRadius(function(d) {
					if (d.value === 0) {
						return container.perColWidth / 5;
					}
					else {
						return container.perColWidth / 5 + (Math.log2(d.value) / Math.log2(caseBig)) *
							(container
								.perColWidth * 3 / 10 - 5) + 1;
					}
				})
			d3.select(d).selectAll('path').remove();
			var _d = d;
			d3.select(d).selectAll('path')
				.data(pie(odata.caseslist))
				.enter()
				.append("path")
				.attr("class",d=>"month"+d.data.Month)
				.classed("mothpath",true)
				.attr("data",d=>JSON.stringify(d))
				.attr("d", d => {
					var month = d.data.Month;
					var baseCaseList = baseData.caseslist;
					var base_monthData = null;
					baseCaseList.forEach((d, i) => {
						if (d.Month == month) {
							base_monthData = d;
						}
					})
					//console.log("compare",d,base_monthData)
					if (base_monthData) {
						if (base_monthData.cases == d.data.cases || base_monthData.cases == 0) {
							//console.log("eqaual or base_month zero compare",d,base_monthData)
							return arc(d);
						} else {
							var pre_sourcePath = arc(d);
							var pre_firstPosition = pre_sourcePath.substr(1, pre_sourcePath.indexOf('A') - 1);
							var pre_firstPositionXY = pre_firstPosition.split(',');
							var pre_len = Math.sqrt(Math.pow(pre_firstPositionXY[0], 2) + Math.pow(
								pre_firstPositionXY[1], 2));


							var s_cases = d.data.cases;
							var copy_d = JSON.parse(JSON.stringify(d));
							copy_d.data.cases = base_monthData.cases
							copy_d.value = base_monthData.cases

							var sourcePath = arc(copy_d);
							var firstPosition = sourcePath.substr(1, sourcePath.indexOf('A') - 1);
							var firstPositionXY = firstPosition.split(',');

							var willChangePath = sourcePath.substr(sourcePath.indexOf('A'),
								sourcePath.indexOf('L') - sourcePath
									.indexOf('A'))

							var lIndex = sourcePath.indexOf('L');
							var pos2 = lIndex;
							while (sourcePath.charAt(--pos2) != ' ') {}
							var secondPosition = sourcePath.substr(pos2 + 1, sourcePath.indexOf(
								'L') - pos2 - 1);
							var secondPositionXY = secondPosition.split(',');
							//console.log("secondPositionXY", secondPositionXY);

							var thirdPosition = sourcePath.substr(sourcePath.indexOf('L') + 1,
								sourcePath.indexOf('A', sourcePath
									.indexOf('L') + 1) - sourcePath.indexOf('L') - 1);
							var thirdPositionXY = thirdPosition.split(',');

							var zIndex = sourcePath.indexOf('Z');
							var pos3 = zIndex;
							while (sourcePath.charAt(--pos3) != ' ') {}
							var forthPosition = sourcePath.substr(pos3 + 1, sourcePath.indexOf(
								'Z') - pos3 - 1);
							var forthPositionXY = forthPosition.split(',');
							//第一个点 与第二个点的中心
							var topPositionXY = [(firstPositionXY[0] * 1.0 + secondPositionXY[0] *
								1.0) / 2, (firstPositionXY[1] * 1.0 + secondPositionXY[1] *
								1.0) / 2];

							function getTopPosition(topPositionXY) {
								var sLen = Math.sqrt(Math.pow(topPositionXY[0], 2) + Math.pow(
									topPositionXY[1], 2));
								return [topPositionXY[0] * pre_len / sLen, topPositionXY[1] * pre_len /
								sLen
								];
							}
							topPositionXY = getTopPosition(topPositionXY);
							var newPathSep = `L${topPositionXY[0]},${topPositionXY[1]}L${secondPositionXY[0]},${secondPositionXY[1]}`; //如果要改凹陷的曲线改这里
							//var newPathSep =`Q${topPositionXY[0]},${topPositionXY[1]} ${secondPositionXY[0]},${secondPositionXY[1]}`; //如果要改凹陷的曲线改这里
							finalPath = sourcePath.replace(willChangePath, newPathSep); //一朵花瓣的所有path绘制
							//console.log(finalPath);
							d3.select(_d).append("g").append("path")
								.attr("d", `M${firstPositionXY[0]},${firstPositionXY[1]}${willChangePath}`)
								.style('stroke', "grey")
								.style("fill", "none")
								.attr("stroke-dasharray", "1,1") //花虚线的
							return finalPath;
						}
					} else {
						console.log("base_month not found",d)
						return arc(d);
					}
				})

				.attr('id', function(d, o) {
					return 'piebar-' + o;
				})
				.style("fill", function(d) {
					return Flowercolorpannel[0];
				})
				.style("fill-opacity", 0.8)
				.style("stroke-width", 0.5)
				.style("stroke", "white")
				.attr('opacity',function(d){
					if(window.showMoth){
						if( d.data.Month == window.showMoth){
							return 1;
						}else{
							return 0.3;
						}
					}
					return 1;
				})
				.on("mouseover",function(d,o){
					var tempmousecount = parseInt(d.data.Month / 12) * 2 + d.data.Month % 12
					window.showMoth = d.data.Month;
					d3.selectAll('.mothpath').attr('opacity',0.3);
					d3.selectAll('.month'+d.data.Month).attr('opacity',1);
					console.log(window.storageinfo);
					console.log(d, o)
					FillmonthforEach(d, FillmonthforEachcallback);

					console.log(d3.selectAll('.CaseText'));
					d3.selectAll('.MonthText')
						.text(function() {
							let tempmonth = d.data.Month % 12
							if (tempmonth == 0){
								tempmonth = 12;
							}
							let tempYear = parseInt(d.data.Month / 12) + 2020
							//console.log(d);
							return tempYear + "-" + tempmonth ;
						})

				})
				.on("mouseout", function(d){
					console.log('mouseout')
					window.showMoth = false;
					d3.selectAll('.mothpath').attr('opacity',1);
					for (var i = 0; i < window.storageinfo.length; i++){
						//console.log(d3.select("#text-" + window.storageinfo[i].Storageid +"-" + window.storageinfo[i].LGAcode + "case"));
						d3.select("#text-" + window.storageinfo[i].Storageid +"-" + window.storageinfo[i].LGAcode + "case")
							.attr("dy", ".35em")
							.text(function() {
								//console.log(d);
								return window.storageinfo[i].caseSum;
							})
							.style("font-size", "11px");

					}
					d3.selectAll('.MonthText')
						.text([])
				})
		});
	}).on("mouseout", function(d) {
		window.showMoth = false;
		d3.selectAll('.MonthText')
			.text([])
		CaseText
			.attr("dy", ".35em")
			.text(function(d) {
				//console.log(data);
				return data.caseSum ;
			})
			.style("font-size", "11px")

		// console.log(d3.select(this))
		var svgpies = d3.selectAll('.svgpieG');
		svgpies[0].forEach(function(d, i) {
			var odata = JSON.parse(d3.select(d).attr("data"));
			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d) {
					return d.cases;
				});

			var arc = d3.svg.arc()
				.startAngle(function(d) {
					return d.data.start * 2 * Math.PI / 360;
				})
				.endAngle(function(d) {
					return d.data.end * 2 * Math.PI / 360;
				})
				.innerRadius(container.perColWidth / 5)
				.outerRadius(function(d) {
					if (d.value === 0) {
						return container.perColWidth / 5;
					} else {
						return container.perColWidth / 5 + (Math.log2(d.value) / Math.log2(caseBig)) *
							(container
								.perColWidth * 3 / 10 - 5) + 1;
					}
				})
			d3.select(d).selectAll('path').remove();
			d3.select(d).selectAll('path')
				.data(pie(odata.caseslist))
				.enter()
				.append("path")
				.attr("data",d=>JSON.stringify(d))
				.attr("class",d=>"month"+d.data.Month)
				.classed("mothpath",true)
				.attr("d", d => {
					return arc(d);
				})
				.attr('id', function(d, o) {
					return 'piebar-' + o;
				})
				.style("fill", function(d) {
					if (d.data.cases === 0)
						return ColorGrey[0];
					else
						return Flowercolorpannel[0];
				})
				.style("fill-opacity", 0.8)
				.style("stroke-width", 0.5)
				.style("stroke", "white")
				.attr('opacity',function(d){
					if(window.showMoth){
						if( d.data.Month == window.showMoth){
							return 1;
						}else{
							return 0.3;
						}
					}
					return 1;
				})
				.on("mousemove",function(d){
					window.showMoth = d.data.Month;
					d3.selectAll('.mothpath').attr('opacity',0.3)
					d3.selectAll('.month'+d.data.Month).attr('opacity',1)
				})
				.on("mouseout", function(d){
					window.showMoth = false;
					d3.selectAll('.mothpath').attr('opacity',1)

					d3.selectAll('.MonthText')
						.text([])
				})
		});
	})

	svgpieG.call(
		d3.behavior.drag().origin(function(d) {
			var t = d3.select(this);
			var transformStr = t.attr("transform");
			var translateArr = transformStr.substring(transformStr.indexOf("(") + 1, transformStr.indexOf(")"))
				.split(",");
			return {
				x: translateArr[0],
				y: translateArr[1]
			};
		}).on("dragstart", function(d) {
			var t = d3.select(this);
			t.moveToFront();
		}).on("drag", function(d) {
			d3.select(this).attr("transform", "translate(" + d3.event.x + ", " + d3.event.y + ")");
		}).on("dragend", function(d) {
			var t = d3.select(this);
			var transformStr = t.attr("transform");
			var translateArr = transformStr.substring(transformStr.indexOf("(") + 1, transformStr.indexOf(")"))
				.split(",");

			container["svg"].select("#" + t.attr("ourterGID")).classed('outerRectG_empty', true);
			var outerRectGS = container["svg"].selectAll('.outerRectG');
			var minIndex = -1;
			var minDistance = 1200;
			outerRectGS[0].forEach((d, i) => {
				var tf = d3.select(d).attr("transform");
				var tfArr = tf.substring(tf.indexOf("(") + 1, tf.indexOf(")")).split(",");
				tfArr[0] = tfArr[0] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["left"]
				tfArr[1] = tfArr[1] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["top"]
				var currentDistance = Math.sqrt(Math.pow(tfArr[0] - translateArr[0], 2) + Math.pow(
					tfArr[1] - translateArr[1], 2));
				if (currentDistance < minDistance) {
					minDistance = currentDistance;
					minIndex = i;
				}
			});

			if (minDistance > container.perColWidth * 1.0 / 2 + 5) {
				t.remove();
				var gmoveData = JSON.parse(t.attr("data"));
				var newflowerData = [];
				window.flowerData.forEach(odi=>{
					if(odi.id != gmoveData.id){
						newflowerData.push(odi)
					}
				})
				window.flowerData = newflowerData;
				return;
			}
			if (minIndex != -1) {
				var tf2 = d3.select(outerRectGS[0][minIndex]).attr("transform");
				d3.select(outerRectGS[0][minIndex]).classed("outerRectG_empty", false);
				var tf2Arr = tf2.substring(tf2.indexOf("(") + 1, tf2.indexOf(")")).split(",");
				tf2Arr[0] = tf2Arr[0] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["left"];
				tf2Arr[1] = tf2Arr[1] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["top"];
				d3.select(this).attr("transform", "translate(" + tf2Arr[0] + ", " + tf2Arr[1] + ")");
				d3.select(this).classed(d3.select(this).attr("ourterGID"), false)
				if (!d3.select("." + d3.select(outerRectGS[0][minIndex]).attr("id")).empty()) {
					console.log(d3.select("." + d3.select(outerRectGS[0][minIndex]).attr("id")))
					var tf3 = d3.select("#" + d3.select(this).attr("ourterGID")).attr("transform");
					d3.select("#" + d3.select(this).attr("ourterGID")).classed("outerRectG_empty", false);
					var tf3Arr = tf3.substring(tf3.indexOf("(") + 1, tf3.indexOf(")")).split(",");
					tf3Arr[0] = tf3Arr[0] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["left"];
					tf3Arr[1] = tf3Arr[1] * 1.0 + container.perColWidth * 1.0 / 2 + fstyleConfig["padding"]["top"];
					d3.select("." + d3.select(outerRectGS[0][minIndex]).attr("id"))
						.attr("transform", "translate(" + tf3Arr[0] + ", " + tf3Arr[1] + ")");

					var ge = d3.select("." + d3.select(outerRectGS[0][minIndex]).attr("id"));
					ge.classed(d3.select("." + d3.select(outerRectGS[0][minIndex]).attr("id")).attr(
						"ourterGID"), false)
					ge.attr("ourterGID", d3.select("#" + d3.select(this).attr("ourterGID")).attr("id"))
					ge.classed(d3.select("#" + d3.select(this).attr("ourterGID")).attr("id"), true)
				}
				d3.select(this).classed(d3.select(this).attr("ourterGID"), false)
				d3.select(this).attr("ourterGID", d3.select(outerRectGS[0][minIndex]).attr("id"))
				d3.select(this).classed(d3.select(outerRectGS[0][minIndex]).attr("id"), true)
			}
		})
	);
	goToAddFlowerG.classed("outerRectG_empty", false);
}

function FillmonthforEach(d, callback){
	for (var i = 0; i < window.storageinfo.length; i++){
		//console.log(d3.select("#text-" + window.storageinfo[i].Storageid +"-" + window.storageinfo[i].LGAcode + "case"));
		d3.select("#text-" + window.storageinfo[i].Storageid +"-" + window.storageinfo[i].LGAcode + "case")
			.attr("dy", ".8em")
			.text(function() {
				var temp = callback(d, i);
				return temp;
			})
			.style("font-size", "11px");

	}

}

function FillmonthforEachcallback(d, i){
	if(window.storageinfo[i].caseslist.length == 25)
		return window.storageinfo[i].caseslist[d.data.Month - 1].cases;
	else {
		var tempfullmonth = new Array(25).fill("Null");
		for (var j = 0; j < window.storageinfo[i].caseslist.length; j++){
			tempfullmonth[window.storageinfo[i].caseslist[j].Month - 1] = window.storageinfo[i].caseslist[j].cases;
		}
		console.log(d.data.Month);
		console.log(tempfullmonth[d.data.Month - 1]);
		console.log(tempfullmonth);
		return tempfullmonth[d.data.Month - 1];
	}
}

