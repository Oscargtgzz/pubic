<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Vehicle.php';

$database = new Database();
$db = $database->getConnection();

$vehicle = new Vehicle($db);

$data = json_decode(file_get_contents("php://input"));

$vehicle->id = $data->id;
$vehicle->plate = $data->plate;
$vehicle->brand = $data->brand;
$vehicle->model = $data->model;
$vehicle->year = $data->year;
$vehicle->status = $data->status;
$vehicle->current_mileage = $data->currentMileage;
$vehicle->next_service_date = $data->nextServiceDate ?? null;
$vehicle->next_service_mileage = $data->nextServiceMileage ?? null;
$vehicle->next_verification_date = $data->nextVerificationDate ?? null;
$vehicle->photo_url = $data->photoUrl ?? null;
$vehicle->serial_number = $data->serialNumber ?? null;
$vehicle->engine_number = $data->engineNumber ?? null;
$vehicle->color = $data->color ?? null;
$vehicle->insurance_policy = $data->insurancePolicy ?? null;
$vehicle->insurance_expiry_date = $data->insuranceExpiryDate ?? null;
$vehicle->circulation_card = $data->circulationCard ?? null;
$vehicle->notes = $data->notes ?? null;
$vehicle->last_updated = date('Y-m-d H:i:s');
$vehicle->acquisition_date = $data->acquisitionDate ?? null;

if($vehicle->update()) {
    http_response_code(200);
    echo json_encode(array("message" => "Vehicle was updated."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update vehicle."));
}
?>