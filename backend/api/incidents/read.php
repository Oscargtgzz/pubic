<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Incident.php';

$database = new Database();
$db = $database->getConnection();

$incident = new Incident($db);

// Si se proporciona vehicle_id, filtrar por vehículo
if(isset($_GET['vehicle_id'])) {
    $incident->vehicle_id = $_GET['vehicle_id'];
    $stmt = $incident->readByVehicle();
} else {
    $stmt = $incident->read();
}

$num = $stmt->rowCount();

if($num > 0) {
    $incidents_arr = array();
    $incidents_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $incident_item = array(
            "id" => $id,
            "vehicleId" => $vehicle_id,
            "vehiclePlate" => $vehicle_plate,
            "date" => $date,
            "time" => $time,
            "description" => $description,
            "damageLevel" => $damage_level,
            "status" => $status,
            "location" => $location,
            "thirdPartyName" => $third_party_name,
            "thirdPartyVehiclePlate" => $third_party_vehicle_plate,
            "thirdPartyInsurance" => $third_party_insurance,
            "notes" => $notes,
            "workshop" => $workshop,
            "estimatedResolutionDate" => $estimated_resolution_date,
            "lastUpdated" => $last_updated
        );

        array_push($incidents_arr["records"], $incident_item);
    }

    http_response_code(200);
    echo json_encode($incidents_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>