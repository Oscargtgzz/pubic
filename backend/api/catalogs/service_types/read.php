<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'service_types');
$stmt = $catalog->read();
$num = $stmt->rowCount();

if($num > 0) {
    $service_types_arr = array();
    $service_types_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $service_type_item = array(
            "id" => $id,
            "name" => $name
        );

        array_push($service_types_arr["records"], $service_type_item);
    }

    http_response_code(200);
    echo json_encode($service_types_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>