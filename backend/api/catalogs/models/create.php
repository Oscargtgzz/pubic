<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'models');

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->brandId)) {
    $catalog->id = $data->id ?? uniqid();
    $catalog->name = $data->name;
    $catalog->brand_id = $data->brandId;

    if($catalog->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Model was created.", "id" => $catalog->id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create model."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create model. Data is incomplete."));
}
?>