<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Vehicle.php';

$database = new Database();
$db = $database->getConnection();

$vehicle = new Vehicle($db);

$data = json_decode(file_get_contents("php://input"));

$vehicle->id = $data->id;

if($vehicle->delete()) {
    http_response_code(200);
    echo json_encode(array("message" => "Vehicle was deleted."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to delete vehicle."));
}
?>