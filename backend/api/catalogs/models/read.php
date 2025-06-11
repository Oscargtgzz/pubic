<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'models');

// Si se proporciona brand_id, filtrar por marca
if(isset($_GET['brand_id'])) {
    $catalog->brand_id = $_GET['brand_id'];
    $stmt = $catalog->readByBrand();
} else {
    $stmt = $catalog->read();
}

$num = $stmt->rowCount();

if($num > 0) {
    $models_arr = array();
    $models_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $model_item = array(
            "id" => $id,
            "name" => $name,
            "brandId" => $brand_id
        );

        array_push($models_arr["records"], $model_item);
    }

    http_response_code(200);
    echo json_encode($models_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>