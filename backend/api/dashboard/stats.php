<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Estadísticas de vehículos por estado
    $query = "SELECT status, COUNT(*) as count FROM vehicles GROUP BY status";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vehicle_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Servicios próximos (próximos 15 días)
    $query = "SELECT COUNT(*) as count FROM vehicles 
              WHERE next_service_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $upcoming_services = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Servicios vencidos
    $query = "SELECT COUNT(*) as count FROM vehicles 
              WHERE next_service_date < CURDATE() OR current_mileage >= next_service_mileage";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $overdue_services = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Verificaciones próximas (próximos 30 días)
    $query = "SELECT COUNT(*) as count FROM vehicles 
              WHERE next_verification_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $upcoming_verifications = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Siniestros activos
    $query = "SELECT COUNT(*) as count FROM incidents WHERE status != 'Cerrado'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $active_incidents = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Actividad reciente (últimos 5 eventos)
    $query = "
        (SELECT 'maintenance' as type, id, vehicle_id, vehicle_plate, date as event_date, 
                service_type as title, last_updated 
         FROM maintenance_events 
         ORDER BY last_updated DESC LIMIT 3)
        UNION ALL
        (SELECT 'incident' as type, id, vehicle_id, vehicle_plate, date as event_date, 
                description as title, last_updated 
         FROM incidents 
         ORDER BY last_updated DESC LIMIT 2)
        ORDER BY last_updated DESC LIMIT 5
    ";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recent_activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stats = array(
        "vehicleStats" => $vehicle_stats,
        "upcomingServices" => intval($upcoming_services),
        "overdueServices" => intval($overdue_services),
        "upcomingVerifications" => intval($upcoming_verifications),
        "activeIncidents" => intval($active_incidents),
        "recentActivity" => $recent_activity
    );

    http_response_code(200);
    echo json_encode($stats);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error retrieving dashboard stats: " . $e->getMessage()));
}
?>