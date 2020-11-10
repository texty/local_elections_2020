/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 5 : 5;

var stops_values = [
    [-3, 'white'],
    [-1, '#d3d3d3'],
    [0, '#ffffff'],
    [1, '#ffffb2'],
    [3, '#fed976'],
    [6, "#feb24c"],
    [9, "#fd8d3c"],
    [15, "#fc4e2a"],
    [60, "#bd0026"]
];

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';

var map = new mapboxgl.Map({
    container: 'map',
    minZoom: default_zoom_u,
    maxZoom: default_zoom_u + 2,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'dark_matter.json',
    center: [31.5, 48.5],
    zoom: default_zoom_u // starting zoom
});



map.scrollZoom.disable();

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
    map.addSource('schools', {
        type: 'vector',
        tiles: ["https://texty.github.io/local_elections_2020/tiles/{z}/{x}/{y}.pbf"]
    });


    function redrawUkraineMap(choropleth_column) {
        map.addLayer({
            "id": "schools_data",
            'type': 'fill',
            'minzoom': 4,
            'maxzoom': 10,
            'source': "schools",
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


        // map.on('click', 'schools_data', function(e) {
        //     map.getCanvas().style.cursor = 'pointer';
        //     popup =  new mapboxgl.Popup()
        //         .setLngLat(e.lngLat)
        //         .setHTML(e.features[0].properties.MAP_registration_region + ": " + e.features[0].properties[choropleth_column])
        //         .addTo(map);
        //
        //     if(e.features[0].properties.MAP_infections1000 >= 0){
        //         popup.setHTML(e.features[0].properties.MAP_registration_region + ": " + e.features[0].properties[choropleth_column])
        //
        //     } else {
        //         popup.setHTML(e.features[0].properties.MAP_registration_region + ": немає даних");
        //     }
        //
        // });


    }

    function sourceCallback() {
        if (map.getSource('schools') && map.isSourceLoaded('schools') && map.isStyleLoaded()) {
            d3.select("#spinner").remove();
        }
    }        //

    map.on('sourcedata', sourceCallback);



    redrawUkraineMap('results_ПОЛІТИЧНА ПАРТІЯ "ЗА МАЙБУТНЄ"');


    $("#select_party").on("change", function(){
        let selected = $("#select_party").val();
        //console.log(selected)
        map.removeLayer('schools_data');
        redrawUkraineMap(selected);
    });

    /* перемикаємо шари  карти */
    d3.select("#ukraine-switch-buttons").selectAll(".map_button").on("click", function() {
        let selected_layer = d3.select(this).attr("value");
        d3.select(this.parentNode).selectAll(".map_button").classed("active", false);
        d3.select(this).classed("active", true);
        $('.mapboxgl-popup').remove();
        map.removeLayer('schools_data');
        redrawUkraineMap(selected_layer);

    });


    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');

}); //end of Ukraine map













