<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Vehicle.php';

$database = new Database();
$db = $database->getConnection();

$vehicle = new Vehicle($db);

$vehicle->id = isset($_GET['id']) ? $_GET['id'] : die();

if($vehicle->readOne()) {
    $vehicle_arr = array(
        "id" => $vehicle->id,
        "plate" => $vehicle->plate,
        "brand" => $vehicle->brand,
        "model" => $vehicle->model,
        "year" => intval($vehicle->year),
        "status" => $vehicle->status,
        "currentMileage" => intval($vehicle->current_mileage),
        "nextServiceDate" => $vehicle->next_service_date,
        "nextServiceMileage" => $vehicle->next_service_mileage ? intval($vehicle->next_service_mileage) : null,
        "nextVerificationDate" => $vehicle->next_verification_date,
        "photoUrl" => $vehicle->photo_url,
        "serialNumber" => $vehicle->serial_number,
        "engineNumber" => $vehicle->engine_number,
        "color" => $vehicle->color,
        "insurancePolicy" => $vehicle->insurance_policy,
        "insuranceExpiryDate" => $vehicle->insurance_expiry_date,
        "circulationCard" => $vehicle->circulation_card,
        "notes" => $vehicle->notes,
        "lastUpdated" => $vehicle->last_updated,
        "acquisitionDate" => $vehicle->acquisition_date
    );

    http_response_code(200);
    echo json_encode($vehicle_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Vehicle not found."));
}
?>