/**
 * Created by yevheniia on 20.11.20.
 */
d3.csv("data/compare_with_parliament.csv").then(function(data){

    data.forEach(function(d){
        d.max_value = +d.max_value;
        d.votes_local = +d.votes_local;
        d.votes_parlam = +d.votes_parlam;
        d.difference = +d.difference;

    });


    const margin = {top: 40, right: 100, bottom: 30, left: 150},
        width = d3.select("#compare").node().getBoundingClientRect().width - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    const svg = d3.select("#compare")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(150,30)");

    var xScale = d3.scaleLinear();
    
    var yScale = d3.scaleBand()
        .range([0, height]);

//Add group for the x axis
    svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 0 + "," + height + ")");

//Add group for the y axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(0,0)");

    drawPops("Слуга народу");

    d3.selectAll(".draw-lollipop").on("click", function(d){
        d3.selectAll(".draw-lollipop").classed("active", false);
        d3.select(this).classed("active", true);
        let selected = d3.select(this).attr("value");
        d3.select("h2#compare-title").select("span").text(selected);
        drawPops(selected)

    });

    function drawPops(selected_pary){

        var filtered = data.filter(function(d){ return d.party_name === selected_pary });

        var new_width =  d3.select("#compare").node().getBoundingClientRect().width - margin.left - margin.right;


       //Update the scales
       xScale
            .range([0, new_width])
            .domain([0, d3.max(filtered, function (d) { return d.max_value;  })]);

       yScale
            .range([0, height])
            .domain(filtered.map(function (d) { return d.oblast; }));


        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickSizeOuter(0)
                .tickFormat(function(d){ return d.replace("область", "")})
            );

        svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale)
                .ticks(5)
                .tickPadding(10)
                .tickSizeOuter(0)
                .tickSizeInner(-height)
               // .tickFormat(nFormatter)
            );



        /* Лінія */
       var lines = svg.selectAll(".lolly-line")
            .data(filtered);

       lines
            .transition().duration(500)
            .attr("x1", function(d) { return xScale(0); })
            .attr("x2", function(d) { return xScale(d.max_value); })
            .attr("y1", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; })
            .attr("y2", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; });

       lines.enter().append("line")
           .attr("class", "lolly-line")
            .attr("x1", function(d) { return xScale(0); })
            .attr("x2", function(d) { return xScale(0); })
            .attr("y1", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; })
            .attr("y2", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; })
            .attr("stroke", "rgb(244, 174, 164)")
            .attr("stroke-width", 3)
            .transition().duration(500)
            .attr("x2", function(d) { return xScale(d.max_value); });

       lines.exit().remove();


        /* Місцеві вибори */
        var point_local = svg.selectAll(".point-local")
            .data(filtered);

        point_local
            .transition().duration(500)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("cx", function (d, i) { return xScale(d.votes_local);  });


        point_local.enter().append("circle")
            .attr("class", "point-local")
            .attr("r", 7)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("fill", "rgb(236, 114, 99)")
            .attr("stroke", "rgb(244, 174, 164)")
            .attr("stroke-width", 3)
            .attr("cx", function (d, i) { return xScale(0);  })
            .transition().duration(500)
            .attr("cx", function (d, i) { return xScale(d.votes_local);  });

        point_local.exit().remove();



        /* Парламетські вибори */
        var point_parl = svg.selectAll(".point-parliament")
            .data(filtered);

        point_parl
            .transition().duration(500)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("cx", function (d, i) { return xScale(d.votes_parlam);  });

       point_parl.enter().append("circle")
            .attr("class", "point-parliament")
            .attr("r", 4)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("cx", function (d, i) { return xScale(0);  })
            .attr("fill", "grey")
            .transition().duration(500)
            .attr("cx", function (d, i) { return xScale(d.votes_parlam);  });

       point_parl.exit().remove();




        /* Різниця в голосах*/
        var diff_label = svg.selectAll(".diff-label")
            .data(filtered);

        diff_label
            .attr("y", function (d) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("x", function (d) { return xScale(d.max_value) + 10;  })
            .transition().duration(500)
            .text(function(d){ return d.difference });


        diff_label.enter().append("text")
            .attr("class", "diff-label")
            .attr("y", function (d) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("x", function (d) { return xScale(d.max_value) + 10;  })
            .attr("fill", "grey")
            .text(function(d){ return d.difference < 0 ? d.difference : "+" + d.difference  })
            .attr("text-anchor", "start")
            .attr("dy","0.35em");


        diff_label.exit().remove();



        /* Аннотація */
        d3.select("#anotation-1").remove();
        // d3.select("#anotation-2").remove();

        var anotation_1 = svg.append("text")
            .attr("id", "anotation-1")
            .attr("y",  yScale(filtered[0].oblast) + yScale.bandwidth()/2 - 10 )
            .attr("x", xScale(filtered[0].votes_local) + 10)
            .text("місцеві")
            .style("fill", "rgb(236, 114, 99)")
            .attr("text-anchor", "start");


        // var anotation_2 = svg.append("text")
        //     .attr("id", "anotation-2")
        //     .attr("y",  yScale(filtered[0].oblast) + yScale.bandwidth()/2 - 10 )
        //     .attr("x", xScale(filtered[0].votes_parlam) + 10)
        //     .text("парламентські")
        //     .style("fill", "#5D646F")
        //     .attr("text-anchor", "end")


    }




});


