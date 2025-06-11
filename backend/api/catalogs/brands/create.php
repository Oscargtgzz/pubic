<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'brands');

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name)) {
    $catalog->id = $data->id ?? uniqid();
    $catalog->name = $data->name;

    if($catalog->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Brand was created.", "id" => $catalog->id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create brand."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create brand. Data is incomplete."));
}
?>