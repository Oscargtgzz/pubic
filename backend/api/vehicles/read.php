<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Vehicle.php';

$database = new Database();
$db = $database->getConnection();

$vehicle = new Vehicle($db);
$stmt = $vehicle->read();
$num = $stmt->rowCount();

if($num > 0) {
    $vehicles_arr = array();
    $vehicles_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $vehicle_item = array(
            "id" => $id,
            "plate" => $plate,
            "brand" => $brand,
            "model" => $model,
            "year" => intval($year),
            "status" => $status,
            "currentMileage" => intval($current_mileage),
            "nextServiceDate" => $next_service_date,
            "nextServiceMileage" => $next_service_mileage ? intval($next_service_mileage) : null,
            "nextVerificationDate" => $next_verification_date,
            "photoUrl" => $photo_url,
            "serialNumber" => $serial_number,
            "engineNumber" => $engine_number,
            "color" => $color,
            "insurancePolicy" => $insurance_policy,
            "insuranceExpiryDate" => $insurance_expiry_date,
            "circulationCard" => $circulation_card,
            "notes" => $notes,
            "lastUpdated" => $last_updated,
            "acquisitionDate" => $acquisition_date
        );

        array_push($vehicles_arr["records"], $vehicle_item);
    }

    http_response_code(200);
    echo json_encode($vehicles_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>