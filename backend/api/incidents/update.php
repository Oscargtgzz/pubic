<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Incident.php';

$database = new Database();
$db = $database->getConnection();

$incident = new Incident($db);

$data = json_decode(file_get_contents("php://input"));

$incident->id = $data->id;
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

if($incident->update()) {
    http_response_code(200);
    echo json_encode(array("message" => "Incident was updated."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update incident."));
}
?>