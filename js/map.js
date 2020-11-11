/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 6 : 5;

var show_oblasts = false;
var show_otg = true;

var stops_values = [
    [0, '#ffffff'],
    [1, '#fef0d9'],
    [4, '#fdd49e'],
    [8, "#fdbb84"],
    [12, "#fc8d59"],
    [18, "#ef6548"],
    [25, "#d7301f"],
    [50, "#990000"]
];

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: default_zoom_u,
    maxZoom: default_zoom_u + 2,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'style3.json',
    center: [31.5, 48.9],
    zoom: default_zoom_u // starting zoom
});

map.scrollZoom.disable();


d3.csv("data/local_elections_parties_list.csv").then(function(parties_list){
    parties_list.forEach(function(d){
        d.dep_amount = +d.dep_amount;
    });

    let options = parties_list
        .filter(function(d){ return d.dep_amount > 0 })
        .sort(function(a, b){ return d3.descending(a.dep_amount, b.dep_amount) });

    d3.select("#select_party")
        .selectAll("option.auto")
        .data(options)
        .enter()
        .append("option")
        .attr("class", "auto")
        .attr("value", function(d){ return "results_"+d.party_name })
        .text(function(d){ return d.party_name })

});






var popup;

/* ------- карта України ------- */
map.on('load', function () {


    var layers = map.getStyle().layers;
    var firstSymbolId;

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }


    //векторні тайли
    map.addSource('otg', {
        type: 'vector',
        tiles: ["https://texty.github.io/local_elections_2020/tiles/otg/{z}/{x}/{y}.pbf"]
    });

    //векторні тайли
    map.addSource('oblasts', {
        type: 'vector',
        tiles: ["https://texty.github.io/local_elections_2020/tiles/oblasts/{z}/{x}/{y}.pbf"]
    });

    //векторні тайли
    map.addSource('oblasts', {
        type: 'vector',
        tiles: ["https://texty.github.io/local_elections_2020/tiles/rayons/{z}/{x}/{y}.pbf"]
    });

    function drawOblasts(){
        map.addLayer({
            "id": "oblasts_data",
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': "oblasts",
            "source-layer": "local_elections_oblasts_4326",
            'layout': {},
            'paint': {
                'fill-color': [
                    "match",
                    ["get", "results_max_party"],
                    'ПОЛІТИЧНА ПАРТІЯ "ЄВРОПЕЙСЬКА СОЛІДАРНІСТЬ"',
                    "#d53e4f",
                    'ПОЛІТИЧНА ПАРТІЯ "СЛУГА НАРОДУ"',
                    "#33a02c",
                    'ПОЛІТИЧНА ПАРТІЯ "ОПОЗИЦІЙНА ПЛАТФОРМА – ЗА ЖИТТЯ"',
                    "#3288bd",
                    'політична партія Всеукраїнське об’єднання "Батьківщина"',
                    "#fdae61",
                    'ПОЛІТИЧНА ПАРТІЯ "ЗА МАЙБУТНЄ"',
                    "#7570b3",
                    'Самовисування',
                    "yellow",
                    'NULL',
                    'transparent',
                    'multiple',
                    '#4d4d4d',
                    "silver"
                ],
                "fill-opacity": 0.8,

                'fill-outline-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "grey",
                    "black"
                ]
            }
        }, firstSymbolId);

        map.on('click', 'oblasts_data', function(e) {
            console.log(e.features[0].properties);
            if(!e.features[0].properties["results_max_party"]) {
                map.getCanvas().style.cursor = 'pointer';
                $('.mapboxgl-popup').remove();
                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML("Немає даних")
                    .addTo(map);

            } else {
                /* даємо в тултіп перелік партй, які увійшли до рад*/
                let win_parties = [];

                /* проходимось по кожній партії, якщо більше 0 депутатів*/
                Object.keys(e.features[0].properties).forEach(function(key) {
                    let dep_amount = e.features[0].properties[key];
                    if(dep_amount > 0 && key.includes("results") && !key.includes("max")){
                        win_parties.push({"party": key.replace("results_", ""), "amount": dep_amount})
                    }
                });

                win_parties.sort(function(a,b){
                    return d3.descending(a.amount, b.amount)
                });


                function showPopUp () {
                    var html = '';
                    html += "<table>";
                    win_parties.forEach(function(d){
                        html += " <tr>";
                        html += "  <td>";
                        html += d.party;
                        html += "  </td>";
                        html += "  <td>";
                        html += d.amount;
                        html += "  </td>";
                        html += " </tr>";
                    });
                    html += "</table>";
                    return html;
                }


                map.getCanvas().style.cursor = 'pointer';
                $('.mapboxgl-popup').remove();
                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(showPopUp())
                    .addTo(map);

            }


        });



    }



    function drawOtg() {
        map.addLayer({
            "id": "otg_data",
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': "otg",
            "source-layer": "local_elections_4326",
            'layout': {},
            'paint': {
             'fill-color': [
                 "match",
                 ["get", "results_max_party"],
                 'ПОЛІТИЧНА ПАРТІЯ "ЄВРОПЕЙСЬКА СОЛІДАРНІСТЬ"',
                 "#d53e4f",
                 'ПОЛІТИЧНА ПАРТІЯ "СЛУГА НАРОДУ"',
                 "#33a02c",
                 'ПОЛІТИЧНА ПАРТІЯ "ОПОЗИЦІЙНА ПЛАТФОРМА – ЗА ЖИТТЯ"',
                 "#3288bd",
                 'політична партія Всеукраїнське об’єднання "Батьківщина"',
                 "#fdae61",
                 'ПОЛІТИЧНА ПАРТІЯ "ЗА МАЙБУТНЄ"',
                 "#7570b3",
                 'Самовисування',
                 "yellow",
                 'NA',
                 'transparent',
                 'multiple',
                 '#4d4d4d',
                 "silver"
                ],
                "fill-opacity": 0.8,

                'fill-outline-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "grey",
                    "lightgrey"
                ]
            }
        }, firstSymbolId);


        map.on('click', 'otg_data', function(e) {
            console.log(e.features[0].properties);
            if(e.features[0].properties["results_hromada_name"] === 'NA') {
                map.getCanvas().style.cursor = 'pointer';
                $('.mapboxgl-popup').remove();
                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML("Немає даних")
                    .addTo(map);

            } else {
                /* даємо в тултіп перелік партй, які увійшли до рад*/
                let win_parties = [];

                /* проходимось по кожній партії, якщо більше 0 депутатів*/
                Object.keys(e.features[0].properties).forEach(function(key) {
                    let dep_amount = e.features[0].properties[key];
                    if(dep_amount > 0 && key.includes("results") && !key.includes("max")){
                        win_parties.push({"party": key.replace("results_", ""), "amount": dep_amount})
                    }
                });

                win_parties.sort(function(a,b){
                    return d3.descending(a.amount, b.amount)
                });


                function showPopUp () {
                    var html = '';
                    html += "<table>";
                    win_parties.forEach(function(d){
                        html += " <tr>";
                        html += "  <td>";
                        html += d.party;
                        html += "  </td>";
                        html += "  <td>";
                        html += d.amount;
                        html += "  </td>";
                        html += " </tr>";
                    });
                    html += "</table>";
                    return html;
                }


                map.getCanvas().style.cursor = 'pointer';
                $('.mapboxgl-popup').remove();
                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(showPopUp())
                    .addTo(map);

            }


        });
    }


    function redrawSelectedParty(choropleth_column, source, id, source_layer) {
        map.addLayer({
            "id": id,
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': source,
            "source-layer": source_layer,
            "paint": {
                'fill-color': {
                    property: choropleth_column,
                    stops: stops_values
                },


                'fill-outline-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "grey",
                    "lightgrey"
                ]
            }
        }, firstSymbolId);

        if(source === "otg"){
            map.on('click', 'otg_data', function(e) {
                map.getCanvas().style.cursor = 'pointer';
                popup.setHTML(e.features[0].properties["ADMIN_3"] + " " + e.features[0].properties["TYPE"] + ": " + e.features[0].properties[choropleth_column])

            });
        }

    }




    function sourceCallback() {
        if (map.getSource('otg') && map.isSourceLoaded('otg') && map.isStyleLoaded()) {
            d3.select("#spinner").remove();
        }
    }        //

    map.on('sourcedata', sourceCallback);


    drawOtg();


    $("#select_party").on("change", function(){
        $('.mapboxgl-popup').remove();
        let selected = $("#select_party").val();


        if(show_otg === true){
            map.removeLayer('otg_data');
            if(selected != "overview"){
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, скільки депутатів від обраної партії пройшли');
                redrawSelectedParty(selected, "otg", "otg_data", "local_elections_4326");
                $("#legend_2").css("display", "none");
                $("#legend_1").css("display", "block");
            } else {
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, які партії пройшли і кількість депутатів');
                drawOtg();
                $("#legend_1").css("display", "none");
                $("#legend_2").css("display", "block");
            }
        } if (show_oblasts === true){

            // map.removeLayer('oblasts_data');
            // if(selected != "overview"){
            //     $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, скільки депутатів від обраної партії пройшли');
            //     redrawSelectedParty(selected, "oblasts", "oblasts_data", "local_elections_oblasts_4326");
            //     $("#legend_2").css("display", "none");
            //     $("#legend_1").css("display", "block");
            // } else {
            //     $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, які партії пройшли і кількість депутатів');
            //     drawOblasts();
            //     $("#legend_1").css("display", "none");
            //     $("#legend_2").css("display", "block");
            // }
        }


    });


    $("#show_oblasts").on("click", function(){
        $('select').prop('disabled', true);
        $(".select2").css("opacity", 0.3);
        show_oblasts = true;
        show_otg  = false;
        map.removeLayer('otg_data');
        drawOblasts();

    });

    $("#show_otg").on("click", function() {
        $('select').prop('disabled', false);
        $(".select2").css("opacity", 1);
        show_otg  = true;
        show_oblasts = false;
        map.removeLayer('oblasts_data');
        drawOtg();
    });


    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');

}); //end of Ukraine map













