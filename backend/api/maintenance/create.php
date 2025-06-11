<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/MaintenanceEvent.php';

$database = new Database();
$db = $database->getConnection();

$maintenance = new MaintenanceEvent($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->vehicleId) &&
    !empty($data->date) &&
    isset($data->mileage) &&
    !empty($data->type) &&
    !empty($data->serviceType)
) {
    $maintenance->id = $data->id ?? uniqid();
    $maintenance->vehicle_id = $data->vehicleId;
    $maintenance->vehicle_plate = $data->vehiclePlate;
    $maintenance->date = $data->date;
    $maintenance->mileage = $data->mileage;
    $maintenance->type = $data->type;
    $maintenance->service_type = $data->serviceType;
    $maintenance->workshop = $data->workshop ?? null;
    $maintenance->cost = $data->cost ?? null;
    $maintenance->notes = $data->notes ?? null;
    $maintenance->last_updated = date('Y-m-d H:i:s');

    if($maintenance->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Maintenance event was created.", "id" => $maintenance->id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create maintenance event."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create maintenance event. Data is incomplete."));
}
?>