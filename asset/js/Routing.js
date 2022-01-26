

require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",

    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
    
    "esri/widgets/Search",
    "esri/Graphic",
    "esri/rest/route",
    "esri/rest/support/RouteParameters",
    "esri/rest/support/FeatureSet"

  ], function(esriConfig, Map, MapView, BasemapToggle, BasemapGallery, Search ,Graphic, route, RouteParameters, FeatureSet) {

  esriConfig.apiKey = "AAPKc0b8ba2631154c479397b7b54ef30a317KkDtiXgQNidqHbd_SP-sm7BdeGE5jQ-mGWnCAgLB7dFTkGEXcLLe6SZHFRpr14m";

  const map = new Map({
    basemap: "arcgis-navigation" //Basemap layer service
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [ -74.08175,4.60971 ], //Longitude, latitude
    zoom: 12
  });
 //buscar
const search = new Search({  //Add Search widget
    view: view
  });

  view.ui.add(search, "top-right"); 
//capas
const basemapToggle = new BasemapToggle({
      view: view,
      nextBasemap: "arcgis-imagery"
   });

    view.ui.add(basemapToggle,"bottom-right");

    


//rutas
  const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

  view.on("click", function(event){

    if (view.graphics.length === 0) {
      addGraphic("origin", event.mapPoint);
    } else if (view.graphics.length === 1) {
      addGraphic("destination", event.mapPoint);

      getRoute(); // Call the route service

    } else {
      view.graphics.removeAll();
      addGraphic("origin",event.mapPoint);
    }

  });

  function addGraphic(type, point) {
    const graphic = new Graphic({
      symbol: {
        type: "simple-marker",
        color: (type === "origin") ? "orange" : "black",
        size: "8px"
      },
      geometry: point
    });
    view.graphics.add(graphic);
  }

  function getRoute() {
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: view.graphics.toArray()
      }),

      returnDirections: true

    });

    route.solve(routeUrl, routeParams)
      .then(function(data) {
        data.routeResults.forEach(function(result) {
          result.route.symbol = {
            type: "simple-line",
            color: [5, 150, 255],
            width: 2
          };
          view.graphics.add(result.route);
        });

        // Display directions
       if (data.routeResults.length > 0) {
         const directions = document.createElement("ol");
         directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
         directions.style.marginTop = "0";
         directions.style.padding = "15px 15px 15px 30px";
         const features = data.routeResults[0].directions.features;

         // Show each direction
         features.forEach(function(result,i){
           const direction = document.createElement("li");
           direction.innerHTML = result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
           directions.appendChild(direction);
         });

        view.ui.empty("bottom-left");
        view.ui.add(directions, "bottom-left");

       }

      })

      .catch(function(error){
          console.log(error);
      })

  }

});