<?php
class MaintenanceEvent {
    private $conn;
    private $table_name = "maintenance_events";

    public $id;
    public $vehicle_id;
    public $vehicle_plate;
    public $date;
    public $mileage;
    public $type;
    public $service_type;
    public $workshop;
    public $cost;
    public $notes;
    public $last_updated;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readByVehicle() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE vehicle_id = ? ORDER BY date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->vehicle_id);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    id=:id,
                    vehicle_id=:vehicle_id,
                    vehicle_plate=:vehicle_plate,
                    date=:date,
                    mileage=:mileage,
                    type=:type,
                    service_type=:service_type,
                    workshop=:workshop,
                    cost=:cost,
                    notes=:notes,
                    last_updated=:last_updated";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->vehicle_id = htmlspecialchars(strip_tags($this->vehicle_id));
        $this->vehicle_plate = htmlspecialchars(strip_tags($this->vehicle_plate));
        $this->service_type = htmlspecialchars(strip_tags($this->service_type));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":vehicle_id", $this->vehicle_id);
        $stmt->bindParam(":vehicle_plate", $this->vehicle_plate);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":mileage", $this->mileage);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":service_type", $this->service_type);
        $stmt->bindParam(":workshop", $this->workshop);
        $stmt->bindParam(":cost", $this->cost);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":last_updated", $this->last_updated);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    vehicle_id=:vehicle_id,
                    vehicle_plate=:vehicle_plate,
                    date=:date,
                    mileage=:mileage,
                    type=:type,
                    service_type=:service_type,
                    workshop=:workshop,
                    cost=:cost,
                    notes=:notes,
                    last_updated=:last_updated
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->vehicle_id = htmlspecialchars(strip_tags($this->vehicle_id));
        $this->vehicle_plate = htmlspecialchars(strip_tags($this->vehicle_plate));
        $this->service_type = htmlspecialchars(strip_tags($this->service_type));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":vehicle_id", $this->vehicle_id);
        $stmt->bindParam(":vehicle_plate", $this->vehicle_plate);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":mileage", $this->mileage);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":service_type", $this->service_type);
        $stmt->bindParam(":workshop", $this->workshop);
        $stmt->bindParam(":cost", $this->cost);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":last_updated", $this->last_updated);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>