<?php
global $first_time, $conn, $stmt, $servername, $username, $password, $dbname;
define("MYSQL_CODE_DUPLICATE_KEY", 1062);
$servername = "localhost";
$username = "";
$password = ""; #own
$dbname = "";
$first_time = 1;
$conn = null;
$stmt = null;
$requesting = False;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (! isset($_POST['nonce_marker']) || ! wp_verify_nonce( $_POST['nonce_marker'], 'add_marker' )) {
         echo 'Security error. Do not process the form.';
         return;
    }
    if(isset($_POST['alot'])) {
        insert_alot();
    }else{
        insert_row($_POST['location_name'], $_POST['lat'], $_POST['lng']);
    }
}
function insert_alot(){
    global $conn, $stmt, $wpdb, $requesting;
    if(!$requesting){
        $requesting = True;
        $ammount = $_POST['ammount'];
        if(!isset($ammount) || trim($ammount) == ''){
            echo 'Ammount not set properly';
        }else {
            $start = microtime(true);
            for($i = 0; $i < intval($ammount); $i++){
                $json = get_coords('default');
                $json = json_decode($json);
                $args = array(
                    'lat,d'           => (float)clear_var($json->{'nearest'}->{'latt'}),
                    'lng,d'           => (float)clear_var($json->{'nearest'}->{'longt'}),
                    'geonumber,s'     => $json->{'geonumber'},
                    'threegeonames,s' => $json->{'threegeonames'},
                    'geocode,s'       => $json->{'geocode'},
                    'altgeocode,s'    => $json->{'nearest'}->{'altgeocode'},
                    'elevation,i'     => (int)clear_var($json->{'nearest'}->{'elevation'}),
                    'timezone,s'      => clear_var($json->{'nearest'}->{'timezone'}),
                    'city,s'          => clear_var($json->{'nearest'}->{'city'}),
                    'prov,s'          => clear_var($json->{'nearest'}->{'prov'}),
                    'region,s'        => clear_var($json->{'nearest'}->{'region'}),
                    'state,s'         => clear_var($json->{'nearest'}->{'state'}),
                    'name,s'          => clear_var(array_key_exists('name', $json->{'nearest'}) 
                                                                        ? $json->{'nearest'}->{'name'} 
                                                                        : $json->{'nearest'}->{'city'})
                );
                insert_row_raw($args);
                if((isset($conn) && $conn->errno) == MYSQL_CODE_DUPLICATE_KEY ||
                $wpdb->last_error) {
                    echo "Cant add marker: ", $args['name,s'], PHP_EOL;
                }
            }
            echo "Elapsed: ", ($time_elapsed_secs = microtime(true) - $start), PHP_EOL;
            if (isset($conn) && mysqli_ping($conn)){
                $conn->close();
            }
        }
        echo "done";
        $requesting = False;
    }
    
}
function clear_var($var){
    if($var instanceof stdClass){
        return null;
    }else {
        return $var;
    }
}
function get_coords($type)
{
    $data = null;
    if($type == 'wp-get'){
        $data = wp_remote_get('https://api.3geonames.org/?randomland=yes&json=1')['body'];
    }elseif($type == 'default'){
        $data = file_get_contents('https://api.3geonames.org/?randomland=yes&json=1');
    }
    return $data;
}
function insert_row_raw(array $args){
    global $first_time, $stmt, $conn;
    if($first_time == 1) {
        global $servername, $username, $password, $dbname;
        $conn = new mysqli($servername, $username, $password, $dbname);
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        $first_time = 0;
    }
    if(!is_null($args['lat,d']) && !is_null($args['lng,d']) &&
    !is_null($args['city,s'])){
        $values = array_values($args);
        $keys = '';
        $types = '';
        foreach(array_keys($args) as $key) {
            $tokens = explode(',', $key);
            $keys .= $tokens[0]. ', ';
            $types .= $tokens[1];
        }
        $keys = substr($keys, 0, -2);
        $placeholders = str_repeat('?, ', count($values) - 1 ). '?';
        #echo $types, ' ', $placeholders, ' ', $keys, PHP_EOL;
        $stmt = $conn->prepare("INSERT INTO wp_markers ($keys) 
                            VALUES ($placeholders)");
        $stmt->bind_param($types, ...$values);
        $stmt->execute();
        $stmt->close();
    }
}

function insert_row($name, $lat, $lng) {
    global $wpdb;
    $tblname = 'markers';
    $wp_track_table = $wpdb->prefix. "$tblname";
    if(!isset($name) || trim($name) == ''
    || !isset($lat) || (is_string($lat) && trim($lat)) == ''
    || !isset($lng) || (is_string($lng) && trim($lng)) == '')
    {
        echo "Wrong input";
    }
    else
    {
        $wpdb->insert( $wp_track_table,
        array( 
            'name' => $name, 
            'lat' => $lat,
            'lng' => $lng
        ), 
        array( 
            '%s', 
            '%f',
            '%f' 
        ) );
        #echo "SAVING ENTRY";
    }
    
}
?>

<form method="POST">
    <p>
        <label for="name">Name:</label>
        <input type="text" name="location_name" id="name">
    </p>
    <p>
        <label for="lat">Lat:</label>
        <input type="text" name="lat" id="lat">
    </p>
    <p>
        <label for="lng">Lng:</label>
        <input type="text" name="lng" id="lng">
    </p>
    <input name="submit" type="submit" value="Submit">
    <?php wp_nonce_field( 'add_marker', 'nonce_marker' ); ?>
</form>

<form method="POST">
    <p>
        <label for="ammount">Ammount:</label>
        <input type="text" name="ammount" id="ammount">
    </p>
    <input name="alot" type="submit" value="Add a lot">
    <?php wp_nonce_field( 'add_marker', 'nonce_marker' ); ?>
</form>