<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Incident.php';

$database = new Database();
$db = $database->getConnection();

$incident = new Incident($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->vehicleId) &&
    !empty($data->date) &&
    !empty($data->description) &&
    !empty($data->damageLevel) &&
    !empty($data->status)
) {
    $incident->id = $data->id ?? uniqid();
    $incident->vehicle_id = $data->vehicleId;
    $incident->vehicle_plate = $data->vehiclePlate;
    $incident->date = $data->date;
    $incident->time = $data->time ?? null;
    $incident->description = $data->description;
    $incident->damage_level = $data->damageLevel;
    $incident->status = $data->status;
    $incident->location = $data->location ?? null;
    $incident->third_party_name = $data->thirdPartyName ?? null;
    $incident->third_party_vehicle_plate = $data->thirdPartyVehiclePlate ?? null;
    $incident->third_party_insurance = $data->thirdPartyInsurance ?? null;
    $incident->notes = $data->notes ?? null;
    $incident->workshop = $data->workshop ?? null;
    $incident->estimated_resolution_date = $data->estimatedResolutionDate ?? null;
    $incident->last_updated = date('Y-m-d H:i:s');

    if($incident->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Incident was created.", "id" => $incident->id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create incident."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create incident. Data is incomplete."));
}
?>