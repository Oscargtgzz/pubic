<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'brands');
$stmt = $catalog->read();
$num = $stmt->rowCount();

if($num > 0) {
    $brands_arr = array();
    $brands_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $brand_item = array(
            "id" => $id,
            "name" => $name
        );

        array_push($brands_arr["records"], $brand_item);
    }

    http_response_code(200);
    echo json_encode($brands_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>