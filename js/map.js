/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 6 : 5;

var stops_values = [
    [0, '#ffffff'],
    [1, '#fef0d9'],
    [4, '#fdd49e'],
    [8, "#fdbb84"],
    [12, "#fc8d59"],
    [18, "#ef6548"],
    [25, "#d7301f"],
    [35, "#990000"]
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

var popup;

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


    function drawTotal() {
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


    function redrawSelectedParty(choropleth_column) {
        map.addLayer({
            "id": "otg_data",
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': "otg",
            "source-layer": "local_elections_4326",
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


        map.on('click', 'otg_data', function(e) {
            map.getCanvas().style.cursor = 'pointer';
            popup.setHTML(e.features[0].properties["ADMIN_3"] + " " + e.features[0].properties["TYPE"] + ": " + e.features[0].properties[choropleth_column])

        });
    }

    function sourceCallback() {
        if (map.getSource('otg') && map.isSourceLoaded('otg') && map.isStyleLoaded()) {
            d3.select("#spinner").remove();
        }
    }        //

    map.on('sourcedata', sourceCallback);


    drawTotal();


    $("#select_party").on("change", function(){
        $('.mapboxgl-popup').remove();
        map.removeLayer('otg_data');
        let selected = $("#select_party").val();
        if(selected != "overview"){
            $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, скільки депутатів від обраної партії пройшли');
            redrawSelectedParty(selected);
            $("#legend_2").css("display", "none");
            $("#legend_1").css("display", "block");
        } else {
            $("#map-guide").html('Клікніть на ОТГ, щоб подивитись, які партії пройшли і кількість депутатів');
            drawTotal();
            $("#legend_1").css("display", "none");
            $("#legend_2").css("display", "block");
        }

    });


    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');

}); //end of Ukraine map













