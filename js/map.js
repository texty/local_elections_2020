/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 6 : 5;

var show_oblasts = false;
var show_otg = true;
var show_rayons = false;

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
    minZoom: 4,
    maxZoom: 10,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'style3.json',
    center: [31.5, 48.9],
    zoom: default_zoom_u // starting zoom
});

map.scrollZoom.disable();

var otg_options;
var rayons_options;

Promise.all([
        d3.csv("data/otg_parties_list.csv"),
        d3.csv("data/rayons_parties_list.csv")
    ]).then(function(parties_list){


    parties_list[0].forEach(function(d){ d.dep_amount = +d.dep_amount; });
    parties_list[1].forEach(function(d){ d.dep_amount = +d.dep_amount; });

    console.table(parties_list[0]);

    otg_options = parties_list[0]
        .filter(function(d){ return d.dep_amount > 0 })
        .sort(function(a, b){ return d3.descending(a.dep_amount, b.dep_amount) });

    rayons_options = parties_list[1]
        .filter(function(d){ return d.dep_amount > 0 })
        .sort(function(a, b){ return d3.descending(a.dep_amount, b.dep_amount) });

    d3.select("#select_party")
        .selectAll("option.auto")
        .data(otg_options)
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
    map.addSource('rayons', {
        type: 'vector',
        tiles: ["https://texty.github.io/local_elections_2020/tiles/rayons/{z}/{x}/{y}.pbf"]
    });


    function drawPopup(e) {
        if (e.features[0].properties["results_max_party"] === 'NA') {
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
            Object.keys(e.features[0].properties).forEach(function (key) {
                let dep_amount = e.features[0].properties[key];
                if (dep_amount > 0 && key.includes("results") && !key.includes("max")) {
                    win_parties.push({"party": key.replace("results_", ""), "amount": dep_amount})
                }
            });

            win_parties.sort(function (a, b) {
                return d3.descending(a.amount, b.amount)
            });


            function showPopUp() {
                var html = '';
                html += " <div style='font-weight: bold;margin-bottom: 10px;'>" + e.features[0].properties['ADMIN_3'] + " " + e.features[0].properties['TYPE'] + "</div>";
                html += "<table>";

                win_parties.forEach(function (d) {
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
    }


    function removeLayers(){
        if (map.getLayer("oblasts_data")) {
            map.removeLayer("oblasts_data");
        }

        if (map.getLayer("otg_data")) {
            map.removeLayer("otg_data");
        }

        if (map.getLayer("rayons_data")) {
            map.removeLayer("rayons_data");
        }
    }


    function drawMain(id, source, source_layer){
        map.addLayer({
            "id": id,
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': source,
            "source-layer": source_layer,
            'layout': {},
            'paint': {
                'fill-color': [
                    "match",
                    ["get", "results_max_party"],
                    'ПОЛІТИЧНА ПАРТІЯ "ЄВРОПЕЙСЬКА СОЛІДАРНІСТЬ"', "#d53e4f",
                    'ПОЛІТИЧНА ПАРТІЯ "СЛУГА НАРОДУ"', "#33a02c",
                    'ПОЛІТИЧНА ПАРТІЯ "ОПОЗИЦІЙНА ПЛАТФОРМА – ЗА ЖИТТЯ"', "#3288bd",
                    'політична партія Всеукраїнське об’єднання "Батьківщина"', "#fdae61",
                    'ПОЛІТИЧНА ПАРТІЯ "ЗА МАЙБУТНЄ"', "#7570b3",
                    'Самовисування', "yellow",
                    'NA', 'transparent',
                    'multiple', '#4d4d4d',
                    "silver"
                ],
                "fill-opacity": 0.8,
                'fill-outline-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "grey",
                    "grey"
                ]
            }
        }, firstSymbolId);

        map.on('click', id, function(e) {
            drawPopup(e)
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


    drawMain("otg_data", "otg", "local_elections_4326");


    $("#select_party").on("change", function(){
        $('.mapboxgl-popup').remove();
        let selected = $("#select_party").val();


        if(show_otg === true){
            map.removeLayer('otg_data');
            if(selected != "overview"){
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, скільки депутатів від обраної партії пройшли');
                redrawSelectedParty(selected, "otg", "otg_data", "local_elections_otg_4326");
                $("#legend_2").css("display", "none");
                $("#legend_1").css("display", "block");
            } else {
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, які партії пройшли і кількість депутатів');
                drawMain("otg_data", "otg", "local_elections_otg_4326");
                $("#legend_1").css("display", "none");
                $("#legend_2").css("display", "block");
            }
        } else if (show_oblasts === true){

        } else if (show_rayons === true ){
            map.removeLayer('rayons_data');
            if(selected != "overview"){
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, скільки депутатів від обраної партії пройшли');
                redrawSelectedParty(selected, "rayons", "rayons_data", "local_elections_rayons_4326");
                $("#legend_2").css("display", "none");
                $("#legend_1").css("display", "block");
            } else {
                $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, які партії пройшли і кількість депутатів');
                drawMain("oblasts_data", "oblasts","local_elections_oblasts_4326");
                $("#legend_1").css("display", "none");
                $("#legend_2").css("display", "block");
            }

        }


    });


    $("#show_oblasts").on("click", function(){
        if(show_oblasts === true){
            return false
        } else {
            d3.selectAll("button").classed("active", false);
            d3.select(this).classed("active", true);
            $('#select_party').val('overview').trigger('change');
            $('select').prop('disabled', true);
            $(".select2").css("opacity", 0.3);
            show_oblasts = true;
            show_otg  = false;
            show_rayons = false;
            removeLayers();
            drawMain("oblasts_data", "oblasts","local_elections_oblasts_4326");
        }


    });

    $("#show_otg").on("click", function() {
        if(show_otg === true){
            return false
        } else {
            d3.selectAll("button").classed("active", false);
            d3.select(this).classed("active", true);

            d3.selectAll("option.auto").remove();
            d3.select("#select_party")
                .selectAll("option.auto")
                .data(otg_options)
                .enter()
                .append("option")
                .attr("class", "auto")
                .attr("value", function(d){ return "results_"+d.party_name })
                .text(function(d){ return d.party_name });

            $('#select_party').val('overview').trigger('change');
            $('select').prop('disabled', false);
            $(".select2").css("opacity", 1);
            show_otg = true;
            show_oblasts = false;
            show_rayons = false;
            removeLayers();

            drawMain("otg_data", "otg", "local_elections_otg_4326");
        }
    });

    $("#show_rayons").on("click", function() {
        if(show_rayons === true){
            return false
        } else {

            d3.selectAll("button").classed("active", false);
            d3.select(this).classed("active", true);

            d3.selectAll("option.auto").remove();
            d3.select("#select_party")
                .selectAll("option.auto")
                .data(rayons_options)
                .enter()
                .append("option")
                .attr("class", "auto")
                .attr("value", function(d){ return "results_"+d.party_name })
                .text(function(d){ return d.party_name });


            $('#select_party').val('overview').trigger('change');
            $('select').prop('disabled', false);
            $(".select2").css("opacity", 1);
            show_rayons = true;
            show_otg = false;
            show_oblasts = false;
            removeLayers();
            drawMain("rayons_data", "rayons", "local_elections_rayons_4326");
        }
    });



    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');

}); //end of Ukraine map













