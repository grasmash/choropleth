(function($) {

    Drupal.behaviors.choropleth = {
        attach: function(context) {

            // This event is trigged when the recline module creates
            // a new dataExplorer object.
            $(document).bind('createDataExplorer', function(event) {
               // Check to see if choropleth is enabled.
                if (typeof(Drupal.settings.choropleth.enable) != "undefined" && Drupal.settings.choropleth.enable) {
                    // Cycle through each recline view.
                    $.each(window.dataExplorer.options.views, function(i, view) {
                        // Choroplethize the map view.
                        if (view.id == 'map') {
                            var geojson;
                            var info

                            map = window.dataExplorer.options.views[i].view.map;
                            map.reclineView = view;

                            // Modify map view with choropleth functions.
                            choroplethizeMap(view, map);
                        }
                        return true;
                    });
                }
            });

            // Modifies the leaflet map used by recline.
            function choroplethizeMap(view, map) {

                // Loop over each field.
                $.each(view.view.model.fields.models, function(i, field) {
                    // If there is a field name 'State', make modifications.
                    if (field.id == 'State') {
                        // Zoom to contiguous USA.
                        map.setView([37.8, -96], 4);

                        // Overlay geometry from statesData and add shading.
                        geojson = L.geoJson(Drupal.settings.choropleth.statesData, {
                            // Add styling for each state polygon (feature).
                            style: style,
                            // Adds listener for each state polygon (feature).
                            onEachFeature: onEachFeature
                        }).addTo(map);

                        // Define behavior for 'popup', which is displayed
                        // on rollover.
                        info = L.control();
                        info.onAdd = function (map) {
                            this._div = L.DomUtil.create('div', 'info');
                            this.update();
                            return this._div;
                        };
                        info.update = function (props, result) {
                            this._div.innerHTML = (props ? '<b>' + props.name + '</b><br />' + result : 'Hover over a state');
                        };
                        info.addTo(map);
                    }
                    return true;
                });

            }

            // Define the color for a state polygon.
            function getColor(d) {
                // @todo Dynamically determine range of values and scale
                // shading accordingly.
                return d > 1000 ? '#800026' :
                       d > 500  ? '#BD0026' :
                       d > 200  ? '#E31A1C' :
                       d > 100  ? '#FC4E2A' :
                       d > 50   ? '#FD8D3C' :
                       d > 20   ? '#FEB24C' :
                       d > 10   ? '#FED976' :
                                  '#FFEDA0';
            }

            // Set style for a state polygon.
            function style(feature) {
                return {
                    // @todo replace density property with a dynamically
                    // fetched property from viewed node.
                    fillColor: getColor(feature.properties.density),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }

            // Define highlight behavior for state, which occurs on rollover.
            function highlightFeature(e) {
                var layer = e.target;

                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }

                // Find the row in the dataset that corresponds with this
                // state polygon.
                var state = e.target.feature.properties.name;
                var queryObj = {
                    q: state,
                    // @todo replace usage of 'q' with exact term match.
                    // currently, search for Kansas returns Arkansas first!
                    // @see http://reclinejs.com/docs/models.html#query
                    /*
                    filters: [
                        { term : { 'State' : state } }
                    ],
                    */
                    size: 1
                }

                dataset = e.target._map.reclineView.view.model;
                console.log(dataset);
                // @todo prevent this from performing a filter search on all views.
                dataset.query(queryObj).done(function() {
                    //console.log(dataset.records);
                    result = JSON.stringify(dataset.records.toJSON(), null, 1);
                    info.update(layer.feature.properties, result);
                });

            }

            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }

            function zoomToFeature(e) {
                map.fitBounds(e.target.getBounds());
            }

            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }
        }
    }
})(jQuery);
