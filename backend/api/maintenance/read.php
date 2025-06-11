<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/MaintenanceEvent.php';

$database = new Database();
$db = $database->getConnection();

$maintenance = new MaintenanceEvent($db);

// Si se proporciona vehicle_id, filtrar por vehículo
if(isset($_GET['vehicle_id'])) {
    $maintenance->vehicle_id = $_GET['vehicle_id'];
    $stmt = $maintenance->readByVehicle();
} else {
    $stmt = $maintenance->read();
}

$num = $stmt->rowCount();

if($num > 0) {
    $maintenance_arr = array();
    $maintenance_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $maintenance_item = array(
            "id" => $id,
            "vehicleId" => $vehicle_id,
            "vehiclePlate" => $vehicle_plate,
            "date" => $date,
            "mileage" => intval($mileage),
            "type" => $type,
            "serviceType" => $service_type,
            "workshop" => $workshop,
            "cost" => $cost ? floatval($cost) : null,
            "notes" => $notes,
            "lastUpdated" => $last_updated
        );

        array_push($maintenance_arr["records"], $maintenance_item);
    }

    http_response_code(200);
    echo json_encode($maintenance_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>