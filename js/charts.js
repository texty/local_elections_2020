/**
 * Created by yevheniia on 20.11.20.
 */
const big_cities_list = ["Київська", "Вінницька", "Дніпровська", "Житомирська", "Запорізька", "Івано-Франківська",
    "Кропивницька", "Луцька", "Львівська", "Миколаївська", "Одеська", "Полтавська", "Рівненська", "Сумська", "Тернопільська",
    "Ужгородська",  "Харківська", "Херсонська", "Хмельницька", "Черкаська", "Чернівецька",  "Чернігівська"
];

var nIndex = 0;

Promise.all([
    d3.csv("data/compare_with_parliament.csv"),
    d3.csv("data/big_cities_data.csv")
]).then(function(data){


    /*--- lollipop chart ---*/

    const margin = {top: 40, right: 100, bottom: 30, left: 150};
    const width = d3.select("#compare").node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    data[0].forEach(function(d){
        d.max_value = +d.max_value;
        d.votes_local = +d.votes_local;
        d.votes_parlam = +d.votes_parlam;
        d.difference = +d.difference;
    });


    const compare = d3.select("#compare")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(150,30)");

    const xScale = d3.scaleLinear();
    const yScale = d3.scaleBand();

    compare
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 0 + "," + height + ")");


    compare.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(0,0)");



    d3.selectAll(".draw-lollipop").on("click", function(){
        d3.selectAll(".draw-lollipop").classed("active", false);
        d3.select(this).classed("active", true);
        let selected = d3.select(this).attr("value");
        d3.select("h2#compare-title").select("span").text(selected);
        drawPops(selected)
    });

    function drawPops(selected_pary){
        
        var filtered = data[0].filter(function(d){ return d.party_name === selected_pary });
        var new_width = d3.select("#compare").node().getBoundingClientRect().width - margin.left - margin.right;

        d3.select("#compare").select("svg")
            .attr("width", new_width + margin.left + margin.right);

       //Update the scales
       xScale
            .range([0, new_width])
            .domain([0, d3.max(filtered, function (d) { return d.max_value;  })]);

       yScale
            .range([0, height])
            .domain(filtered.map(function (d) { return d.oblast; }));


        compare.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickSizeOuter(0)
                .tickFormat(function(d){ return d.replace("область", "")})
            );

        compare.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale)
                .ticks(new_width > 500 ? 5 : 2)
                .tickPadding(10)
                .tickSizeOuter(0)
                .tickSizeInner(-height)
            );



        /* Лінія */
       var lines = compare.selectAll(".lolly-line")
            .data(filtered);

       lines.enter().append("line")
           .attr("class", "lolly-line")
           .merge(lines)
           .transition().duration(500)
           .attr("x1", function(d) { return xScale(0); })
           .attr("x2", function(d) { return xScale(d.max_value); })
           .attr("y1", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; })
           .attr("y2", function(d) { return yScale(d.oblast) + yScale.bandwidth()/2; })
           .attr("stroke", "rgb(244, 174, 164)")
           .attr("stroke-width", 3);

       lines.exit().remove();


        /* Місцеві вибори */
        var point_local = compare.selectAll(".point-local")
            .data(filtered);

        point_local.enter().append("circle")
            .attr("class", "point-local")
            .merge(point_local)
            .transition().duration(500)
            .attr("r", 7)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("cx", function (d, i) { return xScale(d.votes_local);  })
            .attr("fill", "rgb(236, 114, 99)")
            .attr("stroke", "rgb(244, 174, 164)")
            .attr("stroke-width", 3);

        point_local.exit().remove();



        /* Парламетські вибори */
        var point_parl = compare.selectAll(".point-parliament")
            .data(filtered);

       point_parl.enter().append("circle")
            .attr("class", "point-parliament")
            .merge(point_parl)
            .attr("r", 4)
            .transition().duration(500)
            .attr("cy", function (d, i) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("cx", function (d, i) { return xScale(d.votes_parlam);  })
            .attr("fill", "grey");

       point_parl.exit().remove();




        /* Різниця в голосах*/
        var diff_label = compare.selectAll(".diff-label")
            .data(filtered);

        diff_label.enter().append("text")
            .attr("class", "diff-label")
            .merge(diff_label)
            .transition().duration(500)
            .attr("y", function (d) { return yScale(d.oblast) + yScale.bandwidth()/2;  })
            .attr("x", function (d) { return xScale(d.max_value) + 10;  })
            .attr("fill", "grey")
            .text(function(d){ return d.difference < 0 ? d.difference : "+" + d.difference  })
            .attr("text-anchor", "start")
            .attr("dy","0.35em");

        diff_label.exit().remove();


        /* Аннотація */
        d3.select("#anotation-1").remove();

        compare.append("text")
            .attr("id", "anotation-1")
            .attr("y",  yScale(filtered[0].oblast) + yScale.bandwidth()/2 - 10 )
            .attr("x", xScale(filtered[0].votes_local) + 10)
            .text("місцеві")
            .style("fill", "rgb(236, 114, 99)")
            .attr("text-anchor", "start");
    }



    /*--- місцеві ради обласних центрів ---*/
    

    data[1].forEach(function(d){
        d.dep_number = +d.dep_number;
    });

    const detail_margin = {top: 40, right: 10, bottom: 30, left: 50};
    const detail_xScale = d3.scaleLinear();
    const detail_yScale = d3.scaleBand();

    const barChart = d3.select("#bar-chart")
        .append("svg")
        .append("g")
        .attr("transform", "translate(50,30)");



    function drawBarChart(city){

        d3.select("#bars-title span").text(city);
        var filtered = data[1]
            .filter(function(d){
                return d.hromada === city
            });

        filtered.length === 0 ? d3.select("#no-data").style("display", "block") : d3.select("#no-data").style("display", "none");


        var new_width =  d3.select("#bar-chart").node()
                .getBoundingClientRect().width - detail_margin.left - detail_margin.right;

        d3.select("#bar-chart").select("svg")
            .attr("width", new_width )
            .attr("height", 50 * filtered.length + 30);

        //Update the scales
        detail_xScale
            .range([0, new_width - detail_margin.left - detail_margin.right])
            .domain([0, d3.max(filtered, function (d) { return d.dep_number;  })]);

        detail_yScale
            .range([0, 50 * filtered.length])
            .domain(filtered.map(function (d) { return d.party_name; }));



        /* барчики */
        var bars = barChart.selectAll(".detail")
            .data(filtered);

        bars.enter().append("rect")
            .attr("class", "detail tip")
            .merge(bars)
            .attr("y", function (d, i) { return detail_yScale(d.party_name) +  detail_yScale.bandwidth()/2; })
            .attr("height", detail_yScale.bandwidth() / 4 )
            .transition().duration(500)
            .attr("x", 0)
            .attr("width", function (d) { return detail_xScale(d.dep_number);  })
            .attr("fill", "rgb(236, 114, 99)");

        bars.exit().remove();



        /* назви партій */
        var party_name = barChart.selectAll(".label")
            .data(filtered);

        party_name
            .enter()
            .append("text")
            .attr("class", "label")
            .merge(party_name)
            .transition().duration(0)
            .attr("x", function(d) { return  detail_xScale(0); })
            .attr("y", function(d) { return detail_yScale(d.party_name)  +  detail_yScale.bandwidth()/3 })
            .attr("fill", "grey")
            .text(function(d){ return d.party_name
                .toUpperCase()
                .replace("ПОЛІТИЧНА ПАРТІЯ ", "")
                .replace("ВСЕУКРАЇНСЬКЕ ОБ’ЄДНАННЯ", "ВО")
                .replace(" (УКРАЇНСЬКИЙ ДЕМОКРАТИЧНИЙ АЛЬЯНС ЗА РЕФОРМИ) ВІТАЛІЯ КЛИЧКА", "")
                .replace("ОПОЗИЦІЙНА ПЛАТФОРМА – ЗА ЖИТТЯ", "ОПЗЖ")
                //.replace('"', '').replace('"', '')
            })

        ;


        party_name.exit().remove();


        /* кількіть депутатів */
        var dep_number = barChart.selectAll(".label2")
            .data(filtered);
        dep_number
            .enter()
            .append("text")
            .attr("class", "label2")
            .merge(dep_number)
            .transition().duration(0)
            .attr("x", function(d) { return  -30; })
            .attr("y", function(d) { return detail_yScale(d.party_name)  +  detail_yScale.bandwidth()/2 })
            .text(function(d){ return d.dep_number })
            .attr("fill", "grey");

        dep_number.exit().remove();
    }



    /* Слайдер-горталка */
    d3.select(".prev").on('click', function() {
        if(nIndex > 0 && nIndex < big_cities_list.length){
            nIndex = nIndex -1
        } else if (nIndex === 0) {
            nIndex = big_cities_list.length -1
        }
        let data = big_cities_list[nIndex];
        drawBarChart(data);
    });


    d3.select(".next").on('click', function() {
        if(nIndex >= 0 && nIndex < big_cities_list.length - 1 ){
            nIndex = nIndex + 1
        } else if (nIndex === big_cities_list.length - 1 ) {
            nIndex = 0
        }
        let data = big_cities_list[nIndex];
        drawBarChart(data);
    });


    drawBarChart("Київська");
    drawPops("Слуга народу");



    d3.select(window).on('resize', function() {
        drawPops("Слуга народу");
        drawBarChart("Київська");
    })


});


