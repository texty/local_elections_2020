/**
 * Created by yevheniia on 20.11.20.
 */
const big_cities_list = ["Київська", "Вінницька", "Дніпровська", "Донецька", "Житомирська", "Запорізька", "Івано-Франківська",
    "Кропивницька", "Луганська", "Луцька", "Львівська", "Миколаївська", "Одеська", "Полтавська", "Рівненська", "Сумська", "Тернопільська",
    "Ужгородська",  "Харківська", "Херсонська", "Хмельницька", "Черкаська", "Чернівецька",  "Чернігівська"
    ];

var nIndex = 0;


d3.csv("data/big_cities_data.csv").then(function(cities_data){


    cities_data.forEach(function(d){
        d.dep_number = +d.dep_number;
    });


    const detail_margin = {top: 40, right: 20, bottom: 30, left: 50},
        detail_width = d3.select("#bar-chart").node().getBoundingClientRect().width - detail_margin.left - detail_margin.right,
        detail_height = 500 - detail_margin.top - detail_margin.bottom;

    const svg = d3.select("#bar-chart") 
        .append("svg")
        .attr("width", detail_width + detail_margin.left + detail_margin.right)
        .attr("height", 0);
        
        
    const svg_2 = svg    
        .append("g")
        .attr("transform", "translate(50,30)");

    var detail_xScale = d3.scaleLinear();
    var detail_yScale = d3.scaleBand().range([0, detail_height]);

//Add group for the x axis
    svg_2
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 0 + "," + (-10) + ")");

//Add group for the y axis
    svg_2.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(50,0)");


    draw_detail("Київська");

    function draw_detail(city){
        
        d3.select("#bars-title span").text(city);
        var filtered = cities_data
            .filter(function(d){
                return d.hromada === city
            });

        filtered.length === 0 ? d3.select("#no-data").style("display", "block") : d3.select("#no-data").style("display", "none");


        var new_width =  d3.select("#bar-chart").node()
                .getBoundingClientRect().width - detail_margin.left - detail_margin.right;

        svg
            .attr("width", new_width)
            .attr("height", 50 * filtered.length + 30);
        
        //Update the scales
        detail_xScale
            .range([0, new_width])
            .domain([0, d3.max(filtered, function (d) { return d.dep_number;  })]);

        detail_yScale
            .range([0, 50 * filtered.length])
            .domain(filtered.map(function (d) { return d.party_name; }));


        var detail_bar = svg_2.selectAll(".detail")
            .data(filtered);

        detail_bar.enter().append("rect")
            .attr("class", "detail tip")
            .merge(detail_bar)
            .attr("y", function (d, i) { return detail_yScale(d.party_name) +  detail_yScale.bandwidth()/2; })
            .attr("height", detail_yScale.bandwidth() / 4 )
            .transition().duration(500)
            .attr("x", 0)
            .attr("width", function (d) { return detail_xScale(d.dep_number);  })
            .attr("fill", "rgb(236, 114, 99)");

        detail_bar.exit().remove();




        var t = svg_2.selectAll(".label")
            .data(filtered);
        t
            .enter()
            .append("text")
            .attr("class", "label")
            .merge(t)
            .transition()
            .duration(0)
            .attr("x", function(d) { return  detail_xScale(0); })
            .attr("y", function(d) { return detail_yScale(d.party_name)  +  detail_yScale.bandwidth()/3 })
            .text(function(d){ return d.party_name })
            .attr("fill", "grey");


        t.exit().remove();


        var l = svg_2.selectAll(".label2")
            .data(filtered);
        l
            .enter()
            .append("text")
            .attr("class", "label2")
            .merge(l)
            .transition()
            .duration(0)
            .attr("x", function(d) { return  -30; })
            .attr("y", function(d) { return detail_yScale(d.party_name)  +  detail_yScale.bandwidth()/2 })
            .text(function(d){ return d.dep_number })
            .attr("fill", "grey");

        l.exit().remove();
    }

// for(var i = 0; i < big_cities_list; i++){
    d3.select(".prev").on('click', function() {
        if(nIndex > 0 && nIndex < big_cities_list.length){
            nIndex = nIndex -1
        } else if (nIndex === 0) {
            nIndex = big_cities_list.length -1
        }
        console.log(nIndex);
        let data = big_cities_list[nIndex];
        draw_detail(data);
    });


    d3.select(".next").on('click', function() {
        if(nIndex >= 0 && nIndex < big_cities_list.length - 1 ){
            nIndex = nIndex + 1
        } else if (nIndex === big_cities_list.length - 1 ) {
            nIndex = 0
        }
        console.log(nIndex);
        let data = big_cities_list[nIndex];
        draw_detail(data);
    });


// }


});


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var current_id = "one";
var prev = $('div.prev');
var next = $('div.next');
var index = 0;
var lis = $('#one').find('ul.slider li');
var count = lis.length;

// d3.select(".prev").on('click', function() {
//     draw_detail("Вінницька");
    // let carusel = $(this).closest(".torf-carusel");
    // let new_id = $(carusel).attr("id");
    // if(current_id != new_id){
    //     current_id = new_id;
    //     index = 0;
    //     lis = $(carusel).find('ul.slider li');
    //     count = lis.length;
    // }
    // $(lis[index]).removeClass('visible');
    // index--;
    // if (index < 0){
    //     index = count-1;
    // }
    //
    // $(lis[index]).addClass('visible');
    // let alt = $(lis[index]).find("img").attr("alt");
    // $(carusel).find("p.carousel-caption").html(alt);
// });

next.on('click', function() {
    let carusel = $(this).closest(".torf-carusel");
    let new_id = $(carusel).attr("id");
    if(current_id != new_id){
        current_id = new_id;
        index = 0;
        lis = $(carusel).find('ul.slider li');
        count = lis.length;
    }
    $(lis[index]).removeClass('visible', false);
    index++;
    if (index > count-1){
        index = 0;
    }

    $(lis[index]).addClass('visible', true);
    let alt = $(lis[index]).find("img").attr("alt");
    $(carusel).find("p.carousel-caption").html(alt);
});





