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

    const detail_margin = {top: 40, right: 10, bottom: 30, left: 50};

    const svg = d3.select("#bar-chart") 
        .append("svg");
        
        
    const svg_2 = svg
        .append("g")
        .attr("transform", "translate(50,30)");

    var detail_xScale = d3.scaleLinear();
    
    var detail_yScale = d3.scaleBand();
    
    

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
        var bars = svg_2.selectAll(".detail")
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
        var party_name = svg_2.selectAll(".label")
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
        var dep_number = svg_2.selectAll(".label2")
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
        draw_detail(data);
    });


    d3.select(".next").on('click', function() {
        if(nIndex >= 0 && nIndex < big_cities_list.length - 1 ){
            nIndex = nIndex + 1
        } else if (nIndex === big_cities_list.length - 1 ) {
            nIndex = 0
        }
        let data = big_cities_list[nIndex];
        draw_detail(data);
    });



});







