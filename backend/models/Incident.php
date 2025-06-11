<?php
class Incident {
    private $conn;
    private $table_name = "incidents";

    public $id;
    public $vehicle_id;
    public $vehicle_plate;
    public $date;
    public $time;
    public $description;
    public $damage_level;
    public $status;
    public $location;
    public $third_party_name;
    public $third_party_vehicle_plate;
    public $third_party_insurance;
    public $notes;
    public $workshop;
    public $estimated_resolution_date;
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
                    time=:time,
                    description=:description,
                    damage_level=:damage_level,
                    status=:status,
                    location=:location,
                    third_party_name=:third_party_name,
                    third_party_vehicle_plate=:third_party_vehicle_plate,
                    third_party_insurance=:third_party_insurance,
                    notes=:notes,
                    workshop=:workshop,
                    estimated_resolution_date=:estimated_resolution_date,
                    last_updated=:last_updated";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->vehicle_id = htmlspecialchars(strip_tags($this->vehicle_id));
        $this->vehicle_plate = htmlspecialchars(strip_tags($this->vehicle_plate));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":vehicle_id", $this->vehicle_id);
        $stmt->bindParam(":vehicle_plate", $this->vehicle_plate);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":damage_level", $this->damage_level);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":third_party_name", $this->third_party_name);
        $stmt->bindParam(":third_party_vehicle_plate", $this->third_party_vehicle_plate);
        $stmt->bindParam(":third_party_insurance", $this->third_party_insurance);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":workshop", $this->workshop);
        $stmt->bindParam(":estimated_resolution_date", $this->estimated_resolution_date);
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
                    time=:time,
                    description=:description,
                    damage_level=:damage_level,
                    status=:status,
                    location=:location,
                    third_party_name=:third_party_name,
                    third_party_vehicle_plate=:third_party_vehicle_plate,
                    third_party_insurance=:third_party_insurance,
                    notes=:notes,
                    workshop=:workshop,
                    estimated_resolution_date=:estimated_resolution_date,
                    last_updated=:last_updated
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->vehicle_id = htmlspecialchars(strip_tags($this->vehicle_id));
        $this->vehicle_plate = htmlspecialchars(strip_tags($this->vehicle_plate));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":vehicle_id", $this->vehicle_id);
        $stmt->bindParam(":vehicle_plate", $this->vehicle_plate);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":damage_level", $this->damage_level);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":third_party_name", $this->third_party_name);
        $stmt->bindParam(":third_party_vehicle_plate", $this->third_party_vehicle_plate);
        $stmt->bindParam(":third_party_insurance", $this->third_party_insurance);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":workshop", $this->workshop);
        $stmt->bindParam(":estimated_resolution_date", $this->estimated_resolution_date);
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