<style>
    #map {
        width: 100%;
        height: 900px;
        background-color: grey;
    }
    strong, text{
        color: black;
    }
    strong#title {
        font-size: 15px;
    }
    #filterOptions {
        width: 100%;
        display: flex;
        align-items: center;
    }
    #filterOptions > * {
        text-align: center;
        margin-right: 1em;
    }
    #filterOptions div{
        width: 200px;
    }
    #filterOptions div > select{
        width: 100%;
    }
    #filter {
        height: 40px;
        display: flex;
        align-items: center;
        margin-bottom: 1em;
        margin-top: 0.5em;
    }
    li{
        background-color: black;
    }
</style>
<h3>Maps</h3>
<div id="filterOptions">
    <div>
        <label for="stateFilter">State</label>
        <input type="text" id="stateFilter" name="filter" autocomplete="off">
    </div>
    <div>
        <label for="regionFilter">REGION</label>
        <select class="js-example-basic-single" id="regionFilter">
            <option value="NULL">None</option>
        </select>
    </div>
    <div>
        <label for="provFilter">PROVINCE</label>
        <select class="js-example-basic-single" id="provFilter">
            <option value="NULL">None</option>
        </select> 
    </div>
    <div>
        <label for="cityFilter">City</label>
        <input type="text" id="cityFilter" name="cityFilter" autocomplete="off">
    </div>
    <div>
        <label for="NWLatFilter">NE lat</label>
        <input type="number" step="any" id="NWLatFilter" name="NWLatFilter">
        <label for="NWLonFilter">NE lon</label>
        <input type="number" step="any" id="NWLonFilter" name="NWLonFilter">
    </div>
    <div>
        <label for="SELatFilter">SE lat</label>
        <input type="number" step="any" id="SELatFilter" name="SELatFilter">
        <label for="SELonFilter">SE lon</label>
        <input type="number" step="any" id="SELonFilter" name="SELonFilter">
    </div>
</div>
<button type="button" id="filter">Filter</button>
<p id="count"></p>
<div id="map"></div>
<script> 
    map; 
    function initMap() { 
        map = new google.maps.Map(document.getElementById('map'), { center: { lat: -33.863276, lng: 151.207977 }, zoom: 4 });
    }   
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=OWN&callback=initMap" async
    defer></script>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js"></script>
