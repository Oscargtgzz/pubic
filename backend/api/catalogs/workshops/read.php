<?php
include_once '../../../config/cors.php';
include_once '../../../config/database.php';
include_once '../../../models/Catalog.php';

$database = new Database();
$db = $database->getConnection();

$catalog = new Catalog($db, 'workshops');
$stmt = $catalog->read();
$num = $stmt->rowCount();

if($num > 0) {
    $workshops_arr = array();
    $workshops_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $workshop_item = array(
            "id" => $id,
            "name" => $name,
            "managerName" => $manager_name,
            "address" => $address,
            "city" => $city,
            "state" => $state,
            "phone" => $phone,
            "email" => $email
        );

        array_push($workshops_arr["records"], $workshop_item);
    }

    http_response_code(200);
    echo json_encode($workshops_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>