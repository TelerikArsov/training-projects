<?php
/*
Plugin Name: Map Telebid
*/
defined('ABSPATH') or die('Wrong way');
function create_marker_table(){
    global $wpdb;

    $tblname = 'markers';
    $wp_track_table = $wpdb->prefix . "$tblname ";
    if($wpdb->get_var("SHOW TABLES LIKE '$wp_track_table'" ) != $wp_track_table){
        $sql = "CREATE TABLE $wp_track_table ( 
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR( 60 ) NOT NULL,
                lat FLOAT( 10, 6 ) NOT NULL,
                lng FLOAT( 10, 6 ) NOT NULL
                ) ENGINE = MYISAM ;";
        require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
        dbDelta($sql);
    }

}

register_activation_hook( __FILE__, 'create_marker_table' );

add_action('admin_menu', 'telebid_map_setup_menu');

function telebid_map_setup_menu(){
    add_menu_page( 'Map Plugin Page', 'Map Plugin', 'manage_options', 'telebid-map', 'tb_init' );
}

function tb_init(){
    include(plugin_dir_path(__FILE__). "/insert-marker.php");
}

add_action( 'wp_ajax_get_markers', 'get_markers' );
add_action( 'wp_ajax_nopriv_get_markers', 'get_markers' );
function get_markers(){
    global $wpdb;
    $tblname = 'markers';
    $wp_track_table = $wpdb->prefix . "$tblname ";
    $filter_input = $_POST['filter_data']['input'];
    $filter_cords = $_POST['filter_data']['cords'];
    $filter_query =
    "
        SELECT *
        FROM $wp_track_table ";
    $count = 0;
    foreach($filter_input as $key => $value) {
        if($value != ''){
            if($count == 0) {
                $filter_query .= " WHERE ";
            }else if($count > 0){
                $filter_query .= " AND ";
            }
            $filter_query .= ($key. " = '". $value. "'");
            $count++;
        }
    }
    if(isset($filter_cords['NWLat']) && isset($filter_cords['NWLon']) &&
       isset($filter_cords['SELat']) && isset($filter_cords['SELon'])) {
        if($count == 0) {
            $filter_query .= " WHERE ";
        }else if($count > 0){
            $filter_query .= " AND ";
        }
        $filter_query .= ("(lat <= ". $filter_cords['NWLat']. "and lat >= ". $filter_cords['SELat']. 
        ") and (lng >= ". $filter_cords['NWLon']. "and lng <= ". $filter_cords['SELon']. ")");
    }
    $filter_query .= ";";
    $markers = $wpdb->get_results($filter_query);
    $state = $filter_input['state'];
    $region = $wpdb->get_results(
        "
        SELECT DISTINCT region
        FROM $wp_track_table
        WHERE state = '$state';
        "
    );
    $prov = $wpdb->get_results(
        "
        SELECT DISTINCT prov
        FROM $wp_track_table
        WHERE state = '$state';
        "
    );
    echo json_encode(array('markers' => $markers, 'prov' => $prov, 'region' =>  $region));
    die();
}

function tb_map($att) {
    wp_enqueue_script( 'ajax-script', plugins_url( '/js/map.js', __FILE__ ), array('jquery') );

    wp_localize_script( 'ajax-script', 'MyAjax',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
    include(plugin_dir_path(__FILE__). "/views/map-view.php");
}
add_shortcode('telebid-map', 'tb_map');
?>